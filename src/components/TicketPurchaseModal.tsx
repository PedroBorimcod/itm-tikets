import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Clock, Users, QrCode, X, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTicketPurchase } from '@/hooks/useTicketPurchase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import PixPaymentModal from './PixPaymentModal';

type Event = Tables<'events'>;
type TicketType = Tables<'ticket_types'>;

interface TicketPurchaseModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const TicketPurchaseModal = ({ event, isOpen, onClose }: TicketPurchaseModalProps) => {
  const { user } = useAuth();
  const { purchaseTickets, loading, showPixModal, pixData, closePixModal } = useTicketPurchase();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loadingTicketTypes, setLoadingTicketTypes] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      loadTicketTypes();
    }
  }, [event, isOpen]);

  const loadTicketTypes = async () => {
    if (!event) return;

    setLoadingTicketTypes(true);
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', event.id)
        .order('price');

      if (error) {
        console.error('Error loading ticket types:', error);
        toast({
          title: "Erro ao carregar tipos de ingresso",
          description: "Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      setTicketTypes(data || []);
      if (data && data.length > 0) {
        setSelectedTicketType(data[0]);
      }
    } catch (error) {
      console.error('Error in loadTicketTypes:', error);
    } finally {
      setLoadingTicketTypes(false);
    }
  };

  if (!event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getAvailableTickets = (ticketType: TicketType) => {
    return ticketType.capacity - ticketType.sold_tickets;
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (!selectedTicketType) return;
    const available = getAvailableTickets(selectedTicketType);
    if (newQuantity >= 1 && newQuantity <= available) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate('/auth');
      onClose();
      return;
    }

    if (!selectedTicketType || !event) return;

    await purchaseTickets({
      eventId: event.id,
      ticketTypeId: selectedTicketType.id,
      quantity,
      price: selectedTicketType.price,
      eventTitle: event.title
    });

    onClose();
  };

  const getTicketTypeDisplayName = (name: string) => {
    const names: { [key: string]: string } = {
      'front_stage': 'Front Stage',
      'pista': 'Pista',
      'mesanino': 'Mesanino',
      'back_stage': 'Back Stage'
    };
    return names[name] || name;
  };

  // === NEW PRICE CALCULATIONS ===
  const subtotal = selectedTicketType ? selectedTicketType.price * quantity : 0;
  const serviceFee = subtotal * 0.08;
  const total = subtotal + serviceFee;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Banner do evento */}
          <div className="relative h-40 md:h-64 lg:h-80">
            <img 
              src={event.image || "/placeholder.svg"} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 md:top-4 md:right-4 bg-black/20 hover:bg-black/40 text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Conteúdo */}
          <div className="p-3 md:p-6">
            <DialogHeader className="mb-4 md:mb-6">
              <div className="flex flex-col md:flex-row items-start justify-between gap-3 md:gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-xl md:text-2xl lg:text-3xl font-black text-foreground mb-1 md:mb-2">
                    {event.title}
                  </DialogTitle>
                  <Badge className="bg-primary text-white font-bold text-xs md:text-base">
                    {event.category}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            {/* Informações do evento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center text-xs md:text-sm">
                  <CalendarDays className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-primary" />
                  <div>
                    <div className="font-bold text-foreground">
                      {formatDate(event.date)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-xs md:text-sm">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-primary" />
                  <span className="font-bold text-foreground">{event.time}</span>
                </div>
                
                <div className="flex items-center text-xs md:text-sm">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-primary" />
                  <span className="font-medium text-foreground">{event.location}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">Sobre o evento</h3>
                <p className="text-muted-foreground leading-relaxed text-xs md:text-base">
                  {event.description || 'Descrição não disponível.'}
                </p>
              </div>
            </div>

            {/* Tipos de ingressos */}
            <div className="mb-4 md:mb-6">
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Escolha o tipo de ingresso</h3>
              
              {loadingTicketTypes ? (
                <div className="text-center py-3 md:py-4">Carregando tipos de ingresso...</div>
              ) : ticketTypes.length === 0 ? (
                <div className="text-center py-3 md:py-4 text-muted-foreground">
                  Nenhum tipo de ingresso disponível para este evento.
                </div>
              ) : (
                <div className="grid gap-2 md:gap-3">
                  {ticketTypes.map((ticketType) => {
                    const available = getAvailableTickets(ticketType);
                    const isSelected = selectedTicketType?.id === ticketType.id;
                    const isSoldOut = available <= 0;
                    
                    return (
                      <div
                        key={ticketType.id}
                        className={`p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isSoldOut && setSelectedTicketType(ticketType)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-base md:text-lg">
                              {getTicketTypeDisplayName(ticketType.name)}
                            </h4>
                            <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                              <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              <span>
                                {available} ingressos disponíveis de {ticketType.capacity}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg md:text-2xl font-bold text-primary">
                              R$ {ticketType.price.toFixed(2).replace('.', ',')}
                            </div>
                            {isSoldOut && (
                              <Badge variant="secondary" className="bg-gray-600 text-white text-xs md:text-sm">
                                Esgotado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Seleção de quantidade e botão de compra */}
            {selectedTicketType && getAvailableTickets(selectedTicketType) > 0 && (
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg">
                  <span className="font-medium text-xs md:text-base">Quantidade:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-bold text-base md:text-lg px-2 md:px-3">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= getAvailableTickets(selectedTicketType)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xs md:text-sm text-muted-foreground">Subtotal:</div>
                    <div className="text-lg md:text-xl font-bold text-primary">
                      R$ {subtotal.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>

                {/* Fee and total breakdown */}
                <div className="bg-muted rounded-lg p-3 md:p-4 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-base md:text-lg">
                      R$ {subtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-muted-foreground">
                      Taxa de serviço (8%)
                    </span>
                    <span className="font-semibold text-base md:text-lg">
                      R$ {serviceFee.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 md:pt-2 mt-1">
                    <span className="font-bold text-xs md:text-base text-foreground">Total</span>
                    <span className="font-bold text-primary text-base md:text-lg">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full h-11 md:h-12 bg-primary hover:bg-primary/90 text-white font-bold text-base md:text-lg"
                  disabled={loading}
                  onClick={handlePurchase}
                >
                  <QrCode className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  {loading ? 'Processando...' : `Pagar via PIX - ${quantity} Ingresso(s)`}
                </Button>
                
                {!user && (
                  <p className="text-xs md:text-sm text-muted-foreground text-center">
                    Faça login para comprar ingressos
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {pixData && (
      <PixPaymentModal
        isOpen={showPixModal}
        onClose={closePixModal}
        totalAmount={pixData.totalAmount}
        eventTitle={pixData.eventTitle}
        quantity={pixData.quantity}
      />
    )}
    </>
  );
};

export default TicketPurchaseModal;
