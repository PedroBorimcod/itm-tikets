import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePaymentSimulation(orderId: string | null) {
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();

  const simulatePayment = async () => {
    if (!orderId) return;

    setIsSimulating(true);
    try {
      // Simular processamento do pagamento (3-5 segundos)
      const delay = Math.random() * 2000 + 3000; // 3-5 segundos
      
      await new Promise(resolve => setTimeout(resolve, delay));

      // Atualizar status do pedido para pago
      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId);

      if (error) throw error;

      // Enviar email de sucesso com QR codes
      await supabase.functions.invoke('send-ticket-email', {
        body: {
          orderId,
          type: 'success'
        }
      });

      toast({
        title: "Pagamento confirmado! 🎉",
        description: "Email enviado com seus QR codes únicos.",
      });

      return true;
    } catch (error) {
      console.error('Payment simulation error:', error);
      toast({
        title: "Erro no pagamento",
        description: "Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSimulating(false);
    }
  };

  return {
    simulatePayment,
    isSimulating
  };
}