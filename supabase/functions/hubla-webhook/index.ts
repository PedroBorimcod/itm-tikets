import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HublaInvoiceEvent {
  type: string;
  event: {
    product: {
      id: string;
      name: string;
    };
    invoice: {
      id: string;
      subscriptionId: string;
      payerId: string;
      sellerId: string;
      payer: {
        id: string;
        firstName: string;
        lastName: string;
        document: string;
        email: string;
        phone: string;
      };
      status: string;
      totalValue: number;
      currency: string;
      paymentMethod: string;
      metadata?: {
        order_id?: string;
        event_id?: string;
      };
    };
  };
}

serve(async (req) => {
  console.log("Hubla webhook received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const payload: HublaInvoiceEvent = await req.json();
    console.log("Webhook payload:", JSON.stringify(payload, null, 2));

    // Process different event types
    switch (payload.type) {
      case "invoice.payment_succeeded":
      case "invoice.paid":
        await handlePaymentSuccess(supabaseService, payload);
        break;
      
      case "invoice.payment_failed":
        await handlePaymentFailed(supabaseService, payload);
        break;
      
      case "invoice.created":
        console.log("Invoice created:", payload.event.invoice.id);
        break;
      
      default:
        console.log("Unhandled event type:", payload.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handlePaymentSuccess(supabaseService: any, payload: HublaInvoiceEvent) {
  console.log("Processing successful payment");
  
  const { invoice } = payload.event;
  const orderId = invoice.metadata?.order_id;
  
  if (!orderId) {
    console.log("No order_id found in metadata");
    return;
  }

  try {
    // Update order status to completed
    const { error: orderError } = await supabaseService
      .from("orders")
      .update({ 
        status: "completed",
        stripe_session_id: invoice.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (orderError) {
      console.error("Error updating order:", orderError);
      return;
    }

    // Generate QR codes for order items
    const { data: orderItems, error: itemsError } = await supabaseService
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (itemsError || !orderItems) {
      console.error("Error fetching order items:", itemsError);
      return;
    }

    // Generate QR codes for each ticket
    for (const item of orderItems) {
      const qrCodes = [];
      for (let i = 0; i < item.quantity; i++) {
        const ticketId = `${item.id}-${i + 1}`;
        qrCodes.push(ticketId);
      }

      // Update order item with QR codes
      const { error: updateError } = await supabaseService
        .from("order_items")
        .update({ qr_code: qrCodes })
        .eq("id", item.id);

      if (updateError) {
        console.error("Error updating QR codes:", updateError);
      }
    }

    // Send confirmation email with tickets
    try {
      await supabaseService.functions.invoke("send-ticket-email", {
        body: {
          email: invoice.payer.email,
          userName: `${invoice.payer.firstName} ${invoice.payer.lastName}`,
          orderId: orderId,
        },
      });
    } catch (emailError) {
      console.error("Error sending ticket email:", emailError);
    }

    console.log("Payment processed successfully for order:", orderId);

  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

async function handlePaymentFailed(supabaseService: any, payload: HublaInvoiceEvent) {
  console.log("Processing failed payment");
  
  const { invoice } = payload.event;
  const orderId = invoice.metadata?.order_id;
  
  if (!orderId) {
    console.log("No order_id found in metadata");
    return;
  }

  try {
    // Update order status to failed
    const { error: orderError } = await supabaseService
      .from("orders")
      .update({ 
        status: "failed",
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (orderError) {
      console.error("Error updating order:", orderError);
    }

    console.log("Payment failure processed for order:", orderId);

  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}