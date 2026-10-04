import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { Attendance, Membership, Payment, Plan, Profile } from './types'

/** Perfil + mensalidade do próprio membro autenticado. */
export function useMyMembership(memberId: string | undefined) {
  return useQuery({
    queryKey: ['my-membership', memberId],
    enabled: !!memberId,
    queryFn: async (): Promise<Membership | null> => {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('member_id', memberId!)
        .maybeSingle()
      if (error) throw error
      return data as Membership | null
    },
  })
}

export function usePlanById(planId: string | null | undefined) {
  return useQuery({
    queryKey: ['plan', planId],
    enabled: !!planId,
    queryFn: async (): Promise<Plan | null> => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId!)
        .maybeSingle()
      if (error) throw error
      return data as Plan | null
    },
  })
}

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

export function usePayments(memberId: string | undefined) {
  return useQuery({
    queryKey: ['payments', memberId],
    enabled: !!memberId,
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', memberId!)
        .order('paid_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Payment[]
    },
  })
}

export function useAttendances(memberId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: ['attendances', memberId, limit],
    enabled: !!memberId,
    queryFn: async (): Promise<Attendance[]> => {
      const { data, error } = await supabase
        .from('attendances')
        .select('*')
        .eq('member_id', memberId!)
        .order('checked_in_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data ?? []) as Attendance[]
    },
  })
}

/** Lista de membros (admin). Opcionalmente filtra por texto no nome/email. */
export function useMembers(search = '') {
  return useQuery({
    queryKey: ['members', search],
    queryFn: async (): Promise<Profile[]> => {
      let q = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'member')
        .order('full_name')
      if (search.trim()) {
        const s = `%${search.trim()}%`
        q = q.or(`full_name.ilike.${s},email.ilike.${s}`)
      }
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Profile[]
    },
  })
}

export function useMyToken(memberId: string | undefined) {
  return useQuery({
    queryKey: ['my-token', memberId],
    enabled: !!memberId,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase
        .from('member_tokens')
        .select('token')
        .eq('member_id', memberId!)
        .maybeSingle()
      if (error) throw error
      return (data?.token as string) ?? null
    },
  })
}
