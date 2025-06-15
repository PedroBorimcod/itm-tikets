
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import TicketQRCodesModal from '@/components/TicketQRCodesModal';

type OrderItem = Tables<'order_items'> & {
  events: Tables<'events'>;
  orders: Tables<'orders'>;
};

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<OrderItem | null>(null);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        events (*),
        orders (*)
      `)
      .eq('orders.user_id', user.id);

    if (error) {
      console.error('Error loading tickets:', error);
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  const handleShowQRCodes = (ticket: OrderItem) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTicket(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à tela inicial
          </Button>
          <h1 className="text-3xl font-black">Meus Ingressos</h1>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Você ainda não comprou nenhum ingresso.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={ticket.events?.image || "/placeholder.svg"} 
                    alt={ticket.events?.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    Confirmado
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="font-black text-lg">
                    {ticket.events?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{ticket.events?.date} às {ticket.events?.time}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{ticket.events?.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      <span className="font-mono text-xs">{ticket.qr_code}</span>
                    </div>
                  </div>

                  <div className="text-lg font-bold text-primary">
                    R$ {ticket.price?.toFixed(2).replace('.', ',')}
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => handleShowQRCodes(ticket)}
                    className="w-full mt-2"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Ver QR Codes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Modal for QR codes */}
      {selectedTicket && (
        <TicketQRCodesModal
          open={modalOpen}
          onOpenChange={handleCloseModal}
          quantity={selectedTicket.quantity}
          qrCode={selectedTicket.qr_code}
          eventTitle={selectedTicket.events?.title || "Evento"}
        />
      )}
    </div>
  );
};

export default MyTickets;
