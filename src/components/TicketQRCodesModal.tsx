
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
  const qrAvailable = Array.isArray(qrCodes) && qrCodes.length > 0;

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
          {!qrAvailable ? (
            <div className="text-center space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="text-amber-800 text-sm">
                  <strong>⚠️ QR Codes não disponíveis</strong>
                  <br />
                  Os QR codes para entrada só ficarão disponíveis após a confirmação do pagamento por email.
                  <br />
                  <span className="text-amber-700 font-medium">
                    ✉️ Verifique seu email - quando o pagamento for confirmado, você receberá os QR codes por lá!
                  </span>
                </div>
              </div>
            </div>
          ) : (
            Array.from({ length: quantity }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Badge className="mb-2">Ingresso {i + 1}</Badge>
                <div className="bg-white p-2 rounded border flex flex-col items-center">
                  {/* QR real (pode ser um texto ou transformar em SVG posteriormente) */}
                  <div className="w-[150px] h-[150px] bg-gray-100 flex items-center justify-center rounded text-gray-700 font-mono text-xs border-dashed border-2 border-gray-300 break-all">
                    {qrCodes[i] || "QR não disponível"}
                  </div>
                  {qrCodes[i] && (
                    <div className="font-mono text-xs text-muted-foreground mt-2 break-all">
                      {qrCodes[i]}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketQRCodesModal;

