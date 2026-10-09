import { Link } from 'react-router-dom'
import { Lock, ShieldCheck, CalendarClock } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { usePayments } from '@/lib/store'
import { PageHeader } from '@/components/AppShell'
import { Card, StatusPill } from '@/components/ui'
import { QrImage } from '@/components/QrImage'
import { dateLabel } from '@/lib/format'
import { daysLeft, membershipStateOf } from '@/lib/types'

export default function MemberQR() {
  const { profile } = useAuth()
  const payments = usePayments(profile?.id)
  if (!profile) return null

  const state = membershipStateOf(profile.valid_until)
  const active = profile.status === 'active' && (state === 'active' || state === 'expiring')
  const dl = daysLeft(profile.valid_until)

  // Início = data do pagamento mais recente
  const start = payments.data?.[0]?.paid_at?.slice(0, 10) ?? null
  let passed: number | null = null
  let total: number | null = null
  if (start && profile.valid_until) {
    const s = new Date(start + 'T00:00:00').getTime()
    const e = new Date(profile.valid_until + 'T23:59:59').getTime()
    total = Math.max(1, Math.round((e - s) / 86_400_000))
    passed = Math.max(0, Math.min(total, Math.round((Date.now() - s) / 86_400_000)))
  }
  const pct = total && passed != null ? Math.round((passed / total) * 100) : 0

  const reason =
    profile.status === 'pending'
      ? !profile.plan_id
        ? 'Ainda não fizeste a inscrição.'
        : 'A tua inscrição aguarda confirmação do ginásio.'
      : profile.status === 'suspended'
        ? 'A tua conta está suspensa. Fala com a receção.'
        : 'A tua mensalidade expirou. Renova para reativar o QR.'

  return (
    <>
      <PageHeader title="O meu QR Code" subtitle="Apresenta à entrada do ginásio" />

      <Card className="flex flex-col items-center gap-5 py-8">
        {active ? (
          <>
            <QrImage value={`gymcheck:${profile.token}`} size={250} />
            <div className="text-center">
              <p className="text-lg font-bold">{profile.full_name}</p>
              <div className="mt-1.5 flex justify-center">
                <StatusPill profile={profile} />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2.5 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-lime-400" />
              O teu nome não está dentro do código — só o ginásio o reconhece.
            </div>
          </>
        ) : (
          <>
            <div className="flex h-[250px] w-[250px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-500">
              <Lock size={46} />
              <span className="mt-3 text-sm">QR bloqueado</span>
            </div>
            <div className="text-center">
              <StatusPill profile={profile} />
              <p className="mt-3 max-w-xs text-sm text-slate-400">{reason}</p>
              {(profile.status === 'pending' && !profile.plan_id) ||
              (profile.status === 'active' && state === 'expired') ? (
                <Link to="/inscricao" className="btn-primary mt-4 inline-flex">
                  Fazer inscrição
                </Link>
              ) : null}
            </div>
          </>
        )}
      </Card>

      {active && (
        <Card className="mt-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CalendarClock size={18} className="text-brand-400" /> Validade
          </div>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-400">Expira em</p>
              <p className="font-semibold">{dateLabel(profile.valid_until)}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold leading-none text-lime-400">{dl ?? '—'}</p>
              <p className="text-xs text-slate-400">{dl === 1 ? 'dia restante' : 'dias restantes'}</p>
            </div>
          </div>
          {total != null && passed != null && (
            <>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-brand-grad" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {passed} de {total} dias usados · desde {dateLabel(start)}
              </p>
            </>
          )}
        </Card>
      )}
    </>
  )
}
