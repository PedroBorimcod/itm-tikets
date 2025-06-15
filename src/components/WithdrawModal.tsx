
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
      <DialogContent className="bg-white dark:bg-background rounded-xl p-0 border-0 max-w-md shadow-2xl animate-fade-in">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold mb-2">Dados para Depósito</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive" className="mb-5 rounded-md border-2 border-destructive/20 bg-red-50 dark:bg-red-900/10">
            <AlertTitle className="font-semibold">Aviso</AlertTitle>
            <AlertDescription>
              Os saques só podem ser solicitados das <span className="font-medium text-destructive">8h às 22h</span>.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div>
              <Label className="mb-2 block text-base">Forma de Depósito</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 rounded-lg border transition focus:outline-none
                    ${method === "pix"
                      ? "bg-primary text-white border-primary shadow"
                      : "bg-muted text-foreground border-muted-foreground/30 hover:bg-accent"}
                  `}
                  onClick={() => setMethod("pix")}
                >
                  Pix
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 rounded-lg border transition focus:outline-none
                    ${method === "bank"
                      ? "bg-primary text-white border-primary shadow"
                      : "bg-muted text-foreground border-muted-foreground/30 hover:bg-accent"}
                  `}
                  onClick={() => setMethod("bank")}
                >
                  Depósito Bancário
                </button>
              </div>
            </div>

            {method === "pix" && (
              <div>
                <Label className="mb-1 block">Chave Pix</Label>
                <Input
                  value={pixKey}
                  onChange={e => setPixKey(e.target.value)}
                  placeholder="Informe sua chave Pix"
                  className="focus:ring-primary focus:border-primary"
                />
              </div>
            )}

            {method === "bank" && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="col-span-2">
                  <Label className="mb-1 block">Banco</Label>
                  <Input
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="Nome do banco"
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Agência</Label>
                  <Input
                    value={bankAgency}
                    onChange={e => setBankAgency(e.target.value)}
                    placeholder="Número da agência"
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Conta</Label>
                  <Input
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    placeholder="Número da conta"
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="mb-1 block">Titular</Label>
                  <Input
                    value={bankHolder}
                    onChange={e => setBankHolder(e.target.value)}
                    placeholder="Nome completo do titular"
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="mb-1 block">Valor do Saque</Label>
              <Input
                type="number"
                placeholder="Valor do saque"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                className="focus:ring-primary focus:border-primary"
                min={1}
              />
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button
              onClick={handleConfirm}
              disabled={
                loading ||
                !withdrawAmount ||
                (method === "pix"
                  ? !pixKey
                  : (!bankName || !bankAgency || !bankAccount || !bankHolder))
              }
              className="w-full py-3 text-base font-semibold shadow-md hover:scale-[1.02] transition-transform"
            >
              {loading ? "Processando..." : "Confirmar Saque"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
