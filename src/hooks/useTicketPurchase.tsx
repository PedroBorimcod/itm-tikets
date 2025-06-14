
import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type TicketType = Tables<'ticket_types'>;

interface PurchaseTicketData {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  price: number;
  eventTitle: string;
}

export function useTicketPurchase() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const purchaseTickets = async (purchaseData: PurchaseTicketData) => {
    if (!user) return;

    setLoading(true);
    try {
      // Ajustar para o formato esperado pelo edge function: { cartItems: [...] }
      const cartItems = [
        {
          event_id: purchaseData.eventId,
          title: purchaseData.eventTitle,
          price: purchaseData.price,
          quantity: purchaseData.quantity,
        },
      ];
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { cartItems },
      });

      if (error) throw error;

      if (data?.url) {
        // Redireciona na mesma aba (ou troque para window.open se quiser nova aba)
        window.location.href = data.url;
        toast({
          title: "Redirecionando para pagamento",
          description: "Você será levado ao Stripe.",
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Erro no pagamento",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { purchaseTickets, loading };
}

