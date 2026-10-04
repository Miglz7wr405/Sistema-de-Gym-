import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useAttendances, useMyMembership } from '@/lib/queries'
import { Card, MembershipBadge, Spinner, Avatar } from '@/components/ui'
import { dateLabel, fromNow, quoteOfTheDay } from '@/lib/format'
import { membershipStateOf } from '@/lib/types'

export default function MemberHome() {
  const { profile } = useAuth()
  const membership = useMyMembership(profile?.id)
  const attendances = useAttendances(profile?.id, 30)

  const state = membershipStateOf(membership.data?.valid_until ?? null)
  const firstName = (profile?.full_name || 'Membro').split(' ')[0]

  const thisMonth = (attendances.data ?? []).filter((a) => {
    const d = new Date(a.checked_in_at)
    const now = new Date()
    return (
      a.result === 'granted' &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    )
  }).length

  const lastVisit = (attendances.data ?? []).find((a) => a.result === 'granted')

  return (
    <>
      <header className="mb-4 flex items-center gap-3">
        <Avatar name={profile?.full_name ?? ''} url={profile?.photo_url} size={48} />
        <div>
          <p className="text-sm text-slate-500">Olá,</p>
          <h1 className="text-xl font-bold leading-tight">{firstName} 👋</h1>
        </div>
      </header>

      {/* Frase motivacional (diferencial) */}
      <Card className="mb-3 border-brand/20 bg-brand/5 dark:bg-brand/10">
        <p className="text-sm italic text-brand-700 dark:text-brand">
          “{quoteOfTheDay()}”
        </p>
      </Card>

      {/* Estado da mensalidade */}
      <Link to="/minha-mensalidade">
        <Card className="mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Mensalidade</p>
              <p className="mt-0.5 font-semibold">
                Válida até {dateLabel(membership.data?.valid_until)}
              </p>
            </div>
            {membership.isLoading ? <Spinner /> : <MembershipBadge state={state} />}
          </div>
          {state === 'expiring' && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              ⚠️ A tua mensalidade está perto de terminar. Renova para não perder acesso.
            </p>
          )}
          {state === 'expired' && (
            <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              🔴 A tua mensalidade expirou. Fala com a receção para renovar.
            </p>
          )}
        </Card>
      </Link>

      {/* Resumo rápido */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <Card>
          <div className="text-xl">🚪</div>
          <div className="mt-1 text-2xl font-bold">{thisMonth}</div>
          <div className="text-xs text-slate-500">Presenças este mês</div>
        </Card>
        <Card>
          <div className="text-xl">🕒</div>
          <div className="mt-1 text-sm font-semibold">
            {lastVisit ? fromNow(lastVisit.checked_in_at) : '—'}
          </div>
          <div className="text-xs text-slate-500">Última presença</div>
        </Card>
      </div>

      {/* Atalho para QR */}
      <Link to="/qr">
        <Card className="flex items-center justify-between">
          <div>
            <p className="font-semibold">O meu QR Code</p>
            <p className="text-xs text-slate-500">Mostra à entrada do ginásio</p>
          </div>
          <span className="text-2xl">📷</span>
        </Card>
      </Link>
    </>
  )
}
