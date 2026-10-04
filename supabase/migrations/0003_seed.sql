-- =============================================================
-- Dados iniciais (planos). Executado após as migrações.
-- Os membros/admins são criados via Auth + app.
-- =============================================================
insert into public.plans (name, price_mzn, duration_days, active)
values
  ('Mensal',      1500, 30,  true),
  ('Trimestral',  4000, 90,  true),
  ('Semestral',   7500, 180, true),
  ('Anual',      14000, 365, true)
on conflict do nothing;
