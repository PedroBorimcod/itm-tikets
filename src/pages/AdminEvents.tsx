
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Trash2, Users, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'>;
type Producer = Tables<'producers'>;
type TicketType = Tables<'ticket_types'>;

interface TicketTypeFormData {
  name: string;
  price: string;
  capacity: string;
  enabled: boolean;
}

const AdminEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    capacity: '',
    category: '',
    image: '',
    producer_id: ''
  });
  
  const [ticketTypes, setTicketTypes] = useState<TicketTypeFormData[]>([
    { name: 'front_stage', price: '', capacity: '', enabled: false },
    { name: 'pista', price: '', capacity: '', enabled: false },
    { name: 'mesanino', price: '', capacity: '', enabled: false },
    { name: 'back_stage', price: '', capacity: '', enabled: false }
  ]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email !== 'pepedr13@gmail.com') {
      navigate('/');
      return;
    }
    loadEvents();
    loadProducers();
  }, [user, navigate]);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading events:', error);
    } else {
      setEvents(data || []);
    }
  };

  const loadProducers = async () => {
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error loading producers:', error);
    } else {
      setProducers(data || []);
    }
  };

  const getTicketTypeDisplayName = (name: string) => {
    const names: { [key: string]: string } = {
      'front_stage': 'Front Stage',
      'pista': 'Pista',
      'mesanino': 'Mesanino',
      'back_stage': 'Back Stage'
    };
    return names[name] || name;
  };

  const updateTicketType = (index: number, field: keyof TicketTypeFormData, value: string | boolean) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const enabledTicketTypes = ticketTypes.filter(tt => tt.enabled);
    if (enabledTicketTypes.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um tipo de ingresso.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Criar o evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          price: Math.min(...enabledTicketTypes.map(tt => parseFloat(tt.price))), // Menor preço
          capacity: enabledTicketTypes.reduce((sum, tt) => sum + parseInt(tt.capacity), 0), // Soma das capacidades
          category: formData.category,
          image: formData.image,
          producer_id: formData.producer_id || null,
          created_by: user.id
        })
        .select()
        .single();

      if (eventError) {
        throw eventError;
      }

      // Criar os tipos de ingressos
      const ticketTypesToInsert = enabledTicketTypes.map(tt => ({
        event_id: eventData.id,
        name: tt.name,
        price: parseFloat(tt.price),
        capacity: parseInt(tt.capacity)
      }));

      const { error: ticketTypesError } = await supabase
        .from('ticket_types')
        .insert(ticketTypesToInsert);

      if (ticketTypesError) {
        throw ticketTypesError;
      }

      toast({
        title: "Evento criado",
        description: "Evento e tipos de ingressos criados com sucesso."
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        price: '',
        capacity: '',
        category: '',
        image: '',
        producer_id: ''
      });
      
      setTicketTypes([
        { name: 'front_stage', price: '', capacity: '', enabled: false },
        { name: 'pista', price: '', capacity: '', enabled: false },
        { name: 'mesanino', price: '', capacity: '', enabled: false },
        { name: 'back_stage', price: '', capacity: '', enabled: false }
      ]);
      
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Erro ao criar evento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Evento deletado",
        description: "Evento removido com sucesso."
      });
      loadEvents();
    }
  };

  if (user?.email !== 'pepedr13@gmail.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Container responsivo com padding extra em mobile */}
      <div className="container mx-auto px-2 md:px-4 py-5 md:py-8">
        {/* Cabeçalho responsivo */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à tela inicial
            </Button>
            <h1 className="text-2xl md:text-3xl font-black">Administração</h1>
          </div>
          <Button
            onClick={() => navigate('/admin/producers')}
            className="w-full md:w-auto"
          >
            <Users className="h-4 w-4 mr-2" />
            Gerenciar Produtoras
          </Button>
        </div>

        {/* Grids em coluna no mobile e lado a lado em telas grandes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Criar Novo Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full"
                  />
                </div>

                {/* Data e horário: responsivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className="w-full" >
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="show">Show</SelectItem>
                      <SelectItem value="teatro">Teatro</SelectItem>
                      <SelectItem value="festa">Festa</SelectItem>
                      <SelectItem value="esporte">Esporte</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="producer">Produtora</Label>
                  <Select
                    value={formData.producer_id}
                    onValueChange={(value) => setFormData({...formData, producer_id: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma produtora (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {producers.map((producer) => (
                        <SelectItem key={producer.id} value={producer.id}>
                          {producer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">URL da Imagem</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full"
                  />
                </div>

                {/* Tipos de Ingressos */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Tipos de Ingressos</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecione quais tipos de ingressos estarão disponíveis para este evento:
                  </p>
                  
                  {ticketTypes.map((ticketType, index) => (
                    <div key={ticketType.name} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`ticket-${ticketType.name}`}
                          checked={ticketType.enabled}
                          onCheckedChange={(checked) => 
                            updateTicketType(index, 'enabled', checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`ticket-${ticketType.name}`}
                          className="font-medium"
                        >
                          {getTicketTypeDisplayName(ticketType.name)}
                        </Label>
                      </div>
                      
                      {ticketType.enabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-3 sm:ml-6">
                          <div className="space-y-1">
                            <Label className="text-sm">Preço (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={ticketType.price}
                              onChange={(e) => updateTicketType(index, 'price', e.target.value)}
                              required={ticketType.enabled}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">Capacidade</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={ticketType.capacity}
                              onChange={(e) => updateTicketType(index, 'capacity', e.target.value)}
                              required={ticketType.enabled}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Evento'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Eventos Criados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum evento criado</p>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0 p-4 border rounded"
                    >
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.date} - {event.location}</p>
                        <p className="text-sm font-medium">
                          A partir de R$ {event.price?.toFixed(2).replace('.', ',')} - {event.sold_tickets || 0}/{event.capacity} vendidos
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        className="mt-2 md:mt-0 self-end md:self-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
