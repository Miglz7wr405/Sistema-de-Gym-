import type { ReactNode } from 'react'
import { initials } from '@/lib/format'
import type { MembershipState } from '@/lib/types'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`card ${className}`}>{children}</div>
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
      {children}
    </h2>
  )
}

export function Avatar({
  name,
  url,
  size = 44,
}: {
  name: string
  url?: string | null
  size?: number
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-brand/10 font-semibold text-brand"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  )
}

const STATE_META: Record<
  MembershipState,
  { label: string; cls: string; dot: string }
> = {
  active: {
    label: 'Ativa',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  expiring: {
    label: 'A terminar',
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  expired: {
    label: 'Expirada',
    cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  none: {
    label: 'Sem plano',
    cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
}

export function MembershipBadge({ state }: { state: MembershipState }) {
  const m = STATE_META[state]
  return (
    <span className={`badge ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

export function Stat({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: string
  label: string
  value: ReactNode
  tone?: 'default' | 'warn' | 'good'
}) {
  const toneCls =
    tone === 'warn'
      ? 'text-amber-600 dark:text-amber-400'
      : tone === 'good'
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-slate-900 dark:text-slate-100'
  return (
    <div className="card">
      <div className="text-xl">{icon}</div>
      <div className={`mt-1 text-2xl font-bold ${toneCls}`}>{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  )
}

export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="card flex flex-col items-center gap-2 py-8 text-center text-slate-400">
      <span className="text-3xl">{icon}</span>
      <span className="text-sm">{text}</span>
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
    </div>
  )
}
