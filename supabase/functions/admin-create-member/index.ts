// =============================================================
// Edge Function: admin-create-member
// Cria uma conta de membro (Auth user + profile). Só admins podem chamar.
// Usa service_role para criar o utilizador com palavra-passe temporária.
//
// Deploy: supabase functions deploy admin-create-member
// =============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function tempPassword(): string {
  // Palavra-passe temporária legível (o membro muda depois).
  return 'Gym-' + Math.random().toString(36).slice(2, 8) + Math.floor(Math.random() * 90 + 10)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ message: 'Método não permitido' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('PROJECT_URL')
  const serviceKey =
    Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) return json({ message: 'Servidor mal configurado.' }, 500)

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // --- Autorização: o chamador tem de ser admin ---
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!authHeader) return json({ message: 'Não autenticado.' }, 401)
  const { data: caller } = await admin.auth.getUser(authHeader)
  if (!caller.user) return json({ message: 'Sessão inválida.' }, 401)
  const { data: callerProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', caller.user.id)
    .maybeSingle()
  if (callerProfile?.role !== 'admin') return json({ message: 'Sem permissão.' }, 403)

  // --- Dados do novo membro ---
  let body: { full_name?: string; email?: string; phone?: string }
  try {
    body = await req.json()
  } catch {
    return json({ message: 'Pedido inválido.' }, 400)
  }
  const fullName = (body.full_name ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  if (!fullName || !email) return json({ message: 'Nome e email são obrigatórios.' }, 400)

  const password = tempPassword()
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (createErr || !created.user) {
    return json({ message: createErr?.message ?? 'Não foi possível criar a conta.' }, 400)
  }

  // O trigger já criou o profile + token; atualizamos os restantes campos.
  await admin
    .from('profiles')
    .update({ full_name: fullName, phone: body.phone ?? null, role: 'member' })
    .eq('id', created.user.id)

  return json({
    member_id: created.user.id,
    email,
    temp_password: password,
    message: 'Membro criado.',
  })
})
