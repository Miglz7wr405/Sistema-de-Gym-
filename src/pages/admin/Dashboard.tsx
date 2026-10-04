import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/AppShell'
import { Card, Spinner, Stat } from '@/components/ui'
import { useDashboard } from '@/lib/store'
import { mzn } from '@/lib/format'

export default function Dashboard() {
  const { data, isLoading } = useDashboard()

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Início" />
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
      <PageHeader title="Início" subtitle="Resumo do ginásio" />

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
        <Link to="/membros">
          <Stat icon="👥" label="Membros ativos" value={data.activeMembers} />
        </Link>
        <Link to="/presencas">
          <Stat icon="🚪" label="Presenças hoje" value={data.todayCheckins} />
        </Link>
        <Link to="/pagamentos">
          <Stat
            icon="💳"
            label="Recebido este mês"
            value={mzn(data.receivedThisMonth)}
            tone="good"
          />
        </Link>
        <Link to="/pagamentos">
          <Stat
            icon="⚠️"
            label="Pagamentos pendentes"
            value={data.pendingCount}
            tone={data.pendingCount > 0 ? 'warn' : 'default'}
          />
        </Link>
      </div>

      <div className="mt-4">
        <Link to="/presencas">
          <Card className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Registar entrada</p>
              <p className="text-xs text-slate-500">Ler QR do membro à porta</p>
            </div>
            <span className="text-2xl">📷</span>
          </Card>
        </Link>
      </div>
    </>
  )
}
