import { NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV: NavItem[] = [
  { to: '/', label: 'Início', icon: '📊' },
  { to: '/membros', label: 'Membros', icon: '👥' },
  { to: '/pagamentos', label: 'Pagamentos', icon: '💳' },
  { to: '/presencas', label: 'Presenças', icon: '🚪' },
  { to: '/mais', label: 'Mais', icon: '⋯' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <main className="flex-1 px-4 pb-24 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-2xl">
          {NAV.map((item) => {
            const active =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                  active ? 'text-brand' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  )
}
