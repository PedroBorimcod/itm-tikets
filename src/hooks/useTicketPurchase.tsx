
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
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const purchaseTickets = async (purchaseData: PurchaseTicketData) => {
    if (!user) return;

    setLoading(true);
    try {
      // Criar pedido PIX local
      const totalAmount = (purchaseData.price * purchaseData.quantity) * 1.08; // 8% taxa de serviço
      
      // Gerar código PIX simulado
      const pixCode = generatePixCode();
      
      // Salvar pedido no banco
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Salvar itens do pedido
      await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          event_id: purchaseData.eventId,
          ticket_type_id: purchaseData.ticketTypeId,
          quantity: purchaseData.quantity,
          price: purchaseData.price
        });

      setPixData({
        totalAmount,
        eventTitle: purchaseData.eventTitle,
        quantity: purchaseData.quantity,
        pixCode,
        orderId: order.id
      });
      
      setCurrentOrderId(order.id);
      setShowPixModal(true);
      
      toast({
        title: "Pedido criado com sucesso!",
        description: "Complete o pagamento via PIX em até 2 minutos.",
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Erro ao criar pedido",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePixCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const closePixModal = () => {
    setShowPixModal(false);
    setPixData(null);
    setCurrentOrderId(null);
  };

  const cancelOrder = async () => {
    if (!currentOrderId) return;

    try {
      // Cancelar o pedido no banco de dados
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', currentOrderId);

      if (error) {
        console.error('Error cancelling order:', error);
      }

      toast({
        title: "Pedido cancelado",
        description: "O tempo para pagamento expirou.",
        variant: "destructive"
      });

      closePixModal();
    } catch (error) {
      console.error('Error in cancelOrder:', error);
    }
  };

  return { 
    purchaseTickets, 
    loading, 
    showPixModal, 
    pixData, 
    closePixModal,
    cancelOrder
  };
}

