
-- 1. Criar bucket público chamado "event-images"
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true);

-- 2. Permitir uploads/deletes/listas públicos para o bucket "event-images"
-- (política liberal para facilitar o upload dos eventos)

-- Policy: Qualquer usuário pode SELECT objetos do bucket event-images
create policy "Public read for event-images"
on storage.objects for select
using (bucket_id = 'event-images');

-- Policy: Qualquer usuário pode INSERT objetos no bucket event-images
create policy "Public upload for event-images"
on storage.objects for insert
with check (bucket_id = 'event-images');

-- Policy: Qualquer usuário pode UPDATE objetos no bucket event-images
create policy "Public update for event-images"
on storage.objects for update
using (bucket_id = 'event-images');

-- Policy: Qualquer usuário pode DELETE objetos no bucket event-images
create policy "Public delete for event-images"
on storage.objects for delete
using (bucket_id = 'event-images');
