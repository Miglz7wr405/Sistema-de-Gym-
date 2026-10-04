# 🏋️ Sistema de Gestão para Mini Ginásio

Sistema simples, rápido e moderno para gerir um mini ginásio: membros, planos,
pagamentos e controlo de entradas por **QR Code**. Funciona no telemóvel e no computador,
instala-se como **app (PWA)** e **não precisa de nenhuma configuração**.

> **Tudo automático, sem contas e sem internet obrigatória.** Os dados ficam guardados
> dentro da própria app, no teu aparelho (base de dados local no navegador — IndexedDB).
> Não é preciso Supabase, nem servidor, nem criar nada. Abres e funciona.

## Como usar

```bash
npm install
npm run dev       # abrir em desenvolvimento
npm run build     # gerar a versão final (pasta dist/)
npm run preview   # pré-visualizar a versão final
```

Para usar no dia a dia: faz `npm run build` e publica a pasta `dist/` em qualquer
alojamento de ficheiros estáticos (ou abre o `preview`). No telemóvel, usa a opção
**"Adicionar ao ecrã inicial"** do navegador para instalar como app.

## 🔐 QR Code seguro (anti-partilha)

O risco de um QR de acesso é um membro emprestar o código a outra pessoa. Está resolvido:

1. **O QR não contém o nome** nem dados pessoais — apenas um **código aleatório**
   (`gymcheck:<uuid>`). Um leitor qualquer não revela nada útil.
2. **Verificação por foto:** ao ler o QR, o ecrã mostra a **FOTO do membro + nome +
   estado da mensalidade**. O porteiro confirma que a pessoa à frente é mesmo o membro.
   🟢 Entrada autorizada / 🔴 Mensalidade expirada / membro suspenso.
3. **Registo automático:** cada leitura fica no histórico de presenças.

## O que o sistema faz

- **Início:** membros ativos, recebido no mês, pagamentos pendentes, presenças de hoje e
  alertas úteis (ex.: "⚠️ 3 mensalidades terminam nos próximos 3 dias").
- **Membros:** adicionar (com foto), pesquisar, ver detalhe, suspender/reativar.
- **Pagamentos:** confirmar pagamento (escolher plano → estende a validade e gera recibo),
  ver pendentes e histórico.
- **Presenças:** ler QR pela câmara **ou** procurar pelo nome; ecrã de verificação com foto.
- **Planos:** Mensal/Trimestral/Semestral/Anual (ou criar outros) — nome, preço (MT), duração.
- **Cópia de segurança:** em *Mais*, exportar/importar todos os dados num ficheiro (para
  guardar ou mudar de aparelho).

## Importante sobre os dados

- Os dados ficam **neste aparelho/navegador**. Faz **cópias de segurança** regulares em
  *Mais → Exportar* e guarda o ficheiro.
- Para passar os dados para outro aparelho: *Exportar* num, *Importar* no outro.
- A área onde cada membro entra no **seu próprio telemóvel** para ver os dados "na nuvem"
  exige um servidor com conta — pode ser adicionada numa fase futura, se quiseres.

## Stack

Vite · React · TypeScript · Tailwind CSS · React Router · React Query ·
IndexedDB (via `idb`) · QR: `qrcode` + `@zxing/browser` · PWA: `vite-plugin-pwa`.

## Estrutura

```
src/
  lib/        db (IndexedDB), store (operações + hooks), tipos, imagem, backup, formatação
  components/ UI, AppShell (navegação), Modal, QrImage, QrScanner
  pages/admin Dashboard, Membros, Detalhe, Pagamentos, Presenças, Planos, Mais
```
