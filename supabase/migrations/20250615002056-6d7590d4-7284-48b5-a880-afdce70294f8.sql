
-- Remover restrição UNIQUE da coluna qr_code (caso exista)
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.order_items'::regclass
      AND contype = 'u'
      AND array_to_string(conkey, ',') = (
        SELECT array_to_string(array_agg(attnum), ',')
        FROM pg_attribute
        WHERE attrelid = 'public.order_items'::regclass
          AND attname = 'qr_code'
      );

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.order_items DROP CONSTRAINT %I', constraint_name);
    END IF;
END$$;

-- Alterar coluna qr_code para aceitar arrays de texto
ALTER TABLE public.order_items
  ALTER COLUMN qr_code TYPE text[] USING
    CASE
      WHEN qr_code IS NULL THEN ARRAY[]::text[]
      WHEN array_length(string_to_array(qr_code, ';'), 1) > 1 THEN string_to_array(qr_code, ';')
      ELSE ARRAY[qr_code]
    END;

-- Comentário explicativo (opcional)
COMMENT ON COLUMN public.order_items.qr_code IS 'Array de códigos QR, um para cada ingresso comprado neste item do pedido';
