import { Link } from 'react-router-dom'
import { Users, DoorOpen, Wallet, AlertTriangle, ScanLine, Clock } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Card, Spinner, Stat } from '@/components/ui'
import { useDashboard } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { mzn } from '@/lib/format'

export default function AdminDashboard() {
  const { profile } = useAuth()
  const { data, isLoading } = useDashboard()

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Início" />
        <Spinner />
      </>
    )
  }

  const alerts: { icon: typeof Clock; text: string }[] = []
  if (data.expiringSoon > 0)
    alerts.push({ icon: Clock, text: `${data.expiringSoon} mensalidade(s) terminam nos próximos 3 dias.` })
  if (data.pendingCount > 0)
    alerts.push({ icon: AlertTriangle, text: `${data.pendingCount} conta(s)/pagamento(s) por tratar.` })

  return (
    <>
      <PageHeader title="Início" subtitle={`Olá, ${(profile?.full_name || 'Admin').split(' ')[0]}`} />

      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((a, i) => {
            const Icon = a.icon
            return (
              <Card key={i} className="flex items-center gap-3 border-amber-500/25 bg-amber-500/10 py-3">
                <Icon size={18} className="shrink-0 text-amber-400" />
                <p className="text-sm text-amber-100">{a.text}</p>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/membros">
          <Stat icon={<Users size={18} />} label="Membros ativos" value={data.activeMembers} tone="good" />
        </Link>
        <Link to="/presencas">
          <Stat icon={<DoorOpen size={18} />} label="Entradas hoje" value={data.todayCheckins} />
        </Link>
        <Link to="/pagamentos">
          <Stat icon={<Wallet size={18} />} label="Recebido este mês" value={mzn(data.receivedThisMonth)} tone="good" />
        </Link>
        <Link to="/pagamentos">
          <Stat icon={<AlertTriangle size={18} />} label="Por tratar" value={data.pendingCount} tone={data.pendingCount > 0 ? 'warn' : 'default'} />
        </Link>
      </div>

      <Link to="/presencas" className="mt-3 block">
        <Card className="flex items-center justify-between bg-card-grad">
          <div>
            <p className="font-semibold">Registar entrada</p>
            <p className="text-xs text-slate-400">Ler o QR do membro à porta</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-glow">
            <ScanLine size={24} />
          </div>
        </Card>
      </Link>
    </>
  )
}
