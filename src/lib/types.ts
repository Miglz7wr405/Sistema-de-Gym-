export type MembershipState = 'active' | 'expiring' | 'expired' | 'none'
export type MemberStatus = 'active' | 'suspended'
export type CheckinResult = 'granted' | 'expired' | 'not_found' | 'suspended'

export interface Plan {
  id: string
  name: string
  price_mzn: number
  duration_days: number
  active: boolean
  created_at: string
}

export interface Member {
  id: string
  full_name: string
  phone: string | null
  photo: string | null // data URL (guardado localmente)
  token: string // conteúdo do QR (opaco) — nunca contém o nome
  status: MemberStatus
  plan_id: string | null
  valid_until: string | null // ISO date (yyyy-mm-dd)
  created_at: string
}

export interface Payment {
  id: string
  member_id: string
  plan_id: string | null
  plan_name: string
  amount_mzn: number
  method: string
  receipt_no: string
  paid_at: string // ISO datetime
  valid_until: string | null
}

export interface Attendance {
  id: string
  member_id: string
  member_name: string // snapshot (para histórico mesmo se o membro mudar)
  checked_in_at: string // ISO datetime
  result: CheckinResult
}

export interface Settings {
  id: 'app'
  gym_name: string
}

/** Resposta da verificação de entrada (o que o porteiro vê ao ler o QR). */
export interface CheckinResponse {
  result: CheckinResult
  member?: Member
  state: MembershipState
  message: string
}

/** Estado da mensalidade derivado de valid_until. */
export function membershipStateOf(validUntil: string | null): MembershipState {
  if (!validUntil) return 'none'
  const end = new Date(validUntil + 'T23:59:59')
  const msLeft = end.getTime() - Date.now()
  if (msLeft < 0) return 'expired'
  if (msLeft / 86_400_000 <= 3) return 'expiring'
  return 'active'
}
