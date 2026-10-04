import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import {
  membershipStateOf,
  type Attendance,
  type CheckinResponse,
  type Member,
  type Payment,
  type Plan,
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
    queryFn: async (): Promise<Member[]> => {
      let q = supabase.from('members').select('*').order('full_name')
      if (search.trim()) {
        const s = `%${search.trim()}%`
        q = q.or(`full_name.ilike.${s},phone.ilike.${s}`)
      }
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Member[]
    },
  })
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: ['member', id],
    enabled: !!id,
    queryFn: async (): Promise<Member | undefined> => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id!)
        .maybeSingle()
      if (error) throw error
      return (data ?? undefined) as Member | undefined
    },
  })
}

export function usePayments(memberId?: string) {
  return useQuery({
    queryKey: ['payments', memberId ?? 'all'],
    queryFn: async (): Promise<Payment[]> => {
      let q = supabase.from('payments').select('*').order('paid_at', { ascending: false })
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
        .from('attendances')
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
  receivedThisMonth: number
  pendingCount: number
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
        supabase.from('members').select('status, valid_until'),
        supabase.from('payments').select('amount_mzn').gte('paid_at', monthStart),
        supabase
          .from('attendances')
          .select('id', { count: 'exact', head: true })
          .eq('result', 'granted')
          .gte('checked_in_at', today),
      ])
      if (membersRes.error) throw membersRes.error

      const members = membersRes.data ?? []
      const activeMembers = members.filter(
        (m) => m.status === 'active' && membershipStateOf(m.valid_until) !== 'expired',
      ).length
      const pendingCount = members.filter((m) => {
        const st = membershipStateOf(m.valid_until)
        return st === 'expired' || st === 'none'
      }).length
      const expiringSoon = members.filter(
        (m) => membershipStateOf(m.valid_until) === 'expiring',
      ).length
      const receivedThisMonth = (payRes.data ?? []).reduce(
        (s, p) => s + Number(p.amount_mzn || 0),
        0,
      )

      return {
        activeMembers,
        receivedThisMonth,
        pendingCount,
        todayCheckins: attRes.count ?? 0,
        expiringSoon,
      }
    },
  })
}

// --------------------------------------------------------------- Mutações

async function registerCheckin(member: Member): Promise<CheckinResponse> {
  const state = membershipStateOf(member.valid_until)
  let result: CheckinResponse['result']
  let message: string
  if (member.status === 'suspended') {
    result = 'suspended'
    message = 'Membro suspenso'
  } else if (state === 'active' || state === 'expiring') {
    result = 'granted'
    message = 'Entrada autorizada'
  } else {
    result = 'expired'
    message = 'Mensalidade expirada'
  }

  await supabase.from('attendances').insert({
    member_id: member.id,
    member_name: member.full_name,
    result,
  })

  return { result, member, state, message }
}

export function useActions() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries()

  return {
    invalidate,

    async addMember(data: {
      full_name: string
      phone?: string
      photo?: string | null
    }): Promise<Member> {
      const { data: row, error } = await supabase
        .from('members')
        .insert({
          full_name: data.full_name.trim(),
          phone: data.phone?.trim() || null,
          photo: data.photo ?? null,
        })
        .select('*')
        .single()
      if (error) throw error
      invalidate()
      return row as Member
    },

    async updateMember(id: string, patch: Partial<Member>): Promise<void> {
      const { error } = await supabase.from('members').update(patch).eq('id', id)
      if (error) throw error
      invalidate()
    },

    async toggleStatus(id: string): Promise<void> {
      const { data: m } = await supabase
        .from('members')
        .select('status')
        .eq('id', id)
        .maybeSingle()
      if (!m) return
      await supabase
        .from('members')
        .update({ status: m.status === 'active' ? 'suspended' : 'active' })
        .eq('id', id)
      invalidate()
    },

    async deleteMember(id: string): Promise<void> {
      await supabase.from('members').delete().eq('id', id)
      invalidate()
    },

    async addPlan(data: {
      name: string
      price_mzn: number
      duration_days: number
    }): Promise<void> {
      await supabase.from('plans').insert({
        name: data.name.trim(),
        price_mzn: data.price_mzn,
        duration_days: data.duration_days,
        active: true,
      })
      invalidate()
    },

    async togglePlan(id: string): Promise<void> {
      const { data: p } = await supabase
        .from('plans')
        .select('active')
        .eq('id', id)
        .maybeSingle()
      if (!p) return
      await supabase.from('plans').update({ active: !p.active }).eq('id', id)
      invalidate()
    },

    async confirmPayment(
      memberId: string,
      plan: Plan,
      method = 'Dinheiro',
    ): Promise<Payment> {
      const { data: member, error: mErr } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single()
      if (mErr) throw mErr

      const today = todayStr()
      const base =
        member.valid_until && member.valid_until > today ? member.valid_until : today
      const validUntil = addDays(base, plan.duration_days)

      const { data: payment, error: pErr } = await supabase
        .from('payments')
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
        .from('members')
        .update({ plan_id: plan.id, valid_until: validUntil })
        .eq('id', memberId)

      invalidate()
      return payment as Payment
    },

    async verifyToken(rawToken: string): Promise<CheckinResponse> {
      const token = rawToken.trim().replace(/^gymcheck:/, '')
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('token', token)
        .maybeSingle()
      if (!member) {
        qc.invalidateQueries({ queryKey: ['attendances'] })
        return { result: 'not_found', state: 'none', message: 'QR não reconhecido.' }
      }
      const res = await registerCheckin(member as Member)
      invalidate()
      return res
    },

    async verifyByMemberId(memberId: string): Promise<CheckinResponse> {
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .maybeSingle()
      if (!member) {
        return { result: 'not_found', state: 'none', message: 'Membro não encontrado.' }
      }
      const res = await registerCheckin(member as Member)
      invalidate()
      return res
    },
  }
}
