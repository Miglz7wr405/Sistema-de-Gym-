import { useAuth } from '@/lib/auth'
import { useMyMembership, usePayments, usePlanById } from '@/lib/queries'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, MembershipBadge, SectionTitle, Spinner } from '@/components/ui'
import { dateLabel, mzn } from '@/lib/format'
import { membershipStateOf } from '@/lib/types'

export default function MemberMembership() {
  const { profile } = useAuth()
  const membership = useMyMembership(profile?.id)
  const plan = usePlanById(membership.data?.plan_id)
  const payments = usePayments(profile?.id)

  const state = membershipStateOf(membership.data?.valid_until ?? null)

  return (
    <>
      <PageHeader title="Minha Mensalidade" />

      <Card className="mb-4">
        {membership.isLoading ? (
          <Spinner />
        ) : (
          <dl className="space-y-3">
            <Row label="Plano" value={plan.data?.name ?? '—'} />
            <Row label="Valor" value={plan.data ? mzn(plan.data.price_mzn) : '—'} />
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Estado</dt>
              <dd>
                <MembershipBadge state={state} />
              </dd>
            </div>
            <Row label="Válido até" value={dateLabel(membership.data?.valid_until)} />
          </dl>
        )}
      </Card>

      <SectionTitle>Histórico de pagamentos</SectionTitle>
      {payments.isLoading ? (
        <Spinner />
      ) : (payments.data?.length ?? 0) === 0 ? (
        <EmptyState icon="🧾" text="Ainda sem pagamentos registados." />
      ) : (
        <div className="space-y-2">
          {payments.data!.map((p) => (
            <Card key={p.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{mzn(p.amount_mzn)}</p>
                <p className="text-xs text-slate-500">
                  {dateLabel(p.paid_at)} · {p.receipt_no}
                </p>
              </div>
              <span className="text-xs text-slate-400">
                até {dateLabel(p.valid_until)}
              </span>
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
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}
