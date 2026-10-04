import { NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/lib/auth'

interface NavItem {
  to: string
  label: string
  icon: string
}

const MEMBER_NAV: NavItem[] = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/aulas', label: 'Aulas', icon: '📅' },
  { to: '/presencas', label: 'Presenças', icon: '🚪' },
  { to: '/qr', label: 'QR Code', icon: '📷' },
  { to: '/perfil', label: 'Perfil', icon: '👤' },
]

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/membros', label: 'Membros', icon: '👥' },
  { to: '/admin/pagamentos', label: 'Pagamentos', icon: '💳' },
  { to: '/admin/presencas', label: 'Presenças', icon: '🚪' },
  { to: '/admin/mais', label: 'Mais', icon: '⋯' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const location = useLocation()
  const nav = profile?.role === 'admin' ? ADMIN_NAV : MEMBER_NAV

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <main className="flex-1 px-4 pb-24 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-2xl">
          {nav.map((item) => {
            const active =
              item.to === '/' || item.to === '/admin'
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                  active
                    ? 'text-brand'
                    : 'text-slate-500 dark:text-slate-400'
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
