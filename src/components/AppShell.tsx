import { NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DoorOpen,
  MoreHorizontal,
  Home,
  QrCode,
  CalendarCheck,
  CalendarDays,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const ADMIN_NAV: NavItem[] = [
  { to: '/', label: 'Início', icon: LayoutDashboard },
  { to: '/membros', label: 'Membros', icon: Users },
  { to: '/pagamentos', label: 'Pagam.', icon: CreditCard },
  { to: '/presencas', label: 'Entradas', icon: DoorOpen },
  { to: '/mais', label: 'Mais', icon: MoreHorizontal },
]

const MEMBER_NAV: NavItem[] = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/aulas', label: 'Aulas', icon: CalendarDays },
  { to: '/qr', label: 'QR Code', icon: QrCode },
  { to: '/presencas', label: 'Entradas', icon: CalendarCheck },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const location = useLocation()
  const nav = profile?.role === 'admin' ? ADMIN_NAV : MEMBER_NAV

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-ink-950/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl px-2 py-1.5">
          {nav.map((item) => {
            const active =
              item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10.5px] font-medium transition ${
                  active ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    active ? 'bg-brand/15' : ''
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                </span>
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
    <header className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
