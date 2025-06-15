
-- Permitir que o usuário de email pepedr13@gmail.com consiga SEMPRE consultar e inserir admin em user_roles

-- 1. Identifica o user_id fixo desse email (ajuste para seu ambiente)
DO $$
DECLARE
  my_uid uuid;
BEGIN
  SELECT id INTO my_uid FROM auth.users WHERE email = 'pepedr13@gmail.com';
  -- Politica SELECT (visualizar user_roles se próprio admin OU se for esse user especial)
  EXECUTE format($q$
    DROP POLICY IF EXISTS "Admins can see all roles" ON public.user_roles;
    CREATE POLICY "Admins and master can see all roles"
    ON public.user_roles
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
      ) OR (auth.uid() = '%s')
    );
  $q$, my_uid);

  -- Politica ALL (CRUD nas roles se próprio admin OU se for esse user especial)
  EXECUTE format($q$
    DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
    CREATE POLICY "Admins and master can manage roles"
    ON public.user_roles
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
      ) OR (auth.uid() = '%s')
    );
  $q$, my_uid);

END
$$;

