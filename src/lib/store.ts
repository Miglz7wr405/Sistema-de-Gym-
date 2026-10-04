import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getDB, uid } from './db'
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
      const db = await getDB()
      const all = await db.getAll('plans')
      const list = activeOnly ? all.filter((p) => p.active) : all
      return list.sort((a, b) => a.duration_days - b.duration_days)
    },
  })
}

export function useMembers(search = '') {
  return useQuery({
    queryKey: ['members', search],
    queryFn: async (): Promise<Member[]> => {
      const db = await getDB()
      let all = await db.getAll('members')
      const s = search.trim().toLowerCase()
      if (s) {
        all = all.filter(
          (m) =>
            m.full_name.toLowerCase().includes(s) ||
            (m.phone ?? '').toLowerCase().includes(s),
        )
      }
      return all.sort((a, b) => a.full_name.localeCompare(b.full_name))
    },
  })
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: ['member', id],
    enabled: !!id,
    queryFn: async (): Promise<Member | undefined> => {
      const db = await getDB()
      return db.get('members', id!)
    },
  })
}

export function usePayments(memberId?: string) {
  return useQuery({
    queryKey: ['payments', memberId ?? 'all'],
    queryFn: async (): Promise<Payment[]> => {
      const db = await getDB()
      const all = memberId
        ? await db.getAllFromIndex('payments', 'by_member', memberId)
        : await db.getAll('payments')
      return all.sort((a, b) => b.paid_at.localeCompare(a.paid_at))
    },
  })
}

export function useAttendances(memberId?: string, limit = 50) {
  return useQuery({
    queryKey: ['attendances', memberId ?? 'all', limit],
    queryFn: async (): Promise<Attendance[]> => {
      const db = await getDB()
      const all = memberId
        ? await db.getAllFromIndex('attendances', 'by_member', memberId)
        : await db.getAll('attendances')
      return all
        .sort((a, b) => b.checked_in_at.localeCompare(a.checked_in_at))
        .slice(0, limit)
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
      const db = await getDB()
      const [members, payments, attendances] = await Promise.all([
        db.getAll('members'),
        db.getAll('payments'),
        db.getAll('attendances'),
      ])
      const today = todayStr()
      const monthStart = today.slice(0, 7) // yyyy-mm

      const activeMembers = members.filter(
        (m) => m.status === 'active' && membershipStateOf(m.valid_until) !== 'expired',
      ).length
      const pendingCount = members.filter(
        (m) => membershipStateOf(m.valid_until) === 'expired' || !m.valid_until,
      ).length
      const expiringSoon = members.filter(
        (m) => membershipStateOf(m.valid_until) === 'expiring',
      ).length
      const receivedThisMonth = payments
        .filter((p) => p.paid_at.slice(0, 7) === monthStart)
        .reduce((s, p) => s + Number(p.amount_mzn || 0), 0)
      const todayCheckins = attendances.filter(
        (a) => a.result === 'granted' && a.checked_in_at.slice(0, 10) === today,
      ).length

      return {
        activeMembers,
        receivedThisMonth,
        pendingCount,
        todayCheckins,
        expiringSoon,
      }
    },
  })
}

// --------------------------------------------------------------- Mutações

export function useActions() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['members'] })
    qc.invalidateQueries({ queryKey: ['member'] })
    qc.invalidateQueries({ queryKey: ['payments'] })
    qc.invalidateQueries({ queryKey: ['attendances'] })
    qc.invalidateQueries({ queryKey: ['plans'] })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
  }

  return {
    invalidate,

    async addMember(data: {
      full_name: string
      phone?: string
      photo?: string | null
    }): Promise<Member> {
      const db = await getDB()
      const member: Member = {
        id: uid(),
        full_name: data.full_name.trim(),
        phone: data.phone?.trim() || null,
        photo: data.photo ?? null,
        token: uid(),
        status: 'active',
        plan_id: null,
        valid_until: null,
        created_at: new Date().toISOString(),
      }
      await db.put('members', member)
      invalidate()
      return member
    },

    async updateMember(id: string, patch: Partial<Member>): Promise<void> {
      const db = await getDB()
      const existing = await db.get('members', id)
      if (!existing) return
      await db.put('members', { ...existing, ...patch, id })
      invalidate()
    },

    async toggleStatus(id: string): Promise<void> {
      const db = await getDB()
      const m = await db.get('members', id)
      if (!m) return
      await db.put('members', {
        ...m,
        status: m.status === 'active' ? 'suspended' : 'active',
      })
      invalidate()
    },

    async deleteMember(id: string): Promise<void> {
      const db = await getDB()
      await db.delete('members', id)
      invalidate()
    },

    async addPlan(data: {
      name: string
      price_mzn: number
      duration_days: number
    }): Promise<void> {
      const db = await getDB()
      await db.put('plans', {
        id: uid(),
        name: data.name.trim(),
        price_mzn: data.price_mzn,
        duration_days: data.duration_days,
        active: true,
        created_at: new Date().toISOString(),
      })
      invalidate()
    },

    async togglePlan(id: string): Promise<void> {
      const db = await getDB()
      const p = await db.get('plans', id)
      if (!p) return
      await db.put('plans', { ...p, active: !p.active })
      invalidate()
    },

    /** Confirma pagamento: regista e estende a validade da mensalidade. */
    async confirmPayment(
      memberId: string,
      plan: Plan,
      method = 'Dinheiro',
    ): Promise<Payment> {
      const db = await getDB()
      const member = await db.get('members', memberId)
      if (!member) throw new Error('Membro não encontrado')

      const today = todayStr()
      const base =
        member.valid_until && member.valid_until > today ? member.valid_until : today
      const validUntil = addDays(base, plan.duration_days)

      const payment: Payment = {
        id: uid(),
        member_id: memberId,
        plan_id: plan.id,
        plan_name: plan.name,
        amount_mzn: plan.price_mzn,
        method,
        receipt_no: 'REC-' + Date.now().toString().slice(-6),
        paid_at: new Date().toISOString(),
        valid_until: validUntil,
      }
      await db.put('payments', payment)
      await db.put('members', { ...member, plan_id: plan.id, valid_until: validUntil })
      invalidate()
      return payment
    },

    /** Verifica um token de QR (lido pela câmara). Validação local no aparelho. */
    async verifyToken(rawToken: string): Promise<CheckinResponse> {
      const token = rawToken.trim().replace(/^gymcheck:/, '')
      const db = await getDB()
      const member = await db.getFromIndex('members', 'by_token', token)
      if (!member) {
        return { result: 'not_found', state: 'none', message: 'QR não reconhecido.' }
      }
      return this.registerCheckin(member)
    },

    async verifyByMemberId(memberId: string): Promise<CheckinResponse> {
      const db = await getDB()
      const member = await db.get('members', memberId)
      if (!member) {
        return { result: 'not_found', state: 'none', message: 'Membro não encontrado.' }
      }
      return this.registerCheckin(member)
    },

    /** Decide o resultado e regista SEMPRE a tentativa (log de acesso). */
    async registerCheckin(member: Member): Promise<CheckinResponse> {
      const db = await getDB()
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

      const att: Attendance = {
        id: uid(),
        member_id: member.id,
        member_name: member.full_name,
        checked_in_at: new Date().toISOString(),
        result,
      }
      await db.put('attendances', att)
      invalidate()

      return { result, member, state, message }
    },
  }
}
