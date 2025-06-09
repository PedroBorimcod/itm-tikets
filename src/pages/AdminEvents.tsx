
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

const AdminEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Tables<'events'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    image: '',
    category: '',
    capacity: ''
  });

  const isAdmin = user?.email === 'pepedr12@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadEvents();
    }
  }, [isAdmin]);

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

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      price: '',
      image: '',
      category: '',
      capacity: ''
    });
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setLoading(true);
    const eventData = {
      ...eventForm,
      price: parseFloat(eventForm.price),
      capacity: parseInt(eventForm.capacity),
      created_by: user?.id
    };

    let error;
    if (editingEvent) {
      const { error: updateError } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('events')
        .insert(eventData);
      error = insertError;
    }

    if (error) {
      toast({
        title: "Erro ao salvar evento",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: editingEvent ? "Evento atualizado" : "Evento criado",
        description: "Operação realizada com sucesso."
      });
      resetForm();
      loadEvents();
    }
    setLoading(false);
  };

  const handleEdit = (event: Tables<'events'>) => {
    setEventForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      location: event.location,
      price: event.price.toString(),
      image: event.image || '',
      category: event.category,
      capacity: event.capacity.toString()
    });
    setEditingEvent(event.id);
  };

  const handleDelete = async (eventId: string) => {
    if (!isAdmin || !confirm('Tem certeza que deseja excluir este evento?')) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      toast({
        title: "Erro ao excluir evento",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Evento excluído",
        description: "Evento removido com sucesso."
      });
      loadEvents();
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Acesso restrito a administradores.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">Gerenciar Eventos</h1>
          <Button onClick={resetForm}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{editingEvent ? 'Editar Evento' : 'Criar Evento'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nome do Evento</Label>
                  <Input
                    id="title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={eventForm.price}
                      onChange={(e) => setEventForm({...eventForm, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacidade</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({...eventForm, capacity: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={eventForm.category} onValueChange={(value) => setEventForm({...eventForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="música">Música</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="entretenimento">Entretenimento</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="gastronomia">Gastronomia</SelectItem>
                      <SelectItem value="palestra">Palestra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">URL da Imagem</Label>
                  <Input
                    id="image"
                    type="url"
                    value={eventForm.image}
                    onChange={(e) => setEventForm({...eventForm, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Salvando...' : editingEvent ? 'Atualizar' : 'Criar'}
                  </Button>
                  {editingEvent && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Eventos Criados</h2>
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.date} - {event.location}
                      </p>
                      <p className="text-sm font-medium">
                        R$ {event.price.toFixed(2)} - {event.sold_tickets || 0}/{event.capacity} vendidos
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
