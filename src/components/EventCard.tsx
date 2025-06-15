import { Button } from '@/components/ui/button';
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
    <div
      className={`
        relative w-full
        aspect-square md:aspect-auto
        md:h-auto
        flex flex-col
        bg-card 
        border-2 border-border hover:border-primary 
        rounded-lg 
        overflow-hidden 
        hover:shadow-lg 
        transition-all duration-300
        cursor-pointer
        max-h-[420px] h-full min-h-[0] 
        md:max-h-[520px]
      `}
      onClick={() => onViewDetails(event)}
      style={{
        height: '110vw',
        maxHeight: 420,
        minHeight: 0,
      }}
    >
      {/* Imagem quadrada na parte superior */}
      <div className="relative w-full aspect-square h-1/2">
        <img
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <Badge
          className="absolute top-1.5 right-1.5 bg-primary text-white font-bold z-10 text-[10px] md:text-xs py-[1.5px] px-2"
        >
          {event.category}
        </Badge>
        {isLowStock && !isSoldOut && (
          <Badge
            variant="destructive"
            className="absolute top-1.5 left-1.5 font-bold z-10 text-[10px] md:text-xs py-[1.5px] px-2"
          >
            Últimos!
          </Badge>
        )}
        {isSoldOut && (
          <Badge
            variant="secondary"
            className="absolute top-1.5 left-1.5 bg-gray-600 text-white font-bold z-10 text-[10px] md:text-xs py-[1.5px] px-2"
          >
            Esgotado
          </Badge>
        )}
      </div>
      {/* Conteúdo abaixo da imagem */}
      <div className="flex flex-col justify-between flex-1 px-2.5 pt-2 pb-8 md:px-6 md:pt-4 md:pb-11 relative">
        <div className="w-full flex flex-col gap-0.5 md:gap-1 flex-1">
          <h3 className="font-black text-foreground line-clamp-2 text-[13px] md:text-xl leading-tight mb-0.5 text-center">
            {event.title}
          </h3>
          <p className="line-clamp-2 text-[10px] md:text-base text-muted-foreground mb-0 text-center">
            {event.description}
          </p>
          <div className="flex items-center gap-1 text-[10px] md:text-sm text-muted-foreground mb-0 justify-center">
            <CalendarDays className="h-3 w-3 mr-1 text-primary" />
            <span className="font-bold">{formatDate(event.date)} às {event.time}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] md:text-sm text-muted-foreground mb-0 justify-center">
            <MapPin className="h-3 w-3 mr-1 text-primary" />
            <span className="font-medium">{event.location}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] md:text-sm text-muted-foreground justify-center">
            <Users className="h-3 w-3 mr-1 text-primary" />
            <span className="font-medium">
              {availableTickets} ingressos
            </span>
          </div>
        </div>
        {/* Valor absoluto no rodapé, sempre visível */}
        <span
          className="
            absolute left-0 right-0 bottom-1 md:bottom-3 
            text-center text-[15px] md:text-2xl font-black text-primary 
            leading-tight pointer-events-none select-none
          "
          style={{ zIndex: 3 }}
        >
          R$ {event.price.toFixed(2).replace('.', ',')}
        </span>
      </div>
    </div>
  );
};

export default EventCard;
