
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId || !user) {
        navigate('/');
        return;
      }

      try {
        // Fetch order details
        const { data: order, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              events (title),
              ticket_types (name)
            )
          `)
          .eq('stripe_session_id', sessionId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching order:', error);
          return;
        }

        setOrderDetails(order);
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Pagamento Confirmado! 🎉
            </h1>
            <p className="text-muted-foreground">
              Seu pagamento foi processado com sucesso. Você receberá seus ingressos por email em instantes.
            </p>
          </div>

          {orderDetails && (
            <div className="bg-muted rounded-lg p-4 text-left">
              <h3 className="font-semibold mb-2">Detalhes do Pedido:</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Pedido: {orderDetails.id.slice(0, 8)}...
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                Total: R$ {orderDetails.total_amount.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {orderDetails.status === 'completed' ? 'Confirmado' : 'Processando'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/my-tickets')} 
              className="w-full"
            >
              Ver Meus Ingressos
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Verifique sua caixa de entrada e spam para o email com seus QR codes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
