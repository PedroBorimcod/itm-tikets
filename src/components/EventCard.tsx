
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, ShoppingCart } from 'lucide-react';
import ProtectedButton from './ProtectedButton';
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

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const { toast } = useToast();
  
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

  const handleBuyTicket = () => {
    toast({
      title: "Redirecionando para compra",
      description: `Você será redirecionado para comprar ingressos do evento: ${event.title}`
    });
    // Aqui você implementaria a lógica de redirecionamento para a página de compra
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-border">
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
        <CardDescription className="font-medium">
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
            {availableTickets} ingressos disponíveis de {event.capacity}
          </span>
        </div>
        
        <div className="text-2xl font-black text-primary">
          R$ {event.price.toFixed(2).replace('.', ',')}
        </div>
      </CardContent>
      
      <CardFooter>
        <ProtectedButton 
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
          disabled={isSoldOut}
          onClick={handleBuyTicket}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isSoldOut ? 'Esgotado' : 'Comprar Ingresso'}
        </ProtectedButton>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
