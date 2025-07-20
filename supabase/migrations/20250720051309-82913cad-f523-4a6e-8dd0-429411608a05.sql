-- Criar tabela para configurações de pagamento PIX
CREATE TABLE public.payment_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pix_key TEXT,
  pix_qr_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar configurações de pagamento
CREATE POLICY "Admins can manage payment config" 
ON public.payment_config 
FOR ALL 
USING (auth.email() = 'pepedr13@gmail.com');

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_payment_config_updated_at
BEFORE UPDATE ON public.payment_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configuração inicial
INSERT INTO public.payment_config (pix_key, pix_qr_image) 
VALUES ('', '');