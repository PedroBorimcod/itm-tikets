
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

    // Gerar código PIX aleatório
    const generatePixCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Calcular valores com taxa
    let totalAmount = 0;
    let totalServiceFee = 0;

    cartItems.forEach((item: any) => {
      const itemTotal = Number(item.price) * item.quantity;
      const serviceFee = itemTotal * SERVICE_FEE_PERCENT;
      totalAmount += itemTotal + serviceFee;
      totalServiceFee += serviceFee;
    });

    const pixCode = generatePixCode();
    const pixData = {
      code: pixCode,
      amount: totalAmount,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
    };

    // Criar o pedido no Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: "awaiting_payment",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Erro ao criar pedido");
    }

    // Criar os itens do pedido
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

    console.log("PIX payment created:", pixCode);
    console.log("Order created:", order.id);
    console.log("Total service fee calculated (8%):", totalServiceFee);

    return new Response(JSON.stringify({ 
      pixData,
      orderId: order.id,
      totalAmount,
      serviceFee: totalServiceFee
    }), {
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
