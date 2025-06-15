import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, Eye } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  image: string;
  category: string;
  capacity: number;
  sold_tickets: number;
}

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
}

const EventCard = ({ event, onViewDetails }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const availableTickets = event.capacity - (event.sold_tickets || 0);
  const isLowStock = availableTickets <= 50;
  const isSoldOut = availableTickets <= 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary cursor-pointer">
      <div className="relative" onClick={() => onViewDetails(event)}>
        <img 
          src={event.image || "/placeholder.svg"} 
          alt={event.title}
          className="w-full h-40 md:h-48 object-cover"
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
      
      <CardHeader onClick={() => onViewDetails(event)}>
        <CardTitle className="font-black text-foreground line-clamp-2">
          {event.title}
        </CardTitle>
        <CardDescription className="font-medium line-clamp-2">
          {event.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4" onClick={() => onViewDetails(event)}>
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
          A partir de R$ {event.price.toFixed(2).replace('.', ',')}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(event);
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes e Comprar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
