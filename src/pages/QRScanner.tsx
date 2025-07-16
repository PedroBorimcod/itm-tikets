import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Camera, CameraOff, Check, X, AlertTriangle } from 'lucide-react';

interface TicketInfo {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  ticketType: string;
  customerName: string;
  usedAt: string;
}

interface ValidationResult {
  valid: boolean;
  message: string;
  ticketInfo?: TicketInfo;
}

export default function QRScanner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, date, time')
      .order('date', { ascending: true });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar eventos",
        variant: "destructive",
      });
    } else {
      setEvents(data || []);
    }
  };

  const startScanning = async () => {
    if (!selectedEventId) {
      toast({
        title: "Erro",
        description: "Selecione um evento primeiro",
        variant: "destructive",
      });
      return;
    }

    if (!videoRef.current) return;

    try {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          validateQRCode(result.data);
          stopScanning();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScannerRef.current.start();
      setIsScanning(true);
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar a câmera. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    setIsScanning(false);
  };

  const validateQRCode = async (qrCode: string) => {
    if (!selectedEventId) {
      toast({
        title: "Erro",
        description: "Selecione um evento primeiro",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setValidationResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-qr-code', {
        body: { qrCode, eventId: selectedEventId }
      });

      if (error) throw error;

      setValidationResult(data);
      
      if (data.valid) {
        toast({
          title: "QR Code Válido!",
          description: "Entrada autorizada",
        });
      } else {
        toast({
          title: "QR Code Inválido",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error validating QR code:', error);
      toast({
        title: "Erro",
        description: "Erro ao validar QR code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualValidation = () => {
    if (!manualCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite um código QR",
        variant: "destructive",
      });
      return;
    }
    validateQRCode(manualCode.trim());
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Scanner QR Code</h1>
      </div>

      <div className="space-y-6">
        {/* Seleção de Evento */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="event-select">Evento</Label>
            <select
              id="event-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Selecione um evento</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Scanner de Câmera */}
        <Card>
          <CardHeader>
            <CardTitle>Scanner por Câmera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg border"
                style={{ display: isScanning ? 'block' : 'none' }}
              />
              {!isScanning && (
                <div className="w-full max-w-md mx-auto h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Camera className="w-16 h-16 mx-auto mb-2" />
                    <p>Clique em "Iniciar Scanner" para começar</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-center">
              {!isScanning ? (
                <Button onClick={startScanning} disabled={!selectedEventId}>
                  <Camera className="w-4 h-4 mr-2" />
                  Iniciar Scanner
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="outline">
                  <CameraOff className="w-4 h-4 mr-2" />
                  Parar Scanner
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entrada Manual */}
        <Card>
          <CardHeader>
            <CardTitle>Entrada Manual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="manual-code">Código QR</Label>
              <Input
                id="manual-code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Digite ou cole o código QR"
              />
            </div>
            <Button 
              onClick={handleManualValidation} 
              disabled={loading || !selectedEventId}
              className="w-full"
            >
              {loading ? "Validando..." : "Validar Código"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado da Validação */}
        {validationResult && (
          <Card>
            <CardContent className="pt-6">
              <Alert className={validationResult.valid ? "border-green-500" : "border-red-500"}>
                <div className="flex items-center gap-2">
                  {validationResult.valid ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                  <AlertDescription className={validationResult.valid ? "text-green-700" : "text-red-700"}>
                    <strong>{validationResult.valid ? "VÁLIDO" : "INVÁLIDO"}</strong>
                    <br />
                    {validationResult.message}
                  </AlertDescription>
                </div>
              </Alert>

              {validationResult.valid && validationResult.ticketInfo && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Informações do Ingresso:</h4>
                  <div className="space-y-1 text-sm text-green-700">
                    <p><strong>Evento:</strong> {validationResult.ticketInfo.eventTitle}</p>
                    <p><strong>Data:</strong> {new Date(validationResult.ticketInfo.eventDate).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Horário:</strong> {validationResult.ticketInfo.eventTime}</p>
                    <p><strong>Tipo:</strong> {validationResult.ticketInfo.ticketType}</p>
                    <p><strong>Cliente:</strong> {validationResult.ticketInfo.customerName}</p>
                    <p><strong>Validado em:</strong> {new Date(validationResult.ticketInfo.usedAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}