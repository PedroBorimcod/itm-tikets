
import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type TicketType = Tables<'ticket_types'>;

interface PurchaseTicketData {
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
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          ticketTypeId: purchaseData.ticketTypeId,
          quantity: purchaseData.quantity,
          price: purchaseData.price,
          eventTitle: purchaseData.eventTitle
        }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecionando para pagamento",
          description: "Você será redirecionado para o Stripe em uma nova aba."
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
