import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, User, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

type Order = Tables<'orders'>;
type OrderItem = Tables<'order_items'>;
type Event = Tables<'events'>;
type Profile = Tables<'profiles'>;

interface OrderWithDetails extends Order {
  order_items: (OrderItem & {
    events: Event;
  })[];
  user_email?: string;
  user_name?: string;
}

const AdminPixPayments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingOrders, setConfirmingOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.email !== 'pepedr13@gmail.com') {
      navigate('/');
      return;
    }
    loadPendingOrders();
  }, [user, navigate]);

  const loadPendingOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            events (*)
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
        toast({
          title: "Erro ao carregar pedidos",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Para cada pedido, buscar informações do usuário
        const ordersWithUserInfo = await Promise.all(
          (data || []).map(async (order) => {
            if (order.user_id) {
              // Buscar perfil do usuário
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', order.user_id)
                .single();

              // Buscar email do auth.users através de uma função RPC se necessário
              // Por agora, vamos usar apenas o nome do perfil
              return {
                ...order,
                user_name: profile?.full_name || 'Nome não informado',
                user_email: 'Ver no Supabase Auth'
              };
            }
            return {
              ...order,
              user_name: 'Usuário não identificado',
              user_email: 'Email não disponível'
            };
          })
        );
        
        setOrders(ordersWithUserInfo as OrderWithDetails[]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (orderId: string) => {
    setConfirmingOrders(prev => new Set(prev).add(orderId));
    
    try {
      // Atualizar status do pedido para confirmado
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Enviar email com QR codes (simulado)
      const { error: emailError } = await supabase.functions.invoke('send-ticket-email', {
        body: { orderId }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Não falhar o processo se o email falhar
      }

      toast({
        title: "Pagamento confirmado! 🎉",
        description: "Email enviado com os QR codes para o usuário.",
      });

      // Recarregar a lista
      loadPendingOrders();
    } catch (error: any) {
      toast({
        title: "Erro ao confirmar pagamento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setConfirmingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (user?.email !== 'pepedr13@gmail.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/events')}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao painel
          </Button>
          <h1 className="text-2xl md:text-3xl font-black">Confirmações PIX</h1>
          <Badge variant="outline" className="ml-auto">
            {orders.length} pedidos pendentes
          </Badge>
        </div>

        {/* Lista de pedidos pendentes */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Carregando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum pedido pendente</h3>
                <p className="text-muted-foreground">
                  Todos os pagamentos PIX foram confirmados!
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Informações do usuário */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {order.user_name || 'Nome não informado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {order.user_email || 'Email não disponível'}
                      </span>
                    </div>
                    
                    {/* Detalhes do pedido */}
                    <div className="space-y-1">
                      {order.order_items?.map((item, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{item.events?.title}</span>
                          <span className="text-muted-foreground ml-2">
                            - {item.quantity}x {formatCurrency(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Informações do pagamento */}
                  <div className="lg:text-right">
                    <div className="flex items-center gap-2 mb-2 lg:justify-end">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <Badge variant="outline" className="bg-amber-50">
                        Aguardando confirmação
                      </Badge>
                    </div>
                    <div className="text-lg font-bold mb-1">
                      Total: {formatCurrency(order.total_amount)}
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">
                      {formatDate(order.created_at)}
                    </div>
                    
                    {/* Botão de confirmação */}
                    <Button
                      onClick={() => confirmPayment(order.id)}
                      disabled={confirmingOrders.has(order.id)}
                      className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {confirmingOrders.has(order.id) ? 'Confirmando...' : 'Confirmar Pagamento'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPixPayments;