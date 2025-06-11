
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Clock, Users, ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  image: string;
  category: string;
  capacity: number;
  soldTickets: number;
}

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailsModal = ({ event, isOpen, onClose }: EventDetailsModalProps) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  const availableTickets = event.capacity - event.soldTickets;
  const isLowStock = availableTickets <= 50;
  const isSoldOut = availableTickets <= 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= availableTickets) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/auth');
      onClose();
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(event.id.toString(), quantity);
      toast({
        title: "Ingressos adicionados!",
        description: `${quantity} ingresso(s) adicionado(s) ao carrinho.`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              onClose();
              navigate('/cart');
            }}
          >
            Ver Carrinho
          </Button>
        )
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao adicionar ingressos",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Banner do evento */}
          <div className="relative h-64 md:h-80">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            {isLowStock && !isSoldOut && (
              <Badge 
                variant="destructive" 
                className="absolute top-4 left-4 font-bold"
              >
                Últimos ingressos!
              </Badge>
            )}
            {isSoldOut && (
              <Badge 
                variant="secondary" 
                className="absolute top-4 left-4 bg-gray-600 text-white font-bold"
              >
                Esgotado
              </Badge>
            )}
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            <DialogHeader className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl md:text-3xl font-black text-foreground mb-2">
                    {event.title}
                  </DialogTitle>
                  <Badge className="bg-primary text-white font-bold">
                    {event.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-primary">
                    R$ {event.price.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Informações do evento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <CalendarDays className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-bold text-foreground">
                      {formatDate(event.date)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <span className="font-bold text-foreground">{event.time}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <span className="font-medium text-foreground">{event.location}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Users className="h-5 w-5 mr-3 text-primary" />
                  <span className="font-medium text-foreground">
                    {availableTickets} ingressos disponíveis de {event.capacity}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">Sobre o evento</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description || 'Descrição não disponível.'}
                </p>
              </div>
            </div>

            {/* Seleção de quantidade e botão de compra */}
            <div className="flex flex-col gap-4">
              {!isSoldOut && (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <span className="font-medium">Quantidade:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-bold text-lg px-3">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= availableTickets}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm text-muted-foreground">Total:</div>
                    <div className="text-xl font-bold text-primary">
                      R$ {(event.price * quantity).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>
              )}

              <Button 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-lg"
                disabled={isSoldOut || isAddingToCart}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isAddingToCart ? 'Adicionando...' : isSoldOut ? 'Esgotado' : `Adicionar ${quantity} Ingresso(s) ao Carrinho`}
              </Button>
              
              {!user && (
                <p className="text-sm text-muted-foreground text-center">
                  Faça login para comprar ingressos
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;
