# 🏋️ Sistema de Gestão para Mini Ginásio

App web responsiva e instalável (PWA) com **visual escuro premium** e **dois painéis**:
**Administrador** (gere tudo) e **Membro** (vê o seu). Dados online e partilhados no
**Supabase**. Interface em português, valores em Metical (MT).

## Dois perfis

- **Membro:** regista-se sozinho na app (nome, email, palavra-passe, **data de nascimento,
  telefone, foto, género**). A conta fica **pendente** até o ginásio ativar. Depois tem o
  seu painel: **cartão de membro** com estado e dias até expirar, mensalidade + histórico,
  **QR Code** (ativo só quando a conta está ativa), entradas e perfil editável.
- **Administrador:** dashboard com indicadores e alertas; **Membros** (lista, pesquisa,
  separador de **pendentes**, ver dados/idade, **confirmar pagamento → ativa** a conta e
  estende a validade, suspender/reativar, ver/descarregar QR); **Pagamentos** (a tratar +
  histórico); **Entradas** (scanner de QR + pesquisa por nome); **Planos**.

## 🔐 QR Code seguro (anti-partilha)

1. O QR só contém um **código aleatório** (`gymcheck:<uuid>`) — sem nome nem dados pessoais.
2. A validação é feita no servidor (Supabase) e **só o admin** a executa.
3. Ao ler, o admin vê **foto grande + nome + estado** para confirmar que é mesmo o membro.
   🟢 Autorizado · 🔴 Expirado · Suspenso · Pendente. Cada leitura fica registada.

## Login do administrador

- **Email:** `miguelzinhonordez@gmail.com`
- **Palavra-passe:** `Ginasio2026`

## Tecnologia

Vite · React · TypeScript · Tailwind (tema escuro) · lucide-react · React Query ·
Supabase (Postgres + Auth + RLS) · QR `qrcode` + `@zxing/browser` · PWA `vite-plugin-pwa`.

## Base de dados (Supabase)

- `profiles` (membros e admins; papel, estado, token do QR, plano, validade, dados pessoais)
- `plans`, `member_payments`, `member_attendances`
- **RLS:** cada membro só acede aos seus dados; o admin acede a tudo. Perfil criado
  automaticamente no registo (trigger). A conta do admin já está definida.

## Correr / publicar

```bash
npm install
npm run dev          # desenvolvimento
npm run build        # versão final (dist/)
```

**Vercel:** importa o repositório e faz **Deploy** — as chaves (públicas, protegidas por
RLS) já estão embutidas; não é preciso configurar nada. Opcional: definir
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` nas Environment Variables para as sobrepor.

> Nota: o auto-registo depende da confirmação de email do Supabase. Se o projeto tiver a
> confirmação ativada, o membro confirma pelo email antes de entrar; podes desativar essa
> opção no painel do Supabase (Authentication → Providers → Email) para entrar logo.
