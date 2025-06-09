
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

type Producer = Tables<'producers'>;

const AdminProducers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [producers, setProducers] = useState<Producer[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email !== '2581') {
      navigate('/');
      return;
    }
    loadProducers();
  }, [user, navigate]);

  const loadProducers = async () => {
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading producers:', error);
    } else {
      setProducers(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    const { error } = await supabase.from('producers').insert({
      name,
      email,
      password_hash: password, // In production, hash this properly
      created_by: user.id
    });

    if (error) {
      toast({
        title: "Erro ao criar produtora",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Produtora criada",
        description: "Credenciais da produtora criadas com sucesso."
      });
      setName('');
      setEmail('');
      setPassword('');
      loadProducers();
    }
    
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('producers')
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
        title: "Produtora deletada",
        description: "Produtora removida com sucesso."
      });
      loadProducers();
    }
  };

  if (user?.email !== '2581') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Admin
          </Button>
          <h1 className="text-3xl font-black">Gerenciar Produtoras</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Produtora</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Produtora</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Produtora'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtoras Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {producers.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma produtora cadastrada</p>
                ) : (
                  producers.map((producer) => (
                    <div key={producer.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-semibold">{producer.name}</h3>
                        <p className="text-sm text-muted-foreground">{producer.email}</p>
                        <p className="text-sm font-medium">
                          Saldo: R$ {producer.balance?.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(producer.id)}
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

export default AdminProducers;
