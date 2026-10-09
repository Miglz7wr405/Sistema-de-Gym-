import { Link } from 'react-router-dom'
import { Tag, CalendarDays, Dumbbell, BarChart3, Bell, LogOut, ChevronRight, Cloud } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Card } from '@/components/ui'
import { useAuth } from '@/lib/auth'

const LINKS = [
  { icon: CalendarDays, label: 'Aulas', to: '/aulas' },
  { icon: Tag, label: 'Planos', to: '/planos' },
]

const SOON = [
  { icon: Dumbbell, label: 'Eventos' },
  { icon: BarChart3, label: 'Finanças' },
  { icon: Bell, label: 'Notificações' },
]

export default function AdminMore() {
  const { profile, signOut } = useAuth()

  return (
    <>
      <PageHeader title="Mais" subtitle={profile?.email ?? undefined} />

      <div className="mb-4 space-y-2">
        {LINKS.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.label} to={item.to}>
              <Card className="flex items-center gap-3 py-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/15 text-brand-400">
                  <Icon size={18} />
                </div>
                <span className="flex-1 font-medium">{item.label}</span>
                <ChevronRight size={18} className="text-slate-600" />
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="mb-4 flex items-center gap-3 border-lime/20 bg-lime/5 py-3">
        <Cloud size={18} className="shrink-0 text-lime-400" />
        <p className="text-xs text-lime-200/90">
          Dados online e seguros. Os membros registam-se na app e tu ativas aqui.
        </p>
      </Card>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Em breve</p>
      <div className="space-y-2">
        {SOON.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="opacity-70">
              <Card className="flex items-center gap-3 py-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400">
                  <Icon size={18} />
                </div>
                <span className="flex-1 font-medium">{item.label}</span>
                <span className="badge bg-white/5 text-slate-500">em breve</span>
              </Card>
            </div>
          )
        })}
      </div>

      <button onClick={signOut} className="btn-ghost mt-5 w-full text-rose-400">
        <LogOut size={18} /> Terminar sessão
      </button>
    </>
  )
}
