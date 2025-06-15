import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar, CreditCard, ArrowLeft } from 'lucide-react';
import { useProducerAuth } from '@/hooks/useProducerAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import WithdrawModal from "@/components/WithdrawModal";

type Event = Tables<'events'>;
type Transaction = Tables<'transactions'>;
type Withdrawal = Tables<'withdrawals'>;

const ProducerDashboard = () => {
  const { producer, signOut } = useProducerAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    if (producer) {
      loadData();
    }
  }, [producer]);

  const loadData = async () => {
    if (!producer) return;

    // Load events
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .eq('producer_id', producer.id);
    
    if (eventsData) setEvents(eventsData);

    // Load transactions
    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('producer_id', producer.id)
      .order('created_at', { ascending: false });
    
    if (transactionsData) setTransactions(transactionsData);

    // Load withdrawals
    const { data: withdrawalsData } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('producer_id', producer.id)
      .order('created_at', { ascending: false });
    
    if (withdrawalsData) setWithdrawals(withdrawalsData);
  };

  const handleWithdraw = async ({
    withdrawAmount: withdrawAmountParam,
    method,
    pixKey,
    bankName,
    bankAgency,
    bankAccount,
    bankHolder,
  }: {
    withdrawAmount: string;
    method: "pix" | "bank";
    pixKey?: string;
    bankName?: string;
    bankAgency?: string;
    bankAccount?: string;
    bankHolder?: string;
  }) => {
    if (!producer || !withdrawAmountParam) return;

    const amount = parseFloat(withdrawAmountParam);
    if (amount <= 0 || amount > producer.balance) {
      toast({
        title: "Valor inválido",
        description: "Verifique o valor do saque.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Calculate fee (R$ 8.00 per ticket sold)
    const ticketsSold = transactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + 1, 0);

    const feePerTicket = 8.00;
    const totalFee = ticketsSold * feePerTicket;
    const netAmount = amount - totalFee;

    if (netAmount <= 0) {
      toast({
        title: "Saque não permitido",
        description: "Taxa excede o valor do saque.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      // Salva juntamente os dados de conta/pix no saque!
      const { error } = await supabase.from('withdrawals').insert({
        producer_id: producer.id,
        amount: amount,
        fee: totalFee,
        net_amount: netAmount,
        status: 'pending',
        method,
        pix_key: method === "pix" ? pixKey : null,
        bank_name: method === "bank" ? bankName : null,
        bank_agency: method === "bank" ? bankAgency : null,
        bank_account: method === "bank" ? bankAccount : null,
        bank_holder: method === "bank" ? bankHolder : null,
      });

      if (error) throw error;

      await supabase.from('transactions').insert({
        producer_id: producer.id,
        type: 'withdrawal',
        amount,
        description: 'Saque solicitado'
      });

      await supabase.from('transactions').insert({
        producer_id: producer.id,
        type: 'fee',
        amount: totalFee,
        description: 'Taxa de processamento'
      });

      toast({
        title: "Saque solicitado",
        description: "Seu saque está sendo processado."
      });

      setWithdrawAmount('');
      setShowWithdrawModal(false);
      loadData();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Erro no saque",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!producer) {
    return <div>Carregando...</div>;
  }

  const totalTicketsSold = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + 1, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à tela inicial
            </Button>
            <h1 className="text-3xl font-black">Dashboard da Produtora</h1>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {producer.balance?.toFixed(2).replace('.', ',')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTicketsSold}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Solicitar Saque</CardTitle>
              <CardDescription>
                Taxa de R$ 8,00 por ingresso vendido será deduzida
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowWithdrawModal(true)}
                className="w-full"
                disabled={loading}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Solicitar Saque
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Saques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawals.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum saque realizado</p>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">R$ {withdrawal.net_amount?.toFixed(2).replace('.', ',')}</div>
                        <div className="text-sm text-muted-foreground">
                          Taxa: R$ {withdrawal.fee?.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      <Badge variant={
                        withdrawal.status === 'completed' ? 'default' : 
                        withdrawal.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {withdrawal.status === 'completed' ? 'Concluído' : 
                         withdrawal.status === 'pending' ? 'Pendente' : 'Falhou'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Meus Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-muted-foreground">Nenhum evento cadastrado</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex justify-between items-center p-4 border rounded">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.date} - {event.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">R$ {event.price?.toFixed(2).replace('.', ',')}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.sold_tickets || 0}/{event.capacity} ingressos
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <WithdrawModal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={handleWithdraw}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        loading={loading}
      />
    </div>
  );
};

export default ProducerDashboard;
