# 🏋️ Sistema de Gestão para Mini Ginásio

Sistema moderno, simples e rápido para gerir um mini ginásio: membros, planos,
pagamentos, presenças (check-in por QR Code) e áreas separadas para **administrador** e
**membro**. Mobile-first e instalável como app (**PWA**).

> Esta é a **1ª entrega (núcleo)**. Aulas, Eventos, Notificações, Emails, Progresso,
> Instrutores e Resumo Financeiro chegam em fases seguintes.

## Stack

- **Frontend:** Vite + React + TypeScript + Tailwind CSS + React Router + React Query
- **Backend:** Supabase (Postgres, Auth, Storage, Row Level Security, Edge Functions)
- **QR Code:** `qrcode` (gerar) + `@zxing/browser` (ler pela câmara)
- **PWA:** `vite-plugin-pwa`

## 🔐 QR Code seguro (anti-partilha)

O maior risco de um QR de acesso é um membro partilhar o seu código com outra pessoa.
Este sistema trata isso assim:

1. **O QR não contém dados pessoais** — só um **token opaco** (`gymcheck:<uuid>`). Um
   leitor qualquer não revela nome nem nada útil.
2. **A validação é feita no servidor** (Edge Function `checkin`), nunca no telemóvel do
   membro — ninguém consegue forjar "mensalidade ativa".
3. **Verificação visual:** ao ler o QR, o porteiro vê **foto + nome + estado** e confirma
   que a pessoa à frente é mesmo o membro. 🟢 Entrada autorizada / 🔴 Mensalidade expirada.
4. **Log de acessos:** toda a leitura fica registada em `attendances` (quem, quando).

> O esquema já tem o campo `expires_at` em `member_tokens` para, no futuro, ativar QR
> rotativo (que expira) sem refazer a base.

## Começar

### 1. Instalar dependências
```bash
npm install
```

### 2. Criar projeto Supabase
- Cria um projeto grátis em [supabase.com](https://supabase.com).
- Em **Project Settings → API**, copia o `Project URL` e a `anon public key`.

### 3. Variáveis de ambiente
```bash
cp .env.example .env
# edita .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
```

### 4. Base de dados
Aplica as migrações (por ordem) de `supabase/migrations/` no teu projeto:
- Via **Supabase CLI**: `supabase db push`
- Ou cola o conteúdo de cada ficheiro `.sql` no **SQL Editor** do dashboard (0001 → 0002 → 0003).

### 5. Edge Functions
```bash
supabase functions deploy checkin
supabase functions deploy admin-create-member
# A service_role key é lida automaticamente pelo runtime do Supabase.
# (Se preferires defini-la à mão: supabase secrets set SERVICE_ROLE_KEY=...)
```

### 6. Criar o primeiro administrador
Cria um utilizador (Dashboard → **Authentication → Users → Add user**, com palavra-passe),
depois promove-o a admin no **SQL Editor**:
```sql
update public.profiles set role = 'admin', full_name = 'Admin'
where email = 'o-teu-email@exemplo.com';
```

### 7. Correr
```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run preview  # pré-visualizar o build
```

## Fluxos principais

- **Entrada do membro:** admin abre *Presenças* → lê QR → vê foto/nome/estado → presença registada.
- **Pagamento:** admin abre o membro → *Confirmar pagamento* → escolhe plano → validade atualizada + comprovativo (nº de recibo).
- **Novo membro:** admin → *Membros* → *Adicionar* → recebe email + palavra-passe temporária para entregar.

## Papéis e permissões (RLS)

- **Membro:** vê apenas os seus próprios dados (garantido por Row Level Security).
- **Administrador:** acesso total.
- **Instrutor:** base criada; funções alargadas nas fases de Aulas.

## Estrutura

```
src/
  lib/        supabase, auth, tipos, queries, check-in, pagamentos, formatação
  components/ UI, AppShell (navegação), QrImage, QrScanner
  pages/
    auth/     Login
    member/   Início, Mensalidade, QR Code, Presenças, Perfil
    admin/    Dashboard, Membros, Detalhe, Pagamentos, Presenças, Planos, Mais
supabase/
  migrations/ esquema + RLS + seed
  functions/  checkin, admin-create-member
```
