import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/AppShell'
import { Card, Spinner, Stat } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { mzn } from '@/lib/format'
import { useAuth } from '@/lib/auth'

interface DashboardData {
  activeMembers: number
  receivedThisMonth: number
  pendingCount: number
  todayCheckins: number
  expiringSoon: number
}

function startOfMonthISO() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}
function startOfTodayISO() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
}
function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
function inDaysStr(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function useDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const today = todayStr()

      const [members, payments, memberships, checkins, expiring] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'member').eq('status', 'active'),
        supabase.from('payments').select('amount_mzn').gte('paid_at', startOfMonthISO()),
        supabase.from('memberships').select('valid_until'),
        supabase.from('attendances').select('id', { count: 'exact', head: true }).eq('result', 'granted').gte('checked_in_at', startOfTodayISO()),
        supabase.from('memberships').select('member_id', { count: 'exact', head: true }).gte('valid_until', today).lte('valid_until', inDaysStr(3)),
      ])

      const received = (payments.data ?? []).reduce(
        (sum, p) => sum + Number(p.amount_mzn ?? 0),
        0,
      )
      const pending = (memberships.data ?? []).filter(
        (m) => !m.valid_until || m.valid_until < today,
      ).length

      return {
        activeMembers: members.count ?? 0,
        receivedThisMonth: received,
        pendingCount: pending,
        todayCheckins: checkins.count ?? 0,
        expiringSoon: expiring.count ?? 0,
      }
    },
  })
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const { data, isLoading } = useDashboard()

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <Spinner />
      </>
    )
  }

  const alerts: string[] = []
  if (data.expiringSoon > 0)
    alerts.push(`⚠️ ${data.expiringSoon} mensalidade(s) terminam nos próximos 3 dias.`)
  if (data.pendingCount > 0)
    alerts.push(`💳 ${data.pendingCount} pagamento(s) pendente(s).`)

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Olá, ${(profile?.full_name || 'Admin').split(' ')[0]}`}
      />

      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((a, i) => (
            <Card
              key={i}
              className="border-amber-200 bg-amber-50 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            >
              {a}
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/admin/membros">
          <Stat icon="👥" label="Membros ativos" value={data.activeMembers} />
        </Link>
        <Link to="/admin/presencas">
          <Stat icon="🚪" label="Presenças hoje" value={data.todayCheckins} />
        </Link>
        <Link to="/admin/pagamentos">
          <Stat
            icon="💳"
            label="Recebido este mês"
            value={mzn(data.receivedThisMonth)}
            tone="good"
          />
        </Link>
        <Link to="/admin/pagamentos">
          <Stat
            icon="⚠️"
            label="Pagamentos pendentes"
            value={data.pendingCount}
            tone={data.pendingCount > 0 ? 'warn' : 'default'}
          />
        </Link>
      </div>
    </>
  )
}
