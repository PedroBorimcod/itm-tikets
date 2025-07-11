
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SERVICE_FEE_PERCENT = 0.08;

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
    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    // Get request body
    const { cartItems } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Carrinho vazio");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calcule valores com taxa
    let totalAmount = 0;
    let totalServiceFee = 0;

    // Cada ingresso: aplica 8% taxa por ingresso
    const lineItems = cartItems.map((item: any) => {
      const priceWithFee = Number(item.price) * (1 + SERVICE_FEE_PERCENT);
      const unit_amount = Math.round(priceWithFee * 100); // em centavos
      const serviceFee = Number(item.price) * SERVICE_FEE_PERCENT * item.quantity;
      totalAmount += unit_amount * item.quantity / 100; // soma full (com taxa)
      totalServiceFee += serviceFee;

      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: item.title,
            description: `Ingresso para ${item.title} (com taxa de serviço)`,
          },
          unit_amount, // já inclui taxa
        },
        quantity: item.quantity,
      };
    });

    // Crie a sessão de pagamento
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      metadata: {
        user_id: user.id,
        total_amount: totalAmount.toFixed(2),
        service_fee: totalServiceFee.toFixed(2),
      },
    });

    // Crie o pedido no Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        total_amount: totalAmount,
        status: "pending",
        // O valor cobrado já inclui a taxa de serviço
        // (se quiser registrar a taxa separada, pode-se adicionar uma coluna "service_fee")
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Erro ao criar pedido");
    }

    // Crie os itens do pedido
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      event_id: item.event_id,
      quantity: item.quantity,
      price: Number(item.price) * (1 + SERVICE_FEE_PERCENT), // salva já com taxa
    }));

    const { error: itemsError } = await supabaseService
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw new Error("Erro ao criar itens do pedido");
    }

    console.log("Payment session created:", session.id);
    console.log("Order created:", order.id);
    console.log("Total service fee calculated (8%):", totalServiceFee);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
