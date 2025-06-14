
-- Criar tabela para tipos de ingressos
CREATE TABLE public.ticket_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- front_stage, pista, mesanino, back_stage
  price NUMERIC NOT NULL,
  capacity INTEGER NOT NULL,
  sold_tickets INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX idx_ticket_types_event_id ON ticket_types(event_id);

-- Atualizar tabela de order_items para referenciar ticket_type ao invés de event diretamente
ALTER TABLE order_items 
ADD COLUMN ticket_type_id UUID REFERENCES ticket_types(id);

-- Remover a tabela cart_items já que não usaremos mais carrinho
DROP TABLE IF EXISTS cart_items;
