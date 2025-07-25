import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Calendar, MapPin, ArrowLeft, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import TicketQRCodesModal from '@/components/TicketQRCodesModal';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

type OrderItem = Tables<'order_items'> & {
  events: Tables<'events'>;
  orders: Tables<'orders'>;
  qr_code: string[] | null;
};

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State for QR Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<OrderItem | null>(null);

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<OrderItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
    // eslint-disable-next-line
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
      .eq('orders.user_id', user.id)
      .eq('orders.status', 'completed'); // Só mostrar ingressos com pagamento confirmado

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

  // Delete dialog logic
  const handleDeleteClick = (ticket: OrderItem) => {
    setTicketToDelete(ticket);
    setDeleteDialogOpen(true);
  };
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTicketToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;
    setDeleting(true);
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', ticketToDelete.id);
    setDeleting(false);
    setDeleteDialogOpen(false);
    setTicketToDelete(null);
    if (error) {
      toast({
        title: "Erro ao excluir ingresso",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ingresso excluído",
        description: "Seu ingresso foi removido com sucesso.",
      });
      setTickets((prev) => prev.filter(t => t.id !== ticketToDelete.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 sm:gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            // Botão ainda menor em mobile
            className="h-7 px-1 py-1 text-[10px] gap-1 min-w-0 sm:h-10 sm:px-4 sm:py-2 sm:text-sm sm:gap-2"
          >
            <ArrowLeft className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
            Voltar à tela inicial
          </Button>
          <h1
            className="text-lg sm:text-3xl font-black whitespace-nowrap overflow-x-auto truncate"
            style={{ maxWidth: "90vw" }}
          >
            Meus Ingressos
          </h1>
        </div>
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Você ainda não comprou nenhum ingresso.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={ticket.events?.image || "/placeholder.svg"} 
                    alt={ticket.events?.title}
                    className="w-full h-24 object-cover transition-all duration-200"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    Confirmado
                  </Badge>
                </div>
                <CardHeader className="pt-2 pb-1 px-2">
                  <CardTitle className="font-black text-xs line-clamp-2">
                    {ticket.events?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 px-2 pb-2 pt-0">
                  <div className="flex items-center text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{ticket.events?.date} às {ticket.events?.time}</span>
                  </div>
                  <div className="flex items-center text-[10px] text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{ticket.events?.location}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center text-[10px]">
                      <QrCode className="h-3 w-3 mr-1" />
                      <span className="font-mono text-[10px]">
                        {Array.isArray(ticket.qr_code) 
                          ? (ticket.qr_code[0] || "—")
                          : (ticket.qr_code || "—")}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(ticket)}
                      className="text-destructive hover:bg-red-50"
                      title="Excluir ingresso"
                      aria-label="Excluir ingresso"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="text-xs font-bold text-primary mt-1">
                    R$ {ticket.price?.toFixed(2).replace('.', ',')}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleShowQRCodes(ticket)}
                    className="w-full mt-1 h-7 text-[10px]"
                  >
                    <QrCode className="mr-2 h-3 w-3" />
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
          qrCodes={Array.isArray(selectedTicket.qr_code) ? selectedTicket.qr_code : []}
          eventTitle={selectedTicket.events?.title || "Evento"}
        />
      )}

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deseja realmente excluir este ingresso?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita e o ingresso será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} onClick={handleCancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTickets;
