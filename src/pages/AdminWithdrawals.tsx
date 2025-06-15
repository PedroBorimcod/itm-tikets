
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

type Withdrawal = {
  id: string;
  producer_id: string | null;
  amount: number;
  fee: number;
  net_amount: number;
  status: string | null;
  created_at: string;
  updated_at: string;
};

type Producer = {
  id: string;
  name: string;
  email: string;
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [producers, setProducers] = useState<{ [id: string]: Producer }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllWithdrawals() {
      setLoading(true);
      // Fetch withdrawals
      const { data: allWithdrawals, error } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setLoading(false);
        return;
      }
      setWithdrawals(allWithdrawals ?? []);

      // Fetch producers
      const producerIds = Array.from(new Set((allWithdrawals ?? []).map((w: Withdrawal) => w.producer_id).filter(Boolean)));
      if (producerIds.length > 0) {
        const { data: prodList } = await supabase
          .from("producers")
          .select("id, name, email")
          .in("id", producerIds);

        const map: { [id: string]: Producer } = {};
        (prodList ?? []).forEach((prod: Producer) => {
          map[prod.id] = prod;
        });
        setProducers(map);
      }
      setLoading(false);
    }
    loadAllWithdrawals();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Painel de Saques dos Produtores</CardTitle>
            <CardDescription>Veja todas as solicitações de saque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produtora</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Valor solicitado</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Valor líquido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Solicitado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Carregando...</TableCell>
                    </TableRow>
                  ) : withdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Nenhum saque encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    withdrawals.map((withdrawal) => {
                      const producer = withdrawal.producer_id ? producers[withdrawal.producer_id] : null;
                      return (
                        <TableRow key={withdrawal.id}>
                          <TableCell>
                            {producer ? producer.name : "-"}
                          </TableCell>
                          <TableCell>
                            {producer ? producer.email : "-"}
                          </TableCell>
                          <TableCell>
                            R$ {withdrawal.amount?.toFixed(2).replace('.', ',')}
                          </TableCell>
                          <TableCell>
                            R$ {withdrawal.fee?.toFixed(2).replace('.', ',')}
                          </TableCell>
                          <TableCell>
                            R$ {withdrawal.net_amount?.toFixed(2).replace('.', ',')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              withdrawal.status === "completed"
                                ? "default"
                                : withdrawal.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }>
                              {withdrawal.status === "completed"
                                ? "Concluído"
                                : withdrawal.status === "pending"
                                ? "Pendente"
                                : "Falhou"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(withdrawal.created_at).toLocaleString("pt-BR")}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
