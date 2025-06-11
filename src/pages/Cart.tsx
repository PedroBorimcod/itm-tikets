
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (eventId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(eventId);
    } else {
      await updateQuantity(eventId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          cartItems: cartItems.map(item => ({
            event_id: item.event_id,
            quantity: item.quantity,
            price: item.events?.price || 0,
            title: item.events?.title || ''
          }))
        }
      });

      if (error) throw error;

      if (data.url) {
        // Abrir Stripe checkout em nova aba
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Erro no pagamento",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à tela inicial
          </Button>
          <h1 className="text-3xl font-black">{t('cart.title')}</h1>
        </div>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">{t('cart.empty')}</p>
              <Button className="mt-4" onClick={() => navigate('/')}>
                Ver Eventos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={item.events?.image || "/placeholder.svg"} 
                        alt={item.events?.title || "Evento"}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{item.events?.title || "Evento não encontrado"}</h3>
                        <p className="text-muted-foreground">{item.events?.location || ""}</p>
                        <Badge variant="secondary">{item.events?.category || ""}</Badge>
                        <div className="flex items-center mt-2 gap-3">
                          <span className="text-sm font-medium">Quantidade:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.event_id.toString(), item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-bold text-lg px-3">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.event_id.toString(), item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Preço unitário:</p>
                        <p className="text-lg font-bold text-primary">
                          R$ {(item.events?.price || 0).toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Subtotal:</p>
                        <p className="text-xl font-bold text-primary">
                          R$ {((item.events?.price || 0) * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.event_id.toString())}
                          className="mt-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.events?.title || "Evento"} (x{item.quantity})</span>
                          <span>R$ {((item.events?.price || 0) * item.quantity).toFixed(2).replace('.', ',')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>{t('cart.total')}</span>
                        <span>R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleCheckout}
                        disabled={loading}
                      >
                        {loading ? 'Processando...' : 'Finalizar Compra com Stripe'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="sm"
                        onClick={clearCart}
                      >
                        Limpar Carrinho
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
