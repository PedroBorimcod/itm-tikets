
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

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

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const availableTickets = event.capacity - event.soldTickets;
  const isLowStock = availableTickets <= 50;
  const isSoldOut = availableTickets <= 0;

  const handleBuyTicket = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que abra o modal quando clicar no botão
    
    if (!user) {
      navigate('/auth');
      return;
    }

    await addToCart(event.id.toString(), 1);
    toast({
      title: "Ingresso adicionado!",
      description: "Vá para o carrinho para finalizar a compra.",
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/cart')}
        >
          Ver Carrinho
        </Button>
      )
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary cursor-pointer">
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <Badge 
          className="absolute top-2 right-2 bg-primary text-white font-bold"
        >
          {event.category}
        </Badge>
        {isLowStock && !isSoldOut && (
          <Badge 
            variant="destructive" 
            className="absolute top-2 left-2 font-bold"
          >
            Últimos ingressos!
          </Badge>
        )}
        {isSoldOut && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-gray-600 text-white font-bold"
          >
            Esgotado
          </Badge>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="font-black text-foreground line-clamp-2">
          {event.title}
        </CardTitle>
        <CardDescription className="font-medium line-clamp-2">
          {event.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
          <span className="font-bold">{formatDate(event.date)} às {event.time}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span className="font-medium">{event.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2 text-primary" />
          <span className="font-medium">
            {availableTickets} ingressos disponíveis
          </span>
        </div>
        
        <div className="text-2xl font-black text-primary">
          R$ {event.price.toFixed(2).replace('.', ',')}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
          disabled={isSoldOut}
          onClick={handleBuyTicket}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isSoldOut ? 'Esgotado' : 'Adicionar ao Carrinho'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
