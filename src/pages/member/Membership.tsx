import { Link } from 'react-router-dom'
import { Receipt, ClipboardList } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { usePayments, usePlan } from '@/lib/store'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, SectionTitle, Spinner, StatusPill } from '@/components/ui'
import { dateLabel, mzn } from '@/lib/format'
import { membershipStateOf } from '@/lib/types'

export default function MemberMembership() {
  const { profile } = useAuth()
  const plan = usePlan(profile?.plan_id)
  const payments = usePayments(profile?.id)
  if (!profile) return null

  const state = membershipStateOf(profile.valid_until)
  const needsInscription =
    (profile.status === 'pending' && !profile.plan_id) ||
    (profile.status === 'active' && state === 'expired')

  return (
    <>
      <PageHeader title="A minha mensalidade" />

      {needsInscription && (
        <Link to="/inscricao">
          <Card className="mb-4 flex items-center gap-3 border-brand/30 bg-brand/10">
            <ClipboardList className="shrink-0 text-brand-400" size={22} />
            <div className="flex-1">
              <p className="font-semibold">Fazer inscrição</p>
              <p className="text-xs text-slate-300">Escolhe o teu plano para ativares o acesso.</p>
            </div>
          </Card>
        </Link>
      )}

      <Card className="mb-4 space-y-3">
        <Row label="Plano" value={plan.data?.name ?? '—'} />
        <Row label="Valor" value={plan.data ? mzn(plan.data.price_mzn) : '—'} />
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Estado</span>
          <StatusPill profile={profile} />
        </div>
        <Row label="Válido até" value={dateLabel(profile.valid_until)} />
      </Card>

      <SectionTitle>Histórico de pagamentos</SectionTitle>
      {payments.isLoading ? (
        <Spinner />
      ) : (payments.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Receipt size={22} />} text="Ainda sem pagamentos registados." />
      ) : (
        <div className="space-y-2">
          {payments.data!.map((p) => (
            <Card key={p.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{mzn(p.amount_mzn)}</p>
                <p className="text-xs text-slate-400">
                  {dateLabel(p.paid_at)} · {p.plan_name} · {p.receipt_no}
                </p>
              </div>
              <span className="text-xs text-slate-500">até {dateLabel(p.valid_until)}</span>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
