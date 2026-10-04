-- =============================================================
-- Row Level Security — permissões por papel
--   member     : apenas os seus próprios dados
--   instructor : leitura (alargado em fases futuras)
--   admin      : acesso total
-- Escrita de presenças/pagamentos e resolução de token do QR são
-- feitas por Edge Functions com a service_role (ignora RLS).
-- =============================================================

alter table public.profiles       enable row level security;
alter table public.plans          enable row level security;
alter table public.memberships    enable row level security;
alter table public.payments       enable row level security;
alter table public.attendances    enable row level security;
alter table public.member_tokens  enable row level security;

-- ---------- profiles ----------
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
  for insert with check (public.is_admin());

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles
  for delete using (public.is_admin());

-- ---------- plans (todos leem planos ativos; só admin gere) ----------
drop policy if exists plans_select on public.plans;
create policy plans_select on public.plans
  for select using (active or public.is_admin());

drop policy if exists plans_admin_write on public.plans;
create policy plans_admin_write on public.plans
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- memberships ----------
drop policy if exists memberships_select on public.memberships;
create policy memberships_select on public.memberships
  for select using (member_id = auth.uid() or public.is_admin());

drop policy if exists memberships_admin_write on public.memberships;
create policy memberships_admin_write on public.memberships
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- payments ----------
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
  for select using (member_id = auth.uid() or public.is_admin());

drop policy if exists payments_admin_write on public.payments;
create policy payments_admin_write on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- attendances ----------
drop policy if exists attendances_select on public.attendances;
create policy attendances_select on public.attendances
  for select using (member_id = auth.uid() or public.is_admin());

drop policy if exists attendances_admin_write on public.attendances;
create policy attendances_admin_write on public.attendances
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- member_tokens ----------
-- O membro pode LER o seu token (para gerar o QR), mas nunca o de outro.
-- A resolução token -> membro (no check-in) usa a service_role, nunca o cliente.
drop policy if exists member_tokens_self_select on public.member_tokens;
create policy member_tokens_self_select on public.member_tokens
  for select using (member_id = auth.uid() or public.is_admin());

drop policy if exists member_tokens_admin_write on public.member_tokens;
create policy member_tokens_admin_write on public.member_tokens
  for all using (public.is_admin()) with check (public.is_admin());
