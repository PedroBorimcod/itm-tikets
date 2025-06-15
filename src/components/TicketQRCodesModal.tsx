
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
  // Mostra um código QR único por ingresso
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
              {qrCodes && qrCodes[i] ? (
                <div className="bg-white p-2 rounded border">
                  {/* Aqui, pode-se usar um componente real de QR code, se desejar */}
                  <div className="font-mono text-base">{qrCodes[i]}</div>
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

