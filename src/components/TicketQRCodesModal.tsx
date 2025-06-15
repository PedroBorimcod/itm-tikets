
import React from "react";
import { QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface TicketQRCodesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quantity: number;
  qrCodes: string[];
  eventTitle: string;
}

const TicketQRCodesModal: React.FC<TicketQRCodesModalProps> = ({
  open,
  onOpenChange,
  quantity,
  qrCodes,
  eventTitle,
}) => {
  // Sempre mostra um QR code de teste para cada ingresso exibido
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
          {Array.from({ length: quantity }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Badge className="mb-2">Ingresso {i + 1}</Badge>
              <div className="bg-white p-2 rounded border flex flex-col items-center">
                {/* Aqui poderia entrar um SVG de QR real, mas vamos mostrar um box de teste */}
                <div className="w-[150px] h-[150px] bg-gray-100 flex items-center justify-center rounded text-gray-400 font-bold text-2xl mb-2 border-dashed border-2 border-gray-300">
                  QR TESTE
                </div>
                <div className="font-mono text-xs text-muted-foreground mt-2 break-all">
                  TESTE-123456
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketQRCodesModal;
