import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, QrCode, X, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePaymentSimulation } from '@/hooks/usePaymentSimulation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  totalAmount: number;
  eventTitle: string;
  quantity: number;
  orderId: string | null;
}

const PixPaymentModal = ({ isOpen, onClose, onCancel, totalAmount, eventTitle, quantity, orderId }: PixPaymentModalProps) => {
  const { toast } = useToast();
  const [pixGenerated, setPixGenerated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutos em segundos
  const { simulatePayment, isSimulating } = usePaymentSimulation(orderId);
  const { isAdmin } = useAdminAuth();
  const [pixConfig, setPixConfig] = useState<{pix_key: string, pix_qr_image: string}>({pix_key: '', pix_qr_image: ''});

  // Carregar configuração PIX
  useEffect(() => {
    const loadPixConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_config')
          .select('pix_key, pix_qr_image')
          .single();
        
        if (data && !error) {
          setPixConfig({
            pix_key: data.pix_key || '',
            pix_qr_image: data.pix_qr_image || ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configuração PIX:', error);
      }
    };

    if (isOpen) {
      loadPixConfig();
    }
  }, [isOpen]);

  // Timer effect
  useEffect(() => {
    if (!pixGenerated || !isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast({
            title: "Tempo esgotado!",
            description: "O pedido foi cancelado automaticamente.",
            variant: "destructive"
          });
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pixGenerated, isOpen, onCancel, toast]);

  // Formatar tempo para mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Usar chave PIX real configurada pelo admin
  const pixCode = pixGenerated ? (pixConfig.pix_key || 'Chave PIX não configurada') : '';
  
  // QR Code usando a chave configurada
  const qrCodeData = `00020126580014BR.GOV.BCB.PIX0136${pixCode}520400005303986540${totalAmount.toFixed(2)}5802BR5925EVENTO TICKETS LTDA6009SAO PAULO62070503***6304`;

  const handleGeneratePix = () => {
    setPixGenerated(true);
    setTimeLeft(120); // Reset timer
    toast({
      title: "PIX gerado com sucesso!",
      description: "Você tem 2 minutos para realizar o pagamento",
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
            {pixGenerated && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                timeLeft > 60 ? 'bg-green-100 text-green-700' : 
                timeLeft > 30 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'
              }`}>
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
            )}
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
              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border mx-auto w-fit">
                  {pixConfig.pix_qr_image ? (
                    <img 
                      src={pixConfig.pix_qr_image} 
                      alt="QR Code PIX" 
                      className="w-48 h-48 object-contain rounded"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-black/10 flex items-center justify-center rounded flex-col gap-2">
                      <QrCode className="h-24 w-24 text-black/60" />
                      <p className="text-xs text-muted-foreground text-center">
                        QR Code não configurado
                      </p>
                    </div>
                  )}
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

              {/* Instruções com timer */}
              <div className={`border rounded-lg p-3 ${
                timeLeft > 60 ? 'bg-blue-50 border-blue-200' : 
                timeLeft > 30 ? 'bg-yellow-50 border-yellow-200' : 
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {timeLeft <= 30 ? (
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h4 className={`font-semibold text-sm ${
                      timeLeft > 60 ? 'text-blue-900' : 
                      timeLeft > 30 ? 'text-yellow-900' : 
                      'text-red-900'
                    }`}>
                      {timeLeft <= 30 ? 'Tempo quase esgotando!' : 'Como pagar:'}
                    </h4>
                    <ul className={`text-xs space-y-1 ${
                      timeLeft > 60 ? 'text-blue-800' : 
                      timeLeft > 30 ? 'text-yellow-800' : 
                      'text-red-800'
                    }`}>
                      <li>1. Abra seu app de pagamentos (banco ou carteira digital)</li>
                      <li>2. Escolha PIX e "Copia e Cola"</li>
                      <li>3. Cole o código ou escaneie o QR Code</li>
                      <li>4. Confirme o pagamento</li>
                    </ul>
                    <p className={`text-xs font-medium mt-2 ${
                      timeLeft > 60 ? 'text-blue-600' : 
                      timeLeft > 30 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {timeLeft <= 30 ? 
                        `ATENÇÃO: Restam apenas ${formatTime(timeLeft)} para finalizar o pagamento!` :
                        `Tempo restante: ${formatTime(timeLeft)}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Fechar
                </Button>
                {isAdmin && (
                  <Button 
                    onClick={async () => {
                      const success = await simulatePayment();
                      if (success) {
                        onClose();
                      }
                    }}
                    disabled={isSimulating}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isSimulating ? 'Processando...' : 'Simular Pagamento'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixPaymentModal;