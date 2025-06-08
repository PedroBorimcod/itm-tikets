
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, MapPin, Users, Search, Filter } from 'lucide-react';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');

  // Mock data para eventos
  const events = [
    {
      id: 1,
      title: "Festival de Música Eletrônica 2024",
      description: "Uma noite inesquecível com os melhores DJs nacionais e internacionais",
      date: "2024-12-15",
      time: "20:00",
      location: "Arena São Paulo, SP",
      price: 85.00,
      image: "/placeholder.svg",
      category: "música",
      capacity: 5000,
      soldTickets: 2800
    },
    {
      id: 2,
      title: "Workshop de Marketing Digital",
      description: "Aprenda as estratégias mais atuais do marketing digital com especialistas",
      date: "2024-12-20",
      time: "14:00",
      location: "Centro de Convenções, RJ",
      price: 120.00,
      image: "/placeholder.svg",
      category: "workshop",
      capacity: 200,
      soldTickets: 145
    },
    {
      id: 3,
      title: "Show de Stand-up Comedy",
      description: "Uma noite de muito humor com os melhores comediantes do Brasil",
      date: "2024-12-18",
      time: "21:00",
      location: "Teatro Municipal, MG",
      price: 45.00,
      image: "/placeholder.svg",
      category: "entretenimento",
      capacity: 800,
      soldTickets: 320
    },
    {
      id: 4,
      title: "Conferência de Tecnologia 2024",
      description: "O maior evento de tecnologia do ano com palestrantes renomados",
      date: "2024-12-25",
      time: "09:00",
      location: "Expo Center Norte, SP",
      price: 200.00,
      image: "/placeholder.svg",
      category: "tecnologia",
      capacity: 1500,
      soldTickets: 890
    },
    {
      id: 5,
      title: "Festival Gastronômico",
      description: "Deguste pratos únicos dos melhores chefs da cidade",
      date: "2024-12-22",
      time: "12:00",
      location: "Parque da Cidade, DF",
      price: 60.00,
      image: "/placeholder.svg",
      category: "gastronomia",
      capacity: 1000,
      soldTickets: 456
    },
    {
      id: 6,
      title: "Palestra: Liderança no Século XXI",
      description: "Descubra como ser um líder eficaz na era digital",
      date: "2024-12-28",
      time: "19:00",
      location: "Auditório Central, PR",
      price: 75.00,
      image: "/placeholder.svg",
      category: "palestra",
      capacity: 300,
      soldTickets: 180
    }
  ];

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
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navbar />
      <Hero />
      
      {/* Seção de Filtros */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-64">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-full md:w-64">
              <CalendarDays className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Data" />
            </SelectTrigger>
            <SelectContent>
              {dateFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Nenhum evento encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros para encontrar eventos que interessam você.
            </p>
          </div>
        )}
      </section>

      {/* Seção de Estatísticas */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">500+</h3>
              <p className="text-muted-foreground">Eventos Realizados</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">50K+</h3>
              <p className="text-muted-foreground">Ingressos Vendidos</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">1M+</h3>
              <p className="text-muted-foreground">Usuários Satisfeitos</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
