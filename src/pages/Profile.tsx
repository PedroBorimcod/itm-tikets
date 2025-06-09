
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading profile:', error);
    } else if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || ''
      });
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      });

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso."
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-8">Meus Dados</h1>

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>

            <Button 
              onClick={updateProfile}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
