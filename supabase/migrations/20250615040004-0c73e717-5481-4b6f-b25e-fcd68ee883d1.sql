
-- Adiciona explicitamente o papel admin para o usuário com email pepedr13@gmail.com

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'pepedr13@gmail.com'
ON CONFLICT DO NOTHING;
