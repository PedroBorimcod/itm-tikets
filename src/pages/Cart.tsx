
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + (item.events?.price || 0), 0);

  const generateQRCode = () => {
    return `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;

    setLoading(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'completed'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with QR codes
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        event_id: item.event_id,
        quantity: item.quantity || 1,
        price: item.events?.price || 0,
        qr_code: generateQRCode()
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update sold tickets
      for (const item of cartItems) {
        await supabase
          .from('events')
          .update({
            sold_tickets: (item.events?.sold_tickets || 0) + (item.quantity || 1)
          })
          .eq('id', item.event_id);
      }

      // Clear cart
      await clearCart();

      toast({
        title: "Compra realizada com sucesso!",
        description: "Seus ingressos foram enviados por e-mail."
      });

      navigate('/my-tickets');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Erro na compra",
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
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
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
                        alt={item.events?.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{item.events?.title}</h3>
                        <p className="text-muted-foreground">{item.events?.location}</p>
                        <Badge variant="secondary">{item.events?.category}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          R$ {item.events?.price?.toFixed(2).replace('.', ',')}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.event_id!)}
                        >
                          <Trash2 className="h-4 w-4" />
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
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>{t('cart.total')}</span>
                        <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      {loading ? 'Processando...' : t('cart.checkout')}
                    </Button>
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
