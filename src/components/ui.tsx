import type { ReactNode } from 'react'
import { Dumbbell } from 'lucide-react'
import { ageFrom, membershipStateOf, type Profile } from '@/lib/types'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
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
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="rounded-full object-cover ring-2 ring-white/10"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-brand/20 font-bold text-brand-400 ring-2 ring-white/10"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials || <Dumbbell size={size * 0.5} />}
    </div>
  )
}

/** Estado combinado (conta + mensalidade) de um membro. */
export function statusMeta(p: Pick<Profile, 'status' | 'valid_until'>): {
  label: string
  cls: string
  dot: string
} {
  if (p.status === 'suspended')
    return { label: 'Suspenso', cls: 'bg-slate-500/15 text-slate-300', dot: 'bg-slate-400' }
  if (p.status === 'pending')
    return { label: 'Pendente', cls: 'bg-amber-500/15 text-amber-300', dot: 'bg-amber-400' }
  const st = membershipStateOf(p.valid_until)
  if (st === 'expired' || st === 'none')
    return { label: 'Expirado', cls: 'bg-rose-500/15 text-rose-300', dot: 'bg-rose-400' }
  if (st === 'expiring')
    return { label: 'A terminar', cls: 'bg-amber-500/15 text-amber-300', dot: 'bg-amber-400' }
  return { label: 'Ativo', cls: 'bg-lime/15 text-lime-400', dot: 'bg-lime' }
}

export function StatusPill({ profile }: { profile: Pick<Profile, 'status' | 'valid_until'> }) {
  const m = statusMeta(profile)
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
  icon: ReactNode
  label: string
  value: ReactNode
  tone?: 'default' | 'warn' | 'good'
}) {
  const ring =
    tone === 'warn'
      ? 'text-amber-300'
      : tone === 'good'
        ? 'text-lime-400'
        : 'text-slate-100'
  return (
    <div className="card-grad">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-brand-400">
        {icon}
      </div>
      <div className={`text-2xl font-bold ${ring}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}

export function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center text-slate-400">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-500">
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-brand" />
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />
}

export function MemberMeta({ p }: { p: Profile }) {
  const age = ageFrom(p.birth_date)
  const bits = [
    p.phone,
    age != null ? `${age} anos` : null,
    p.gender,
  ].filter(Boolean)
  return <p className="truncate text-xs text-slate-400">{bits.join(' · ') || 'Sem dados'}</p>
}
