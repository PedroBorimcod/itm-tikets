
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
    <div 
      className="
        relative 
        w-full 
        aspect-square 
        flex flex-col 
        bg-card 
        border-2 border-border hover:border-primary 
        rounded-lg 
        overflow-hidden 
        hover:shadow-lg 
        transition-all duration-300
        cursor-pointer
        "
      onClick={() => onViewDetails(event)}
      >
      {/* Imagem quadrada na parte superior */}
      <div className="relative w-full aspect-square">
        <img
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <Badge
          className="absolute top-2 right-2 bg-primary text-white font-bold z-10"
        >
          {event.category}
        </Badge>
        {isLowStock && !isSoldOut && (
          <Badge
            variant="destructive"
            className="absolute top-2 left-2 font-bold z-10"
          >
            Últimos ingressos!
          </Badge>
        )}
        {isSoldOut && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-gray-600 text-white font-bold z-10"
          >
            Esgotado
          </Badge>
        )}
      </div>

      {/* Conteúdo abaixo da imagem */}
      <div className="relative flex flex-col justify-between flex-1 px-2 py-1 md:px-4 md:py-3">
        <div className="w-full">
          <h3 className="font-black text-foreground line-clamp-2 text-sm md:text-lg leading-tight mb-0.5">
            {event.title}
          </h3>
          <p className="font-medium line-clamp-2 text-xs md:text-sm text-muted-foreground mb-1">
            {event.description}
          </p>
          <div className="flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground mb-0.5">
            <CalendarDays className="h-3 w-3 mr-1 text-primary" />
            <span className="font-bold">{formatDate(event.date)} às {event.time}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground mb-0.5">
            <MapPin className="h-3 w-3 mr-1 text-primary" />
            <span className="font-medium">{event.location}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1 text-primary" />
            <span className="font-medium">
              {availableTickets} ingressos disponíveis
            </span>
          </div>
        </div>
        <div className="mt-1 mb-2">
          <span className="text-base md:text-xl font-black text-primary block">
            R$ {event.price.toFixed(2).replace('.', ',')}
          </span>
        </div>
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-1.5 md:py-3 text-xs md:text-base mt-auto"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(event);
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver Detalhes
        </Button>
      </div>
    </div>
  );
};

export default EventCard;

