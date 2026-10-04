export type Role = 'admin' | 'instructor' | 'member'
export type ProfileStatus = 'active' | 'suspended' | 'inactive'
export type MembershipState = 'active' | 'expiring' | 'expired' | 'none'
export type CheckinResult = 'granted' | 'expired' | 'not_found'

export interface Profile {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  photo_url: string | null
  role: Role
  status: ProfileStatus
  created_at: string
}

export interface Plan {
  id: string
  name: string
  price_mzn: number
  duration_days: number
  active: boolean
  created_at: string
}

export interface Membership {
  id: string
  member_id: string
  plan_id: string | null
  valid_until: string | null // ISO date
  created_at: string
}

export interface Payment {
  id: string
  member_id: string
  plan_id: string | null
  amount_mzn: number
  method: string | null
  receipt_no: string
  paid_at: string
  valid_until: string | null
  created_by: string | null
}

export interface Attendance {
  id: string
  member_id: string
  checked_in_at: string
  validated_by: string | null
  result: CheckinResult
}

/** Resposta da Edge Function de check-in — o que o porteiro vê ao ler o QR. */
export interface CheckinResponse {
  result: CheckinResult
  member?: {
    id: string
    full_name: string
    photo_url: string | null
    valid_until: string | null
    membership_state: MembershipState
  }
  message: string
}

/** Vista derivada do estado da mensalidade a partir de valid_until. */
export function membershipStateOf(validUntil: string | null): MembershipState {
  if (!validUntil) return 'none'
  const now = new Date()
  const end = new Date(validUntil + 'T23:59:59')
  const msLeft = end.getTime() - now.getTime()
  if (msLeft < 0) return 'expired'
  const daysLeft = msLeft / (1000 * 60 * 60 * 24)
  if (daysLeft <= 3) return 'expiring'
  return 'active'
}
