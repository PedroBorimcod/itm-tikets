import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  event_id: string;
  ticket_type_id: string;
  quantity: number;
  price: number;
  event_title: string;
  ticket_type_name: string;
}

interface HublaCheckoutRequest {
  product_id: string;
  offer_id: string;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    document?: string;
    phone?: string;
  };
  metadata?: {
    order_id: string;
    event_id: string;
  };
}

serve(async (req) => {
  console.log("Create Hubla payment request received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Get request body
    const { cart, customer_info } = await req.json();
    
    if (!cart || cart.length === 0) {
      throw new Error("Cart is empty");
    }

    // Calculate total
    const totalAmount = cart.reduce((sum: number, item: CartItem) => 
      sum + (item.price * item.quantity), 0
    );

    // Service fee (5%)
    const serviceFee = totalAmount * 0.05;
    const finalAmount = totalAmount + serviceFee;

    // Create Supabase service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create order
    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: finalAmount,
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message}`);
    }

    // Create order items
    const orderItems = cart.map((item: CartItem) => ({
      order_id: order.id,
      event_id: item.event_id,
      ticket_type_id: item.ticket_type_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseService
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Get user profile for better customer data
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();

    const fullName = profile?.full_name || customer_info?.name || "";
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    // Create Hubla checkout session
    const hublaApiKey = Deno.env.get("HUBLA_API_KEY");
    const hublaProductId = Deno.env.get("HUBLA_PRODUCT_ID");
    const hublaOfferId = Deno.env.get("HUBLA_OFFER_ID");

    if (!hublaApiKey || !hublaProductId || !hublaOfferId) {
      throw new Error("Hubla configuration missing");
    }

    const checkoutData: HublaCheckoutRequest = {
      product_id: hublaProductId,
      offer_id: hublaOfferId,
      customer: {
        email: user.email,
        first_name: firstName || "Cliente",
        last_name: lastName || "",
        document: customer_info?.document,
        phone: profile?.phone || customer_info?.phone,
      },
      metadata: {
        order_id: order.id,
        event_id: cart[0].event_id, // Use first event as primary
      },
    };

    // Make request to Hubla API
    const hublaResponse = await fetch("https://api.hub.la/v1/checkout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hublaApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData),
    });

    if (!hublaResponse.ok) {
      const errorText = await hublaResponse.text();
      throw new Error(`Hubla API error: ${hublaResponse.status} - ${errorText}`);
    }

    const hublaData = await hublaResponse.json();

    // Update order with Hubla reference
    await supabaseService
      .from("orders")
      .update({ 
        stripe_session_id: hublaData.id || hublaData.checkout_id,
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id);

    console.log("Hubla checkout created successfully:", hublaData);

    return new Response(JSON.stringify({
      checkout_url: hublaData.checkout_url || hublaData.url,
      order_id: order.id,
      total_amount: finalAmount,
      service_fee: serviceFee,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating Hubla payment:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create payment" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});