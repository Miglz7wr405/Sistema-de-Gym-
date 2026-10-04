import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/AppShell'
import { Card } from '@/components/ui'
import { useAuth } from '@/lib/auth'

const SOON = [
  { icon: '🎉', label: 'Eventos' },
  { icon: '👨‍🏫', label: 'Instrutores' },
  { icon: '📅', label: 'Aulas' },
  { icon: '📈', label: 'Finanças' },
  { icon: '🔔', label: 'Notificações' },
]

export default function More() {
  const { session, signOut } = useAuth()

  return (
    <>
      <PageHeader title="Mais" subtitle={session?.user.email ?? undefined} />

      <Link to="/planos">
        <Card className="mb-3 flex items-center gap-3 py-3.5">
          <span className="text-xl">🏷️</span>
          <span className="flex-1 font-medium">Planos</span>
          <span className="text-slate-300">›</span>
        </Card>
      </Link>

      <Card className="mb-4 border-emerald-200 bg-emerald-50 py-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        ☁️ Os teus dados estão guardados online e em segurança. Entra em qualquer
        aparelho com a tua conta e vês tudo igual.
      </Card>

      <p className="mb-2 mt-5 text-sm font-semibold text-slate-500">Em breve</p>
      <div className="space-y-2">
        {SOON.map((item) => (
          <div key={item.label} className="opacity-70">
            <Card className="flex items-center gap-3 py-3.5">
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 font-medium">{item.label}</span>
              <span className="badge bg-slate-100 text-slate-400 dark:bg-slate-800">
                em breve
              </span>
            </Card>
          </div>
        ))}
      </div>

      <button onClick={signOut} className="btn-ghost mt-5 w-full text-rose-600">
        Terminar sessão
      </button>
    </>
  )
}
