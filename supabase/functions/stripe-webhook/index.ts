import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    // Verify webhook signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    console.log("Received Stripe webhook event:", event.type);

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("Processing completed checkout session:", session.id);

      // Update order status
      const { data: order, error: updateError } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("stripe_session_id", session.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating order:", updateError);
        throw updateError;
      }

      if (order) {
        console.log("Order updated successfully:", order.id);

        // Generate QR codes for tickets
        const { data: orderItems, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);

        if (itemsError) {
          console.error("Error fetching order items:", itemsError);
        } else {
          // Generate QR codes for each ticket
          for (const item of orderItems) {
            const qrCodes = [];
            for (let i = 0; i < item.quantity; i++) {
              const ticketId = crypto.randomUUID();
              qrCodes.push(ticketId);
            }

            // Update order item with QR codes
            await supabase
              .from("order_items")
              .update({ qr_code: qrCodes })
              .eq("id", item.id);
          }

          // Send PDF ticket email automatically
          await supabase.functions.invoke('generate-ticket-pdf', {
            body: {
              orderId: order.id,
              email: session.customer_details?.email || session.metadata?.email
            }
          });

          console.log("QR codes generated and email sent for order:", order.id);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});