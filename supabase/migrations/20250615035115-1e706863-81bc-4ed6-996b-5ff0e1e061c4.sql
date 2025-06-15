
-- 1. Enum para função de administradores
CREATE TYPE app_role AS ENUM ('admin');

-- 2. Tabela que liga usuários às suas roles (um usuário pode ter várias roles no futuro)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unique (user_id, role)
);

-- 3. RLS: Apenas administradores podem ver e alterar (CRUD) as atribuições de role
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can see all roles" ON public.user_roles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- 4. Função utilitária segura para verificar role (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 5. Garantir que pepedr13@gmail.com sempre será admin 
-- (insere automaticamente se logar e não tiver)
-- Atenção: Para garantir essa atribuição automaticamente, precisamos rodar um código na aplicação na autenticação desse usuário.

