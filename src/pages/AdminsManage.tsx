
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface RoleEntry {
  id: string;
  user_id: string;
  role: string;
}

const AdminsManage = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [admins, setAdmins] = useState<RoleEntry[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/");
    if (isAdmin) {
      loadAdmins();
    }
    // eslint-disable-next-line
  }, [isAdmin, adminLoading]);

  async function loadAdmins() {
    // Busca todos os admins (join auth.users)
    const { data, error } = await supabase
      .from("user_roles")
      .select("id, user_id, role");
    if (error) return;
    setAdmins(data?.filter((r) => r.role === "admin") || []);
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Busca user_id pelo email
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("full_name", "%"); // Força a consulta a profiles porque auth.users não é exposto
    // Aqui, seria ideal se o email estivesse em profiles (mas está só em auth.users). Vamos tentar por workaround:
    // Consultar id pela função fetchUserIdByEmail, se disponível

    // Não temos acesso ao auth.users direto, então não é possível inserir admin para email que nunca logou.
    // Avisar isso ao usuário.
    const apiUrl = `${SUPABASE_URL}/rest/v1/profiles?select=id&email=eq.${email}`;
    const resp = await fetch(apiUrl, {
      headers: {
        apikey: (supabase as any).apikey,
        Authorization: `Bearer ${(supabase as any).apikey}`,
      }
    });
    if (resp.ok) {
      const resData = await resp.json();
      if (!resData || !resData.length) {
        toast({
          title: "Usuário não encontrado",
          description: "Só é possível adicionar administradores que já fizeram login pelo menos uma vez no sistema.",
          variant: "destructive"
        });
        setLoading(false); return;
      }
      const user_id = resData[0].id;
      // Insere admin
      const { error: insertError } = await supabase.from("user_roles").insert([
        { user_id, role: "admin" }
      ]);
      if (insertError) {
        toast({
          title: "Erro ao adicionar administrador",
          description: insertError.message,
          variant: "destructive"
        });
      } else {
        toast({ title: "Administrador adicionado!" });
        setEmail("");
        loadAdmins();
      }
    } else {
      toast({
        title: "Usuário não encontrado",
        description: "Só é possível adicionar administradores que já fizeram login pelo menos uma vez no sistema.",
        variant: "destructive"
      });
    }
    setLoading(false);
  }

  async function handleRemoveAdmin(roleId: string) {
    setLoading(true);
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast({
        title: "Erro ao remover administrador",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({ title: "Administrador removido!" });
      loadAdmins();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-2 py-6">
      <div className="max-w-lg w-full">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="flex gap-2 items-end mb-4">
              <div className="flex-1">
                <Label>Email do novo admin</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>Adicionar</Button>
            </form>
            <h3 className="font-semibold mt-4 mb-2">Lista de administradores</h3>
            <ul className="divide-y">
              {admins.map((a) => (
                <li key={a.id} className="py-2 flex items-center justify-between">
                  <span>{a.user_id}</span>
                  {user && user.id !== a.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAdmin(a.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <Button className="mt-6" variant="ghost" onClick={() => navigate('/admin/events')}>
              Voltar para Administração
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminsManage;
