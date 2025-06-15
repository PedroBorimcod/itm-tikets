
import React from "react";
import { QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface TicketQRCodesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quantity: number;
  qrCode: string | null;
  eventTitle: string;
}

const TicketQRCodesModal: React.FC<TicketQRCodesModalProps> = ({
  open,
  onOpenChange,
  quantity,
  qrCode,
  eventTitle,
}) => {
  // Simula múltiplos QR codes usando o mesmo código, pois não há informação de múltiplos QR codes no backend.
  // Se no futuro houver um array de códigos, basta trocar a lógica aqui.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              {eventTitle}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {quantity > 1 ? `${quantity} ingressos` : "1 ingresso"}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {[...Array(quantity)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Badge className="mb-2">Ingresso {i + 1}</Badge>
              {qrCode ? (
                <div className="bg-white p-2 rounded border">
                  {/* Um futuro: coloque aqui um componente de QR code real */}
                  <div className="font-mono text-base">{qrCode}</div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">QR code não disponível</div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketQRCodesModal;
