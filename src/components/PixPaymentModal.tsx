import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, QrCode, X, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  eventTitle: string;
  quantity: number;
}

const PixPaymentModal = ({ isOpen, onClose, totalAmount, eventTitle, quantity }: PixPaymentModalProps) => {
  const { toast } = useToast();
  const [pixGenerated, setPixGenerated] = useState(false);

  // Simulação de uma chave PIX aleatória
  const generatePixCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const pixCode = pixGenerated ? generatePixCode() : '';
  
  // QR Code simulado (na vida real seria gerado por uma API de pagamentos PIX)
  const qrCodeData = `00020126580014BR.GOV.BCB.PIX0136${pixCode}520400005303986540${totalAmount.toFixed(2)}5802BR5925EVENTO TICKETS LTDA6009SAO PAULO62070503***6304`;

  const handleGeneratePix = () => {
    setPixGenerated(true);
    toast({
      title: "PIX gerado com sucesso!",
      description: "Use o código ou QR Code para realizar o pagamento",
    });
  };

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      toast({
        title: "Código copiado!",
        description: "Cole o código no seu app de pagamentos",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Tente copiar manualmente",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Pagamento PIX</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo do pedido */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Resumo do pedido</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{eventTitle}</span>
                <span>{quantity}x</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span className="text-primary">R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          {!pixGenerated ? (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                <h3 className="font-semibold">Gerar código PIX</h3>
                <p className="text-sm text-muted-foreground">
                  Clique no botão abaixo para gerar seu código PIX e finalizar a compra
                </p>
              </div>
              
              <Button 
                onClick={handleGeneratePix}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Gerar PIX
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* QR Code simulado */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border mx-auto w-fit">
                  <div className="w-48 h-48 bg-black/10 flex items-center justify-center rounded">
                    <QrCode className="h-24 w-24 text-black/60" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Escaneie o QR Code com seu app de pagamentos
                </p>
              </div>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">ou</span>
              </div>

              {/* Código PIX */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Código PIX Copia e Cola</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted p-3 rounded text-xs font-mono break-all">
                    {pixCode}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopyPixCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-blue-900">Como pagar:</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>1. Abra seu app de pagamentos (banco ou carteira digital)</li>
                      <li>2. Escolha PIX e "Copia e Cola"</li>
                      <li>3. Cole o código ou escaneie o QR Code</li>
                      <li>4. Confirme o pagamento</li>
                    </ul>
                    <p className="text-xs text-blue-600 font-medium mt-2">
                      Você tem 15 minutos para finalizar o pagamento.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixPaymentModal;