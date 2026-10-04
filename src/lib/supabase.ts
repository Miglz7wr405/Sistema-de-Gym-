import { createClient } from '@supabase/supabase-js'

// As chaves vêm de variáveis de ambiente (nunca ficam no código).
// Local: ficheiro ".env" (ver .env.example). Vercel: Environment Variables.
// A chave usada é a "publishable/anon" (própria para o cliente); o acesso aos
// dados é protegido por Row Level Security — só utilizadores autenticados entram.
const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(URL && KEY)

if (!supabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn('[Supabase] Falta VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (ver .env.example).')
}

export const supabase = createClient(
  URL ?? 'http://localhost:54321',
  KEY ?? 'anon-key-em-falta',
  { auth: { persistSession: true, autoRefreshToken: true } },
)
