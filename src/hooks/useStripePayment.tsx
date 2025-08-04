import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface CartItem {
  event_id: string;
  ticket_type_id: string;
  quantity: number;
  price: number;
  event_title: string;
  ticket_type_name: string;
}

interface StripePaymentResponse {
  url: string;
  orderId: string;
  sessionId: string;
}

export const useStripePayment = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createPayment = async (cart: CartItem[]): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer o pagamento",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-stripe-payment", {
        body: {
          cartItems: cart,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const response: StripePaymentResponse = data;
      
      if (!response.url) {
        throw new Error("URL de checkout não recebida");
      }

      toast({
        title: "Redirecionando para pagamento",
        description: "Você será redirecionado para o Stripe para finalizar o pagamento",
      });

      // Redirect to Stripe checkout
      window.location.href = response.url;
      
      return response.orderId;

    } catch (error: any) {
      console.error("Error creating Stripe payment:", error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Erro ao processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPayment,
    loading,
  };
};