export type Role = 'admin' | 'member'
export type AccountStatus = 'pending' | 'active' | 'suspended'
export type MembershipState = 'active' | 'expiring' | 'expired' | 'none'
export type CheckinResult = 'granted' | 'expired' | 'suspended' | 'pending' | 'not_found'

export interface Profile {
  id: string
  role: Role
  full_name: string
  email: string | null
  phone: string | null
  birth_date: string | null
  gender: string | null
  photo: string | null
  token: string
  status: AccountStatus
  plan_id: string | null
  valid_until: string | null
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

export interface Payment {
  id: string
  member_id: string
  plan_id: string | null
  plan_name: string
  amount_mzn: number
  method: string
  receipt_no: string
  paid_at: string
  valid_until: string | null
}

export interface Attendance {
  id: string
  member_id: string | null
  member_name: string
  checked_in_at: string
  result: CheckinResult
}

export interface GymClass {
  id: string
  title: string
  instructor: string
  starts_at: string
  capacity: number
  enrolled_count: number
  active: boolean
  created_at: string
}

export interface ClassEnrollment {
  id: string
  class_id: string
  member_id: string
  status: 'enrolled' | 'waitlist'
  created_at: string
}

export interface CheckinResponse {
  result: CheckinResult
  member?: Profile
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

/** Dias que faltam até expirar (negativo se já expirou). */
export function daysLeft(validUntil: string | null): number | null {
  if (!validUntil) return null
  const end = new Date(validUntil + 'T23:59:59')
  return Math.ceil((end.getTime() - Date.now()) / 86_400_000)
}

export function ageFrom(birth: string | null): number | null {
  if (!birth) return null
  const b = new Date(birth)
  if (isNaN(b.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}
