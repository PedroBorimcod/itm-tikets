
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
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'música': 'bg-purple-100 text-purple-700',
      'workshop': 'bg-blue-100 text-blue-700',
      'entretenimento': 'bg-pink-100 text-pink-700',
      'tecnologia': 'bg-green-100 text-green-700',
      'gastronomia': 'bg-orange-100 text-orange-700',
      'palestra': 'bg-indigo-100 text-indigo-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 bg-card">
      <div className="relative overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getCategoryColor(event.category)}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
          <span className="text-lg font-bold text-primary">{formatPrice(event.price)}</span>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {event.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-2 text-primary" />
            {formatDate(event.date)} às {event.time}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            {event.location}
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2 text-primary" />
              {event.capacity - event.soldTickets} vagas restantes
            </div>
            <span className={`font-medium ${getAvailabilityColor()}`}>
              {Math.round(((event.capacity - event.soldTickets) / event.capacity) * 100)}% disponível
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button className="w-full group-hover:bg-primary/90 transition-colors">
          Comprar Ingresso
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
