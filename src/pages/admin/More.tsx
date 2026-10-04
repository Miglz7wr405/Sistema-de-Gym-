import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/AppShell'
import { Card } from '@/components/ui'
import { useAuth } from '@/lib/auth'

interface Item {
  to?: string
  icon: string
  label: string
  soon?: boolean
}

const ITEMS: Item[] = [
  { to: '/admin/planos', icon: '🏷️', label: 'Planos' },
  { icon: '🎉', label: 'Eventos', soon: true },
  { icon: '👨‍🏫', label: 'Instrutores', soon: true },
  { icon: '📈', label: 'Finanças', soon: true },
  { icon: '🔔', label: 'Notificações', soon: true },
  { icon: '⚙️', label: 'Configurações', soon: true },
]

export default function AdminMore() {
  const { profile, signOut } = useAuth()

  return (
    <>
      <PageHeader title="Mais" subtitle={profile?.full_name ?? undefined} />

      <div className="space-y-2">
        {ITEMS.map((item) => {
          const inner = (
            <Card className="flex items-center gap-3 py-3.5">
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 font-medium">{item.label}</span>
              {item.soon ? (
                <span className="badge bg-slate-100 text-slate-400 dark:bg-slate-800">
                  em breve
                </span>
              ) : (
                <span className="text-slate-300">›</span>
              )}
            </Card>
          )
          return item.to ? (
            <Link key={item.label} to={item.to}>
              {inner}
            </Link>
          ) : (
            <div key={item.label} className="opacity-70">
              {inner}
            </div>
          )
        })}
      </div>

      <button onClick={signOut} className="btn-ghost mt-5 w-full text-rose-600">
        Terminar sessão
      </button>
    </>
  )
}
