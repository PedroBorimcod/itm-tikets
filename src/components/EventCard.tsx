
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, Heart, Share2 } from 'lucide-react';

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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getAvailabilityColor = () => {
    const percentage = (event.soldTickets / event.capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-primary';
    return 'text-green-600';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'música': 'bg-primary/10 text-primary border-primary/20',
      'workshop': 'bg-foreground/10 text-foreground border-foreground/20',
      'entretenimento': 'bg-primary/10 text-primary border-primary/20',
      'tecnologia': 'bg-foreground/10 text-foreground border-foreground/20',
      'gastronomia': 'bg-primary/10 text-primary border-primary/20',
      'palestra': 'bg-foreground/10 text-foreground border-foreground/20'
    };
    return colors[category] || 'bg-muted text-foreground border-border';
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-border bg-card hover:border-primary/50">
      <div className="relative overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <Badge className={`${getCategoryColor(event.category)} font-bold border`}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 hover:bg-background">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 hover:bg-background">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 bg-primary text-white rounded-lg px-3 py-1">
          <span className="text-lg font-black">{formatPrice(event.price)}</span>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-black line-clamp-2 group-hover:text-primary transition-colors text-foreground">
          {event.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-muted-foreground">
          {event.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-foreground font-medium">
            <CalendarDays className="h-4 w-4 mr-2 text-primary" />
            {formatDate(event.date)} às {event.time}
          </div>
          <div className="flex items-center text-sm text-foreground font-medium">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            {event.location}
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-foreground font-medium">
              <Users className="h-4 w-4 mr-2 text-primary" />
              {event.capacity - event.soldTickets} vagas restantes
            </div>
            <span className={`font-black ${getAvailabilityColor()}`}>
              {Math.round(((event.capacity - event.soldTickets) / event.capacity) * 100)}% disponível
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button className="w-full group-hover:bg-primary/90 transition-colors bg-primary text-white font-black">
          Comprar Ingresso
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
