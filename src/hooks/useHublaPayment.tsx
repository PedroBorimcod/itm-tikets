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

export interface CustomerInfo {
  name?: string;
  document?: string;
  phone?: string;
}

interface HublaPaymentResponse {
  checkout_url: string;
  order_id: string;
  total_amount: number;
  service_fee: number;
}

export const useHublaPayment = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createPayment = async (cart: CartItem[], customerInfo?: CustomerInfo): Promise<string | null> => {
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
      const { data, error } = await supabase.functions.invoke("create-hubla-payment", {
        body: {
          cart,
          customer_info: customerInfo,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const response: HublaPaymentResponse = data;
      
      if (!response.checkout_url) {
        throw new Error("URL de checkout não recebida");
      }

      toast({
        title: "Redirecionando para pagamento",
        description: "Você será redirecionado para o Hubla para finalizar o pagamento",
      });

      // Redirect to Hubla checkout
      window.location.href = response.checkout_url;
      
      return response.order_id;

    } catch (error: any) {
      console.error("Error creating Hubla payment:", error);
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