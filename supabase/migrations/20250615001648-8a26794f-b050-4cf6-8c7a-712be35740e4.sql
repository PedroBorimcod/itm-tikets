
-- Ativar Row Level Security na tabela order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Permitir que um usuário remova/exclua apenas seus próprios ingressos (ingressos ligados a um pedido cujo user_id é igual ao usuário logado)
CREATE POLICY "Usuários podem excluir seus próprios ingressos" 
  ON public.order_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );
