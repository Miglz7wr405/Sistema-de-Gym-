import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import {
  membershipStateOf,
  type Attendance,
  type CheckinResponse,
  type ClassEnrollment,
  type GymClass,
  type Payment,
  type Plan,
  type Profile,
} from './types'

const todayStr = () => new Date().toISOString().slice(0, 10)
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// ---------------------------------------------------------------- Leituras
export function usePlans(activeOnly = false) {
  return useQuery({
    queryKey: ['plans', activeOnly],
    queryFn: async (): Promise<Plan[]> => {
      let q = supabase.from('plans').select('*').order('duration_days')
      if (activeOnly) q = q.eq('active', true)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Plan[]
    },
  })
}

export function useMembers(search = '') {
  return useQuery({
    queryKey: ['members', search],
    queryFn: async (): Promise<Profile[]> => {
      let q = supabase.from('profiles').select('*').eq('role', 'member').order('full_name')
      if (search.trim()) {
        const s = `%${search.trim()}%`
        q = q.or(`full_name.ilike.${s},phone.ilike.${s}`)
      }
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Profile[]
    },
  })
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: ['member', id],
    enabled: !!id,
    queryFn: async (): Promise<Profile | undefined> => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id!).maybeSingle()
      if (error) throw error
      return (data ?? undefined) as Profile | undefined
    },
  })
}

export function usePlan(planId: string | null | undefined) {
  return useQuery({
    queryKey: ['plan', planId],
    enabled: !!planId,
    queryFn: async (): Promise<Plan | null> => {
      const { data } = await supabase.from('plans').select('*').eq('id', planId!).maybeSingle()
      return (data ?? null) as Plan | null
    },
  })
}

export function usePayments(memberId?: string) {
  return useQuery({
    queryKey: ['payments', memberId ?? 'all'],
    queryFn: async (): Promise<Payment[]> => {
      let q = supabase.from('member_payments').select('*').order('paid_at', { ascending: false })
      if (memberId) q = q.eq('member_id', memberId)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Payment[]
    },
  })
}

export function useAttendances(memberId?: string, limit = 50) {
  return useQuery({
    queryKey: ['attendances', memberId ?? 'all', limit],
    queryFn: async (): Promise<Attendance[]> => {
      let q = supabase
        .from('member_attendances')
        .select('*')
        .order('checked_in_at', { ascending: false })
        .limit(limit)
      if (memberId) q = q.eq('member_id', memberId)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Attendance[]
    },
  })
}

export interface DashboardData {
  activeMembers: number
  pendingCount: number
  receivedThisMonth: number
  todayCheckins: number
  expiringSoon: number
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const today = todayStr()
      const monthStart = today.slice(0, 7) + '-01'
      const [membersRes, payRes, attRes] = await Promise.all([
        supabase.from('profiles').select('status, valid_until').eq('role', 'member'),
        supabase.from('member_payments').select('amount_mzn').gte('paid_at', monthStart),
        supabase
          .from('member_attendances')
          .select('id', { count: 'exact', head: true })
          .eq('result', 'granted')
          .gte('checked_in_at', today),
      ])
      if (membersRes.error) throw membersRes.error
      const members = membersRes.data ?? []
      const activeMembers = members.filter(
        (m) => m.status === 'active' && membershipStateOf(m.valid_until) !== 'expired',
      ).length
      const pendingCount = members.filter(
        (m) => m.status === 'pending' || !m.valid_until || membershipStateOf(m.valid_until) === 'expired',
      ).length
      const expiringSoon = members.filter(
        (m) => m.status === 'active' && membershipStateOf(m.valid_until) === 'expiring',
      ).length
      const receivedThisMonth = (payRes.data ?? []).reduce((s, p) => s + Number(p.amount_mzn || 0), 0)
      return {
        activeMembers,
        pendingCount,
        receivedThisMonth,
        todayCheckins: attRes.count ?? 0,
        expiringSoon,
      }
    },
  })
}

// --------------------------------------------------------------- Aulas
export function useClasses(upcomingOnly = true) {
  return useQuery({
    queryKey: ['classes', upcomingOnly],
    queryFn: async (): Promise<GymClass[]> => {
      let q = supabase.from('classes').select('*').order('starts_at')
      if (upcomingOnly) {
        q = q.eq('active', true).gte('starts_at', new Date(Date.now() - 2 * 3600_000).toISOString())
      }
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as GymClass[]
    },
  })
}

export function useMyEnrollments(memberId: string | undefined) {
  return useQuery({
    queryKey: ['enrollments', memberId],
    enabled: !!memberId,
    queryFn: async (): Promise<ClassEnrollment[]> => {
      const { data, error } = await supabase
        .from('class_enrollments')
        .select('*')
        .eq('member_id', memberId!)
      if (error) throw error
      return (data ?? []) as ClassEnrollment[]
    },
  })
}

// --------------------------------------------------------------- Check-in
async function registerCheckin(member: Profile): Promise<CheckinResponse> {
  const state = membershipStateOf(member.valid_until)
  let result: CheckinResponse['result']
  let message: string
  if (member.status === 'suspended') {
    result = 'suspended'
    message = 'Membro suspenso'
  } else if (member.status === 'pending') {
    result = 'pending'
    message = 'Conta ainda não ativada'
  } else if (state === 'active' || state === 'expiring') {
    result = 'granted'
    message = 'Entrada autorizada'
  } else {
    result = 'expired'
    message = 'Mensalidade expirada'
  }
  await supabase.from('member_attendances').insert({
    member_id: member.id,
    member_name: member.full_name,
    result,
  })
  return { result, member, state, message }
}

// --------------------------------------------------------------- Mutações
export function useActions() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries()

  return {
    invalidate,

    async updateMember(id: string, patch: Partial<Profile>): Promise<void> {
      const { error } = await supabase.from('profiles').update(patch).eq('id', id)
      if (error) throw error
      invalidate()
    },

    async setStatus(id: string, status: Profile['status']): Promise<void> {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', id)
      if (error) throw error
      invalidate()
    },

    async addPlan(data: { name: string; price_mzn: number; duration_days: number }): Promise<void> {
      await supabase.from('plans').insert({ ...data, active: true })
      invalidate()
    },

    async togglePlan(id: string, active: boolean): Promise<void> {
      await supabase.from('plans').update({ active: !active }).eq('id', id)
      invalidate()
    },

    /** Confirma pagamento: regista, estende validade e ATIVA a conta. */
    async confirmPayment(memberId: string, plan: Plan, method = 'Dinheiro'): Promise<Payment> {
      const { data: member, error: mErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', memberId)
        .single()
      if (mErr) throw mErr
      const today = todayStr()
      const base = member.valid_until && member.valid_until > today ? member.valid_until : today
      const validUntil = addDays(base, plan.duration_days)

      const { data: payment, error: pErr } = await supabase
        .from('member_payments')
        .insert({
          member_id: memberId,
          plan_id: plan.id,
          plan_name: plan.name,
          amount_mzn: plan.price_mzn,
          method,
          valid_until: validUntil,
        })
        .select('*')
        .single()
      if (pErr) throw pErr

      await supabase
        .from('profiles')
        .update({ plan_id: plan.id, valid_until: validUntil, status: 'active' })
        .eq('id', memberId)
      invalidate()
      return payment as Payment
    },

    async updateOwnProfile(id: string, patch: Partial<Profile>): Promise<void> {
      const { error } = await supabase.from('profiles').update(patch).eq('id', id)
      if (error) throw error
      invalidate()
    },

    async createClass(data: {
      title: string
      instructor: string
      starts_at: string
      capacity: number
    }): Promise<void> {
      const { error } = await supabase.from('classes').insert(data)
      if (error) throw error
      invalidate()
    },

    async cancelClass(id: string): Promise<void> {
      await supabase.from('classes').update({ active: false }).eq('id', id)
      invalidate()
    },

    /** Inscreve o membro; se a aula estiver cheia, entra em lista de espera. */
    async joinClass(cls: GymClass, memberId: string): Promise<'enrolled' | 'waitlist'> {
      const status = cls.enrolled_count >= cls.capacity ? 'waitlist' : 'enrolled'
      const { error } = await supabase
        .from('class_enrollments')
        .insert({ class_id: cls.id, member_id: memberId, status })
      if (error) throw error
      invalidate()
      return status
    },

    async leaveClass(classId: string, memberId: string): Promise<void> {
      await supabase
        .from('class_enrollments')
        .delete()
        .eq('class_id', classId)
        .eq('member_id', memberId)
      invalidate()
    },

    async verifyToken(rawToken: string): Promise<CheckinResponse> {
      const token = rawToken.trim().replace(/^gymcheck:/, '')
      const { data: member } = await supabase
        .from('profiles')
        .select('*')
        .eq('token', token)
        .maybeSingle()
      if (!member) return { result: 'not_found', state: 'none', message: 'QR não reconhecido.' }
      const res = await registerCheckin(member as Profile)
      invalidate()
      return res
    },

    async verifyByMemberId(memberId: string): Promise<CheckinResponse> {
      const { data: member } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', memberId)
        .maybeSingle()
      if (!member) return { result: 'not_found', state: 'none', message: 'Membro não encontrado.' }
      const res = await registerCheckin(member as Profile)
      invalidate()
      return res
    },
  }
}
