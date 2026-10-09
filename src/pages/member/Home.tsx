import { Link } from 'react-router-dom'
import { QrCode, Clock, Flame, CalendarCheck, Hourglass, ClipboardList, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useAttendances } from '@/lib/store'
import { Avatar, Card, StatusPill } from '@/components/ui'
import { Logo } from '@/components/Logo'
import { dateLabel, fromNow, quoteOfTheDay } from '@/lib/format'
import { daysLeft, membershipStateOf } from '@/lib/types'

export default function MemberHome() {
  const { profile } = useAuth()
  const attendances = useAttendances(profile?.id, 60)
  if (!profile) return null

  const firstName = (profile.full_name || 'Membro').split(' ')[0]
  const dl = daysLeft(profile.valid_until)
  const state = membershipStateOf(profile.valid_until)
  const isActive = profile.status === 'active' && (state === 'active' || state === 'expiring')

  const now = new Date()
  const thisMonth = (attendances.data ?? []).filter((a) => {
    const d = new Date(a.checked_in_at)
    return a.result === 'granted' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const last = (attendances.data ?? []).find((a) => a.result === 'granted')

  const needsInscription =
    (profile.status === 'pending' && !profile.plan_id) ||
    (profile.status === 'active' && state === 'expired')
  const waitingConfirm = profile.status === 'pending' && !!profile.plan_id

  return (
    <>
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={profile.full_name} url={profile.photo} size={46} />
          <div className="min-w-0">
            <p className="text-sm text-slate-400">Olá,</p>
            <h1 className="truncate text-xl font-bold leading-tight">{firstName} 👋</h1>
          </div>
        </div>
        <Logo size={96} />
      </header>

      {needsInscription && (
        <Link to="/inscricao">
          <Card className="mb-4 flex items-center gap-3 border-brand/30 bg-brand/10">
            <ClipboardList className="shrink-0 text-brand-400" size={22} />
            <div className="flex-1">
              <p className="font-semibold">Fazer inscrição</p>
              <p className="text-xs text-slate-300">
                Escolhe o teu plano para ativares o acesso ao ginásio.
              </p>
            </div>
            <ChevronRight className="text-slate-500" size={18} />
          </Card>
        </Link>
      )}

      {waitingConfirm && (
        <Card className="mb-4 flex items-center gap-3 border-amber-500/30 bg-amber-500/10">
          <Hourglass className="shrink-0 text-amber-400" size={20} />
          <p className="text-sm text-amber-200">
            Inscrição enviada. Entrega o pagamento ao ginásio — assim que confirmarem, o teu
            QR Code fica ativo.
          </p>
        </Card>
      )}

      {/* Cartão de membro */}
      <Link
        to="/mensalidade"
        className="relative mb-4 block overflow-hidden rounded-3xl border border-white/10 bg-brand-grad p-5 shadow-glow"
      >
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Cartão de Membro
            </span>
            <StatusPill profile={profile} />
          </div>
          <p className="mt-6 text-2xl font-bold text-white">{profile.full_name}</p>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/70">Válido até</p>
              <p className="text-lg font-semibold text-white">{dateLabel(profile.valid_until)}</p>
            </div>
            {isActive && dl != null && (
              <div className="text-right">
                <p className="text-3xl font-extrabold leading-none text-white">{dl}</p>
                <p className="text-[11px] uppercase tracking-wide text-white/70">
                  {dl === 1 ? 'dia' : 'dias'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Frase do dia */}
      <Card className="mb-4 flex items-start gap-3">
        <Flame className="mt-0.5 shrink-0 text-lime-400" size={20} />
        <p className="text-sm italic text-slate-300">“{quoteOfTheDay()}”</p>
      </Card>

      {/* Resumo */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card>
          <CalendarCheck className="mb-2 text-brand-400" size={20} />
          <div className="text-2xl font-bold">{thisMonth}</div>
          <div className="text-xs text-slate-400">Presenças este mês</div>
        </Card>
        <Card>
          <Clock className="mb-2 text-brand-400" size={20} />
          <div className="text-sm font-semibold">{last ? fromNow(last.checked_in_at) : '—'}</div>
          <div className="text-xs text-slate-400">Última entrada</div>
        </Card>
      </div>

      <Link to="/qr">
        <Card className="flex items-center justify-between">
          <div>
            <p className="font-semibold">O meu QR Code</p>
            <p className="text-xs text-slate-400">Mostra à entrada do ginásio</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-brand-400">
            <QrCode size={22} />
          </div>
        </Card>
      </Link>
    </>
  )
}
