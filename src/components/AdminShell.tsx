import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  CreditCard,
  Tag,
  CalendarDays,
  Trophy,
  Contact,
  Bell,
  DoorOpen,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Logo } from '@/components/Logo'

interface Item {
  to: string
  label: string
  icon: LucideIcon
}

const NAV: Item[] = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/membros', label: 'Membros', icon: Users },
  { to: '/mensalidades', label: 'Mensalidades', icon: CreditCard },
  { to: '/presencas', label: 'Entradas', icon: DoorOpen },
  { to: '/planos', label: 'Planos', icon: Tag },
  { to: '/aulas', label: 'Aulas', icon: CalendarDays },
  { to: '/eventos', label: 'Eventos', icon: Trophy },
  { to: '/instrutores', label: 'Instrutores', icon: Contact },
  { to: '/avisos', label: 'Avisos', icon: Bell },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto min-h-screen max-w-2xl">
      {/* Barra superior */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-ink-950/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2.5">
          <button onClick={() => setOpen(true)} className="rounded-xl p-1.5 hover:bg-white/5">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Logo size={92} />
            <span className="badge bg-brand/15 text-brand">ADMIN</span>
          </div>
        </div>
      </header>

      <main className="px-4 pb-16 pt-16">{children}</main>

      {/* Gaveta */}
      {open && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setOpen(false)}>
          <div className="h-full w-72 max-w-[80%] overflow-y-auto border-r border-white/10 bg-ink-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3">
              <Logo size={110} />
              <button onClick={() => setOpen(false)} className="rounded-xl p-1.5 hover:bg-white/5">
                <X size={20} />
              </button>
            </div>
            <nav className="px-2 py-2">
              {NAV.map((item) => {
                const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`mb-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                      active ? 'bg-brand text-ink-950' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} /> {item.label}
                  </NavLink>
                )
              })}
            </nav>
            <div className="border-t border-white/10 px-2 py-2">
              <button
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-white/5"
              >
                <LogOut size={18} /> Terminar sessão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
