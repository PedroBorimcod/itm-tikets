import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Trash2, Users, ArrowLeft, Plus, Minus, Pencil } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { ImageDropzone } from "@/components/ImageDropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

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

  // Estados para edição de evento
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [editingTicketTypes, setEditingTicketTypes] = useState<TicketTypeFormData[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLoading, setEditingLoading] = useState(false);

  // Carregar tipos de ingressos de um evento
  const loadTicketTypesForEvent = async (eventId: string): Promise<TicketTypeFormData[]> => {
    const { data, error } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('event_id', eventId);

    if (error) {
      toast({
        title: "Erro ao buscar lotes",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }

    return (data || []).map(tt => ({
      name: tt.name,
      price: tt.price?.toString() || '',
      capacity: tt.capacity?.toString() || '',
      enabled: true
    }));
  };

  // Abrir modal e carregar dados atuais
  const handleEditClick = async (event: Event) => {
    const ticketTypes = await loadTicketTypesForEvent(event.id);
    setEditingEvent(event);
    setEditingTitle(event.title || '');
    setEditingTicketTypes(ticketTypes);
    setShowEditModal(true);
  };

  // Atualiza lote editado
  const updateEditingTicketType = (index: number, field: keyof TicketTypeFormData, value: string) => {
    const updated = [...editingTicketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setEditingTicketTypes(updated);
  };

  // Salvar alterações do evento/lotes
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || editingTicketTypes.length === 0) return;

    setEditingLoading(true);

    try {
      // Atualiza evento, título e valores
      const updatedPrice = Math.min(...editingTicketTypes.map(tt => parseFloat(tt.price)));
      const updatedCapacity = editingTicketTypes.reduce((sum, tt) => sum + parseInt(tt.capacity), 0);

      const { error: eventError } = await supabase
        .from('events')
        .update({
          title: editingTitle,
          price: updatedPrice,
          capacity: updatedCapacity
        })
        .eq('id', editingEvent.id);

      if (eventError) throw eventError;

      // Atualiza tipos de ingresso
      for (const tt of editingTicketTypes) {
        const { error: ttError } = await supabase
          .from('ticket_types')
          .update({
            price: parseFloat(tt.price),
            capacity: parseInt(tt.capacity)
          })
          .eq('event_id', editingEvent.id)
          .eq('name', tt.name);
        if (ttError) throw ttError;
      }

      toast({
        title: "Evento atualizado",
        description: "O evento e os lotes/tipos de ingresso foram alterados com sucesso."
      });
      setShowEditModal(false);
      setEditingEvent(null);
      setEditingTitle('');
      setEditingTicketTypes([]);
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Erro na atualização",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setEditingLoading(false);
    }
  };

  // Modal de novo admin
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);

    // 1. Cria usuário no Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      user_metadata: { full_name: adminName },
      email_confirm: true,
    });

    if (error || !data?.user?.id) {
      toast({
        title: 'Erro ao criar usuário',
        description: error?.message || 'Não foi possível criar o admin no Auth.',
        variant: 'destructive'
      });
      setAdminLoading(false);
      return;
    }
    // 2. Adiciona função admin ao user_roles
    const { error: roleError } = await supabase.from('user_roles').insert([
      {
        user_id: data.user.id,
        role: 'admin'
      }
    ]);
    setAdminLoading(false);

    if (roleError) {
      toast({
        title: 'Usuário criado, mas erro ao atribuir admin',
        description: roleError.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Novo admin cadastrado!',
        description: `Usuário ${adminEmail} já pode acessar o painel administrativo.`
      });
      setShowAdminModal(false);
      setAdminEmail('');
      setAdminName('');
      setAdminPassword('');
    }
  };

  if (user?.email !== 'pepedr13@gmail.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Container responsivo com padding extra em mobile */}
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho responsivo */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à tela inicial
          </Button>
          <h1 className="text-2xl md:text-3xl font-black">Administração</h1>
          <Button
            variant="secondary"
            className="ml-auto"
            onClick={() => setShowAdminModal(true)}
          >
            Criar novo admin
          </Button>
          <Button
            variant="outline"
            className="ml-2"
            onClick={() => navigate('/admin/producers')}
          >
            Gerenciar produtoras
          </Button>
          <Button
            variant="outline"
            className="ml-2"
            onClick={() => navigate('/admin/withdrawals')}
          >
            Painel de Saques
          </Button>
        </div>

        {/* Modal para cadastro de novo admin */}
        <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Admin</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo usuário que poderá acessar a administração.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAdmin} className="space-y-4 my-2">
              <div>
                <Label htmlFor="admin-name">Nome</Label>
                <Input
                  id="admin-name"
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Senha</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setShowAdminModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={adminLoading}>
                  {adminLoading ? "Cadastrando..." : "Cadastrar admin"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de edição de evento/lotes */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Evento e Lotes</DialogTitle>
              <DialogDescription>
                Altere as informações do evento e dos lotes (tipos de ingresso) deste evento.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSave} className="space-y-5 my-2">
              <div>
                <Label>Título do evento</Label>
                <Input
                  value={editingTitle}
                  onChange={e => setEditingTitle(e.target.value)}
                  required
                />
              </div>
              {/* Lotes editáveis */}
              <div className="space-y-3">
                {editingTicketTypes.map((tt, idx) => (
                  <div key={tt.name} className="border rounded-lg p-4 space-y-3">
                    <Label className="font-medium">{getTicketTypeDisplayName(tt.name)}</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <Label className="text-sm">Preço (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={tt.price}
                          onChange={e => updateEditingTicketType(idx, "price", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Capacidade</Label>
                        <Input
                          type="number"
                          value={tt.capacity}
                          onChange={e => updateEditingTicketType(idx, "capacity", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={editingLoading}>
                  {editingLoading ? "Salvando..." : "Salvar alterações"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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

                {/* Image Dropzone */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="block">
                    Foto do Evento
                  </Label>
                  <ImageDropzone
                    currentUrl={formData.image}
                    onImageUrl={(url) =>
                      setFormData((f) => ({ ...f, image: url }))
                    }
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
                      <div className="flex gap-2 mt-2 md:mt-0 self-end md:self-auto">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(event)}
                          aria-label="Editar evento"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
