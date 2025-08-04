import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketPdfRequest {
  orderId?: string;
  email: string;
  orderItemId?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, email, orderItemId }: TicketPdfRequest = await req.json();
    
    console.log("Generating PDF for:", { orderId, email, orderItemId });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let orderItems;
    let orderData;

    if (orderId) {
      // Get order data
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .single();

      if (orderError) {
        throw new Error("Order not found");
      }

      orderData = order;
      orderItems = order.order_items;
    } else if (orderItemId) {
      // Get specific order item
      const { data: item, error: itemError } = await supabase
        .from("order_items")
        .select("*, orders(*)")
        .eq("id", orderItemId)
        .single();

      if (itemError) {
        throw new Error("Order item not found");
      }

      orderData = item.orders;
      orderItems = [item];
    } else {
      throw new Error("Either orderId or orderItemId is required");
    }

    // Get event details
    const eventIds = [...new Set(orderItems.map((item: any) => item.event_id))];
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .in("id", eventIds);

    if (eventsError) {
      throw new Error("Error fetching event details");
    }

    // Get ticket types
    const ticketTypeIds = [...new Set(orderItems.map((item: any) => item.ticket_type_id))];
    const { data: ticketTypes, error: ticketTypesError } = await supabase
      .from("ticket_types")
      .select("*")
      .in("id", ticketTypeIds);

    if (ticketTypesError) {
      throw new Error("Error fetching ticket types");
    }

    // Generate PDF content using HTML/CSS
    const generateTicketHTML = (orderItem: any, event: any, ticketType: any, qrCode: string, ticketNumber: number) => {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .ticket { 
              border: 2px solid #333; 
              border-radius: 10px; 
              padding: 20px; 
              margin-bottom: 30px; 
              background: linear-gradient(45deg, #f0f0f0, #ffffff);
              page-break-after: always;
            }
            .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 15px; margin-bottom: 15px; }
            .event-title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
            .event-details { font-size: 14px; color: #666; }
            .ticket-info { display: flex; justify-content: space-between; margin: 20px 0; }
            .qr-code { text-align: center; margin: 20px 0; }
            .qr-text { font-family: monospace; font-size: 12px; word-break: break-all; }
            .footer { text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div class="event-title">${event.title}</div>
              <div class="event-details">
                Data: ${new Date(event.date).toLocaleDateString('pt-BR')} às ${event.time}<br>
                Local: ${event.location}
              </div>
            </div>
            
            <div class="ticket-info">
              <div>
                <strong>Tipo:</strong> ${ticketType.name}<br>
                <strong>Preço:</strong> R$ ${ticketType.price}<br>
                <strong>Ingresso:</strong> ${ticketNumber} de ${orderItem.quantity}
              </div>
              <div>
                <strong>Pedido:</strong> ${orderData.id.substring(0, 8)}<br>
                <strong>Data Compra:</strong> ${new Date(orderData.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
            
            <div class="qr-code">
              <div style="font-size: 48px; margin: 10px 0;">📱</div>
              <div class="qr-text">QR Code: ${qrCode}</div>
              <div style="font-size: 12px; margin-top: 10px;">Apresente este código na entrada do evento</div>
            </div>
            
            <div class="footer">
              Este ingresso é válido apenas para a data e horário especificados.<br>
              Não é permitida a transferência ou revenda.
            </div>
          </div>
        </body>
        </html>
      `;
    };

    // Generate all tickets HTML
    let allTicketsHTML = '';
    for (const orderItem of orderItems) {
      const event = events.find(e => e.id === orderItem.event_id);
      const ticketType = ticketTypes.find(tt => tt.id === orderItem.ticket_type_id);
      
      if (event && ticketType && orderItem.qr_code) {
        for (let i = 0; i < orderItem.qr_code.length; i++) {
          allTicketsHTML += generateTicketHTML(orderItem, event, ticketType, orderItem.qr_code[i], i + 1);
        }
      }
    }

    // Convert HTML to PDF using a simple text representation for now
    // In a real implementation, you would use a proper PDF library
    const pdfContent = `
INGRESSO ELETRÔNICO
==================

${orderItems.map((orderItem: any) => {
  const event = events.find(e => e.id === orderItem.event_id);
  const ticketType = ticketTypes.find(tt => tt.id === orderItem.ticket_type_id);
  
  return `
Evento: ${event?.title}
Data: ${new Date(event?.date).toLocaleDateString('pt-BR')} às ${event?.time}
Local: ${event?.location}
Tipo: ${ticketType?.name}
Preço: R$ ${ticketType?.price}
Quantidade: ${orderItem.quantity}

QR Codes:
${orderItem.qr_code?.map((qr: string, index: number) => `${index + 1}. ${qr}`).join('\n')}
`;
}).join('\n\n')}

Pedido: ${orderData.id}
Data da Compra: ${new Date(orderData.created_at).toLocaleDateString('pt-BR')}

Apresente os códigos QR na entrada do evento.
`;

    // Send email with ticket
    const { error: emailError } = await resend.emails.send({
      from: "Ingressos <onboarding@resend.dev>",
      to: [email],
      subject: `Seus ingressos - ${events[0]?.title}`,
      html: allTicketsHTML,
      text: pdfContent,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error("Failed to send email");
    }

    console.log("Ticket PDF sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Ticket PDF sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error generating ticket PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});