import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type WithdrawModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (form: {
    withdrawAmount: string;
    method: "pix" | "bank";
    pixKey?: string;
    bankName?: string;
    bankAgency?: string;
    bankAccount?: string;
    bankHolder?: string;
  }) => void;
  withdrawAmount: string;
  setWithdrawAmount: (value: string) => void;
  loading: boolean;
};

export default function WithdrawModal(props: WithdrawModalProps) {
  const { open, onClose, onConfirm, withdrawAmount, setWithdrawAmount, loading } = props;
  const [method, setMethod] = useState<"pix" | "bank">("pix");
  const [pixKey, setPixKey] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAgency, setBankAgency] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankHolder, setBankHolder] = useState("");

  const handleConfirm = () => {
    if (method === "pix" && !pixKey) return;
    if (method === "bank" && (!bankName || !bankAgency || !bankAccount || !bankHolder)) return;

    onConfirm({
      withdrawAmount,
      method,
      pixKey: method === "pix" ? pixKey : undefined,
      bankName: method === "bank" ? bankName : undefined,
      bankAgency: method === "bank" ? bankAgency : undefined,
      bankAccount: method === "bank" ? bankAccount : undefined,
      bankHolder: method === "bank" ? bankHolder : undefined,
    });
  };

  return (
    <Dialog open={props.open} onOpenChange={v => { if (!v) props.onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dados para Depósito</DialogTitle>
        </DialogHeader>
        {/* ALERTA DE HORÁRIO DE SAQUE */}
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Aviso</AlertTitle>
          <AlertDescription>
            Os saques só podem ser solicitados das 8h às 22h.
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          <Label>Forma de Depósito</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={method === "pix"}
                onChange={() => setMethod("pix")}
                name="deposit-method"
              />
              Pix
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={method === "bank"}
                onChange={() => setMethod("bank")}
                name="deposit-method"
              />
              Depósito Bancário
            </label>
          </div>
          {method === "pix" && (
            <div>
              <Label>Chave Pix</Label>
              <Input
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder="Informe sua chave Pix"
              />
            </div>
          )}
          {method === "bank" && (
            <div className="space-y-2">
              <div>
                <Label>Banco</Label>
                <Input
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="Nome do banco"
                />
              </div>
              <div>
                <Label>Agência</Label>
                <Input
                  value={bankAgency}
                  onChange={e => setBankAgency(e.target.value)}
                  placeholder="Número da agência"
                />
              </div>
              <div>
                <Label>Conta</Label>
                <Input
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value)}
                  placeholder="Número da conta"
                />
              </div>
              <div>
                <Label>Titular</Label>
                <Input
                  value={bankHolder}
                  onChange={e => setBankHolder(e.target.value)}
                  placeholder="Nome completo do titular"
                />
              </div>
            </div>
          )}
          <Label>Valor do Saque</Label>
          <Input
            type="number"
            placeholder="Valor do saque"
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
          />
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleConfirm} disabled={loading || !withdrawAmount || (method === "pix" ? !pixKey : (!bankName || !bankAgency || !bankAccount || !bankHolder))} className="w-full">
            {loading ? "Processando..." : "Confirmar Saque"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
