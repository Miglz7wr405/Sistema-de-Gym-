import { createClient } from '@supabase/supabase-js'

// Ligação ao Supabase do ginásio.
// A chave usada é a "publishable/anon" — é PÚBLICA por design (o Supabase manda
// pô-la no cliente) e o acesso aos dados é protegido por Row Level Security:
// só utilizadores autenticados entram. Por isso pode ficar aqui, e assim a app
// funciona na Vercel SEM configurar nada. Podem ser sobrepostas por variáveis
// de ambiente, se um dia preferires.
const URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://olviijvfqpbeodzsdrmz.supabase.co'
const KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_oahGOVY7IgZvutjpeUjTYg_r8kmtprv'

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
})
