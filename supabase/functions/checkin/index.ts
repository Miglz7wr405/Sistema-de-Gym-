// =============================================================
// Edge Function: checkin
// Resolve um token de QR -> membro, valida a mensalidade no SERVIDOR,
// regista a presença e devolve foto + nome + estado ao porteiro.
//
// O cliente (app do admin) NUNCA decide a validade nem escreve presenças
// diretamente — tudo passa por aqui com a service_role.
//
// Deploy:  supabase functions deploy checkin
// Secrets: supabase secrets set SERVICE_ROLE_KEY=... (PROJECT_URL vem do runtime)
// =============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type MembershipState = 'active' | 'expiring' | 'expired' | 'none'

function membershipState(validUntil: string | null): MembershipState {
  if (!validUntil) return 'none'
  const end = new Date(validUntil + 'T23:59:59')
  const msLeft = end.getTime() - Date.now()
  if (msLeft < 0) return 'expired'
  if (msLeft / 86_400_000 <= 3) return 'expiring'
  return 'active'
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ message: 'Método não permitido' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('PROJECT_URL')
  const serviceKey =
    Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return json({ result: 'not_found', message: 'Servidor mal configurado.' }, 500)
  }

  // Cliente admin (ignora RLS) para resolver o token e escrever a presença.
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  // Identifica QUEM está a validar (o admin/instrutor autenticado).
  let validatedBy: string | null = null
  const authHeader = req.headers.get('Authorization')
  if (authHeader) {
    const { data } = await admin.auth.getUser(authHeader.replace('Bearer ', ''))
    validatedBy = data.user?.id ?? null
  }

  let token: string | null = null
  try {
    const body = await req.json()
    token = typeof body?.token === 'string' ? body.token.trim() : null
    // Aceita tanto "gymcheck:<uuid>" como o uuid simples.
    if (token?.startsWith('gymcheck:')) token = token.slice('gymcheck:'.length)
  } catch {
    token = null
  }
  if (!token) return json({ result: 'not_found', message: 'QR inválido.' }, 400)

  // 1) token -> membro
  const { data: tokenRow } = await admin
    .from('member_tokens')
    .select('member_id, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (!tokenRow) {
    return json({ result: 'not_found', message: 'QR não reconhecido.' })
  }

  // (preparado para QR rotativo: token expirado é recusado)
  if (tokenRow.expires_at && new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return json({ result: 'not_found', message: 'QR expirado. Gera um novo no app.' })
  }

  // 2) carrega perfil + mensalidade
  const { data: profile } = await admin
    .from('profiles')
    .select('id, full_name, photo_url, status')
    .eq('id', tokenRow.member_id)
    .maybeSingle()

  if (!profile) return json({ result: 'not_found', message: 'Membro não encontrado.' })

  const { data: membership } = await admin
    .from('memberships')
    .select('valid_until')
    .eq('member_id', profile.id)
    .maybeSingle()

  const validUntil = membership?.valid_until ?? null
  const state = membershipState(validUntil)
  const granted = state === 'active' || state === 'expiring'
  const result: 'granted' | 'expired' = granted ? 'granted' : 'expired'

  // 3) regista SEMPRE a tentativa (log de acesso)
  await admin.from('attendances').insert({
    member_id: profile.id,
    validated_by: validatedBy,
    result,
  })

  // 4) devolve ao porteiro o que precisa para confirmar visualmente
  return json({
    result,
    member: {
      id: profile.id,
      full_name: profile.full_name,
      photo_url: profile.photo_url,
      valid_until: validUntil,
      membership_state: state,
    },
    message: granted ? 'Entrada autorizada' : 'Mensalidade expirada',
  })
})
