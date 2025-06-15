
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Withdrawal = Tables<"withdrawals">;
type Producer = Tables<"producers">;

interface ProducerWithWithdrawal extends Withdrawal {
  producer: Producer | null;
}

interface AdminWithdrawRequestsProps {}

const getBankOrPixDisplay = (withdrawal: Withdrawal) => {
  if (withdrawal.method === "pix") {
    return (
      <div>
        <span className="font-semibold">Chave Pix: </span>
        <span>{withdrawal.pix_key}</span>
      </div>
    );
  }
  if (withdrawal.method === "bank") {
    return (
      <div className="space-y-1">
        <div><span className="font-semibold">Banco: </span>{withdrawal.bank_name}</div>
        <div><span className="font-semibold">Agência: </span>{withdrawal.bank_agency}</div>
        <div><span className="font-semibold">Conta: </span>{withdrawal.bank_account}</div>
        <div><span className="font-semibold">Titular: </span>{withdrawal.bank_holder}</div>
      </div>
    );
  }
  return <div>Dados não encontrados</div>;
};

export function AdminWithdrawRequests({}: AdminWithdrawRequestsProps) {
  const [withdrawals, setWithdrawals] = useState<ProducerWithWithdrawal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Busca saques pendentes + info da produtora em 1 consulta.
    supabase
      .from("withdrawals")
      .select(
        "*, producer:producers(*)"
      )
      .eq("status", "pending")
      .then(({ data }) => {
        setWithdrawals((data as ProducerWithWithdrawal[]) || []);
      });
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  if (withdrawals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Banknote className="mr-2" />Solicitações de Saque</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Não há solicitações de saque pendentes no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle><Banknote className="mr-2" />Solicitações de Saque</CardTitle>
        <CardDescription className="text-xs">
          Clique na produtora para ver os dados bancários ou chave Pix.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {withdrawals.map((w) => (
            <div key={w.id} className="py-3">
              <button
                onClick={() => handleSelect(w.id)}
                className={`flex justify-between items-center w-full text-left px-2 py-2 rounded hover:bg-muted transition group ${selectedId === w.id ? 'bg-muted/50' : ''}`}
              >
                <span className="font-medium text-primary group-hover:underline">
                  {w.producer?.name || "(produtora)"}
                </span>
                <Badge variant="secondary">
                  R$ {(Number(w.net_amount) * 0.9).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Badge>
              </button>
              {selectedId === w.id && (
                <div className="mt-2 ml-2 bg-muted rounded p-3 border text-sm animate-fade-in-up">
                  {getBankOrPixDisplay(w)}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
