import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, MapPin, Users, Search, Filter, Ticket } from 'lucide-react';
import EventCard from '@/components/EventCard';
import EventDetailsModal from '@/components/EventDetailsModal';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useLanguage } from '@/hooks/useLanguage';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [events, setEvents] = useState<Tables<'events'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleEventClick = (event: Tables<'events'>) => {
    setSelectedEvent({
      id: event.id,
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      location: event.location,
      price: Number(event.price),
      image: event.image || "/placeholder.svg",
      category: event.category,
      capacity: event.capacity,
      sold_tickets: event.sold_tickets || 0
    });
    setIsModalOpen(true);
  };

  // Mock data para eventos
  const categories = [
    { value: 'all', label: 'Todas as categorias' },
    { value: 'música', label: 'Música' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'entretenimento', label: 'Entretenimento' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'gastronomia', label: 'Gastronomia' },
    { value: 'palestra', label: 'Palestra' }
  ];

  const dateFilters = [
    { value: 'all', label: 'Todas as datas' },
    { value: 'today', label: 'Hoje' },
    { value: 'tomorrow', label: 'Amanhã' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mês' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p>Carregando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      {/* Seção de Filtros */}
      <section id="eventos" className="container mx-auto px-2 md:px-4 py-6 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <Ticket className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            <h2 className="text-2xl md:text-3xl font-black text-foreground">ITM TIKETS</h2>
          </div>
          <p className="text-muted-foreground font-medium text-sm md:text-base">
            Descubra os melhores eventos e garante seu ingresso!
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2 md:top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 py-2 border-2 border-border focus:border-primary font-medium text-sm md:text-base"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-64 border-2 border-border focus:border-primary font-medium text-sm md:text-base">
              <Filter className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value} className="font-medium">
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-full md:w-64 border-2 border-border focus:border-primary font-medium text-sm md:text-base">
              <CalendarDays className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Data" />
            </SelectTrigger>
            <SelectContent>
              {dateFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value} className="font-medium">
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid de Eventos */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="cursor-pointer">
              <EventCard
                event={{
                  id: event.id,
                  title: event.title,
                  description: event.description || '',
                  date: event.date,
                  time: event.time,
                  location: event.location,
                  price: Number(event.price),
                  image: event.image || "/placeholder.svg",
                  category: event.category,
                  capacity: event.capacity,
                  sold_tickets: event.sold_tickets || 0
                }}
                onViewDetails={handleEventClick}
              />
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-10 md:py-12">
            <h3 className="text-lg md:text-xl font-black text-foreground mb-1 md:mb-2">
              {t('events.noResults')}
            </h3>
            <p className="text-muted-foreground font-medium text-sm md:text-base">
              Tente ajustar os filtros para encontrar eventos que interessam você.
            </p>
          </div>
        )}
      </section>

      {/* Modal de detalhes do evento */}
      <EventDetailsModal 
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Seção de Estatísticas */}
      <section className="bg-foreground py-6 md:py-8">
        <div className="container mx-auto px-2 md:px-4">
          <div className="mb-4 md:mb-6 md:text-center text-center">
            <h2 className="text-lg md:text-xl font-black text-background mb-1 md:mb-2">
              Por que escolher a ITM Tikets?
            </h2>
          </div>
          {/* Grid centralizado em todas as telas */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 justify-items-center">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-lg md:text-2xl font-black text-primary mb-1">
                500+
              </h3>
              <p className="text-background font-semibold text-xs md:text-sm">
                Eventos Realizados
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <h3 className="text-lg md:text-2xl font-black text-primary mb-1">
                50K+
              </h3>
              <p className="text-background font-semibold text-xs md:text-sm">
                Ingressos Vendidos
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <h3 className="text-lg md:text-2xl font-black text-primary mb-1">
                1M+
              </h3>
              <p className="text-background font-semibold text-xs md:text-sm">
                Usuários Satisfeitos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Contato */}
      <section id="contato" className="container mx-auto px-2 md:px-4 py-10 md:py-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3 md:mb-4">Entre em Contato</h2>
          <p className="text-muted-foreground font-medium mb-7 md:mb-8 text-sm md:text-base">Tem alguma dúvida? Estamos aqui para ajudar!</p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold">
            Fale Conosco
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
