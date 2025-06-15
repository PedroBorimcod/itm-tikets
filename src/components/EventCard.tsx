
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, Eye } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary cursor-pointer
      p-0">
      <div className="relative" onClick={() => onViewDetails(event)}>
        {/* Mantém quadrado, mas ajusta a altura da imagem em telas pequenas */}
        <AspectRatio ratio={1 / 1}>
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </AspectRatio>
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

      {/* Menor padding/header em mobile */}
      <CardHeader 
        onClick={() => onViewDetails(event)} 
        className="py-2 px-3 md:py-6 md:px-6"
      >
        <CardTitle className="font-black text-foreground line-clamp-2 text-base md:text-xl">
          {event.title}
        </CardTitle>
        <CardDescription className="font-medium line-clamp-2 text-xs md:text-base">
          {event.description}
        </CardDescription>
      </CardHeader>

      {/* Menos espaço e fontes menores em mobile */}
      <CardContent 
        className="space-y-2 md:space-y-4 p-3 pt-0 md:p-6 md:pt-0"
        onClick={() => onViewDetails(event)}
      >
        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
          <span className="font-bold">{formatDate(event.date)} às {event.time}</span>
        </div>
        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span className="font-medium">{event.location}</span>
        </div>
        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2 text-primary" />
          <span className="font-medium">
            {availableTickets} ingressos disponíveis
          </span>
        </div>
        <div className="text-lg md:text-2xl font-black text-primary">
          A partir de R$ {event.price.toFixed(2).replace('.', ',')}
        </div>
      </CardContent>

      {/* Menor footer em mobile */}
      <CardFooter className="p-2 pt-0 md:p-6 md:pt-0">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 md:py-3 text-xs md:text-base"
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
