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
      soldTickets: event.sold_tickets || 0
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
      <section id="eventos" className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Ticket className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-black text-foreground">ITM TIKETS</h2>
          </div>
          <p className="text-muted-foreground font-medium">Descubra os melhores eventos e garante seu ingresso!</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-border focus:border-primary font-medium"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-64 border-2 border-border focus:border-primary font-medium">
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
            <SelectTrigger className="w-full md:w-64 border-2 border-border focus:border-primary font-medium">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} onClick={() => handleEventClick(event)} className="cursor-pointer">
              <EventCard event={{
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
                soldTickets: event.sold_tickets || 0
              }} />
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-black text-foreground mb-2">
              {t('events.noResults')}
            </h3>
            <p className="text-muted-foreground font-medium">
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
      <section className="bg-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-background mb-4">Por que escolher a ITM Tikets?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-black text-primary mb-2">500+</h3>
              <p className="text-background font-bold">Eventos Realizados</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-primary mb-2">50K+</h3>
              <p className="text-background font-bold">Ingressos Vendidos</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-primary mb-2">1M+</h3>
              <p className="text-background font-bold">Usuários Satisfeitos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Contato */}
      <section id="contato" className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-black text-foreground mb-4">Entre em Contato</h2>
          <p className="text-muted-foreground font-medium mb-8">Tem alguma dúvida? Estamos aqui para ajudar!</p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold">
            Fale Conosco
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
