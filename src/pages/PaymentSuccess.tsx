
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowLeft, Ticket } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handleSuccessfulPayment = async () => {
      if (sessionId) {
        // Limpar o carrinho após pagamento bem-sucedido
        await clearCart();
        
        toast({
          title: "Pagamento realizado com sucesso!",
          description: "Seus ingressos foram processados. Você receberá um email de confirmação.",
        });
      }
      setLoading(false);
    };

    handleSuccessfulPayment();
  }, [sessionId, clearCart, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Processando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Pagamento Realizado com Sucesso!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-6 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <Ticket className="h-8 w-8 text-primary mr-2" />
                  <h3 className="text-lg font-bold">Seus Ingressos</h3>
                </div>
                <p className="text-muted-foreground">
                  Seus ingressos foram processados com sucesso! Você receberá um email de confirmação 
                  com todos os detalhes e QR codes para entrada nos eventos.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  ID da Sessão: <span className="font-mono">{sessionId}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Em caso de dúvidas, entre em contato com nosso suporte citando o ID da sessão.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Início
                </Button>
                <Button 
                  onClick={() => navigate('/my-tickets')}
                  className="flex-1"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Meus Ingressos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
