import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";
import QRCode from "npm:qrcode@1.5.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketEmailRequest {
  orderId: string;
  type: 'success' | 'cancelled';
}

const generateQRCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, type }: TicketEmailRequest = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados do pedido e perfil separadamente
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', order.user_id)
      .single();


    // Buscar itens do pedido
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        events (title, date, time, location),
        ticket_types (name)
      `)
      .eq('order_id', orderId);

    if (itemsError || !orderItems?.length) {
      console.error('Order items not found:', itemsError);
      return new Response(JSON.stringify({ error: 'Order items not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Buscar email do usuário
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(order.user_id);
    
    if (userError || !user?.email) {
      console.error('User not found:', userError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (type === 'success') {
      // Gerar QR codes únicos para cada ingresso
      const qrCodes: string[] = [];
      const qrImages: string[] = [];
      
      for (let i = 0; i < orderItems[0].quantity; i++) {
        const code = generateQRCode();
        qrCodes.push(code);
        
        // Gerar imagem do QR code em base64
        try {
          const qrImage = await QRCode.toDataURL(code, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          qrImages.push(qrImage);
        } catch (error) {
          console.error('Error generating QR code image:', error);
          qrImages.push('');
        }
      }

      // Salvar QR codes no banco
      await supabase
        .from('order_items')
        .update({ qr_code: qrCodes })
        .eq('id', orderItems[0].id);

      const event = orderItems[0].events;
      const ticketType = orderItems[0].ticket_types;

      // Email de sucesso com QR codes visuais
      const qrCodesHtml = qrCodes.map((code, index) => 
        `<div style="margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 12px; text-align: center;">
          <h4 style="margin-top: 0; color: #2563eb;">Ingresso ${index + 1}</h4>
          ${qrImages[index] ? 
            `<img src="${qrImages[index]}" alt="QR Code ${code}" style="max-width: 200px; height: auto; margin: 10px 0;" />` : 
            `<div style="background: #e5e7eb; padding: 40px; border-radius: 8px; margin: 10px 0;">QR Code não disponível</div>`
          }
          <div style="margin-top: 10px;">
            <strong>Código:</strong><br>
            <code style="font-size: 14px; font-weight: bold; background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${code}</code>
          </div>
        </div>`
      ).join('');

      await resend.emails.send({
        from: "EventTickets <onboarding@resend.dev>",
        to: [user.email],
        subject: `✅ Ingressos confirmados - ${event.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22c55e;">🎉 Pagamento Confirmado!</h1>
            <p>Olá ${profile?.full_name || 'Cliente'},</p>
            
            <p>Seu pagamento foi processado com sucesso! Aqui estão seus ingressos:</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${event.title}</h3>
              <p><strong>Data:</strong> ${new Date(event.date).toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> ${event.time}</p>
              <p><strong>Local:</strong> ${event.location}</p>
              <p><strong>Tipo:</strong> ${ticketType.name}</p>
              <p><strong>Quantidade:</strong> ${orderItems[0].quantity}</p>
            </div>

            <h3>Seus QR Codes:</h3>
            <p><strong>⚠️ IMPORTANTE:</strong> Cada QR Code pode ser usado apenas UMA VEZ. Escaneie na entrada do evento.</p>
            ${qrCodesHtml}
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              Apresente estes QR codes na entrada do evento.<br>
              Pedido #${orderId}
            </p>
          </div>
        `,
      });

    } else if (type === 'cancelled') {
      const event = orderItems[0].events;
      
      // Email de cancelamento
      await resend.emails.send({
        from: "EventTickets <onboarding@resend.dev>",
        to: [user.email],
        subject: `❌ Pedido cancelado - ${event.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">⏰ Tempo Esgotado</h1>
            <p>Olá ${profile?.full_name || 'Cliente'},</p>
            
            <p>Infelizmente seu pedido foi cancelado automaticamente porque o pagamento não foi efetuado dentro do prazo de 2 minutos.</p>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #dc2626;">Pedido Cancelado</h3>
              <p><strong>Evento:</strong> ${event.title}</p>
              <p><strong>Valor:</strong> R$ ${order.total_amount.toFixed(2)}</p>
              <p><strong>Motivo:</strong> Pagamento não efetuado no prazo</p>
            </div>

            <p>Você pode tentar novamente fazendo um novo pedido. Os ingressos voltaram a estar disponíveis.</p>
            
            <p style="color: #666; font-size: 12px;">Pedido #${orderId}</p>
          </div>
        `,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Error in send-ticket-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);