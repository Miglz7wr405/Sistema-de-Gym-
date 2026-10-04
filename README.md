# 🏋️ Sistema de Gestão para Mini Ginásio

Sistema simples e moderno para gerir um mini ginásio: membros, planos, pagamentos e
controlo de entradas por **QR Code**. Funciona no telemóvel e no computador, instala-se
como **app (PWA)** e os dados ficam **online e partilhados** (vários aparelhos veem o mesmo).

## Online e partilhado (Supabase)

- A base de dados está no **Supabase** (PostgreSQL na nuvem) — já criada e configurada.
- A app liga-se por 2 variáveis de ambiente (`VITE_SUPABASE_URL` e
  `VITE_SUPABASE_ANON_KEY`). A chave é a `publishable/anon`, própria para o cliente; o
  acesso aos dados é protegido por *Row Level Security* — só quem tem conta entra.
- Entra em qualquer aparelho com a tua conta e vês tudo igual, em tempo real.

### Conta de administrador
- **Email:** `miguelzinhonordez@gmail.com`
- **Palavra-passe:** `Ginasio2026` (muda quando quiseres)

## 🔐 QR Code seguro (anti-partilha)

1. **O QR não contém o nome** nem dados pessoais — só um **código aleatório**
   (`gymcheck:<uuid>`). Um leitor qualquer não revela nada útil.
2. **Verificação por foto:** ao ler o QR, o ecrã mostra a **FOTO + nome + estado da
   mensalidade**. O porteiro confirma que a pessoa é mesmo o membro.
   🟢 Entrada autorizada / 🔴 expirada / membro suspenso.
3. **Registo automático** de cada leitura no histórico de presenças.

## O que faz

- **Início:** membros ativos, recebido no mês, pagamentos pendentes, presenças de hoje e alertas.
- **Membros:** adicionar (com foto), pesquisar, detalhe, suspender/reativar.
- **Pagamentos:** confirmar (escolher plano → estende validade + recibo), pendentes, histórico.
- **Presenças:** ler QR pela câmara ou procurar pelo nome; ecrã de verificação com foto.
- **Planos:** Mensal/Trimestral/Semestral/Anual (ou criar outros), em MT.

## Correr localmente

```bash
npm install
cp .env.example .env     # preenche com as chaves do teu projeto Supabase
npm run dev
```

## Publicar na Vercel

1. Em [vercel.com](https://vercel.com), **Add New → Project** e importa o repositório do GitHub.
2. A Vercel deteta o Vite (build `npm run build`, saída `dist`).
3. Em **Environment Variables**, adiciona as duas:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy.** Fica com um link fixo que abre em qualquer telemóvel/computador.

## Stack

Vite · React · TypeScript · Tailwind CSS · React Router · React Query ·
Supabase (Postgres + Auth + RLS) · QR: `qrcode` + `@zxing/browser` · PWA: `vite-plugin-pwa`.
