import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card, EmptyState, MembershipBadge, SectionTitle, Spinner } from '@/components/ui'
import { QrImage } from '@/components/QrImage'
import { supabase } from '@/lib/supabase'
import { useAttendances, useMyMembership, useMyToken, usePayments, usePlans } from '@/lib/queries'
import { confirmPayment } from '@/lib/payments'
import { dateLabel, dateTimeLabel, mzn } from '@/lib/format'
import { membershipStateOf, type Plan, type Profile } from '@/lib/types'
import { useAuth } from '@/lib/auth'

export default function AdminMemberDetail() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const { profile: admin } = useAuth()

  const profileQ = useQuery({
    queryKey: ['profile', id],
    enabled: !!id,
    queryFn: async (): Promise<Profile | null> => {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
      return data as Profile | null
    },
  })
  const membership = useMyMembership(id)
  const payments = usePayments(id)
  const attendances = useAttendances(id, 10)
  const token = useMyToken(id)
  const plans = usePlans(true)

  const [showPay, setShowPay] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [busy, setBusy] = useState(false)

  const member = profileQ.data
  const state = membershipStateOf(membership.data?.valid_until ?? null)

  async function toggleStatus() {
    if (!member) return
    const next = member.status === 'active' ? 'suspended' : 'active'
    await supabase.from('profiles').update({ status: next }).eq('id', member.id)
    qc.invalidateQueries({ queryKey: ['profile', id] })
    qc.invalidateQueries({ queryKey: ['members'] })
  }

  async function onConfirmPlan(plan: Plan) {
    if (!admin) return
    setBusy(true)
    try {
      await confirmPayment({ memberId: id, plan, createdBy: admin.id })
      qc.invalidateQueries({ queryKey: ['my-membership', id] })
      qc.invalidateQueries({ queryKey: ['payments', id] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
      setShowPay(false)
    } finally {
      setBusy(false)
    }
  }

  if (profileQ.isLoading) return <Spinner />
  if (!member) return <EmptyState icon="🤷" text="Membro não encontrado." />

  return (
    <>
      <PageHeader title={member.full_name} subtitle={member.email ?? undefined} />

      <Card className="mb-3 flex items-center gap-4">
        <Avatar name={member.full_name} url={member.photo_url} size={56} />
        <div className="flex-1">
          <MembershipBadge state={state} />
          <p className="mt-1 text-xs text-slate-500">
            Válida até {dateLabel(membership.data?.valid_until)}
          </p>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button className="btn-primary" onClick={() => setShowPay(true)}>
          💳 Confirmar pagamento
        </button>
        <button className="btn-ghost" onClick={() => setShowQr(true)}>
          📷 Ver QR
        </button>
      </div>

      <button
        className={`btn-ghost mb-4 w-full ${member.status === 'active' ? 'text-rose-600' : 'text-emerald-600'}`}
        onClick={toggleStatus}
      >
        {member.status === 'active' ? 'Suspender membro' : 'Reativar membro'}
      </button>

      <SectionTitle>Pagamentos</SectionTitle>
      {(payments.data?.length ?? 0) === 0 ? (
        <EmptyState icon="🧾" text="Sem pagamentos." />
      ) : (
        <div className="mb-4 space-y-2">
          {payments.data!.map((p) => (
            <Card key={p.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{mzn(p.amount_mzn)}</p>
                <p className="text-xs text-slate-500">
                  {dateLabel(p.paid_at)} · {p.receipt_no}
                </p>
              </div>
              <span className="text-xs text-slate-400">até {dateLabel(p.valid_until)}</span>
            </Card>
          ))}
        </div>
      )}

      <SectionTitle>Presenças recentes</SectionTitle>
      {(attendances.data?.length ?? 0) === 0 ? (
        <EmptyState icon="🚪" text="Sem presenças." />
      ) : (
        <div className="space-y-2">
          {attendances.data!.map((a) => (
            <Card key={a.id} className="flex items-center gap-3 py-2.5">
              <span>{a.result === 'granted' ? '🟢' : '🔴'}</span>
              <span className="text-sm">{dateTimeLabel(a.checked_in_at)}</span>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: escolher plano e confirmar pagamento */}
      {showPay && (
        <Modal onClose={() => !busy && setShowPay(false)}>
          <h2 className="mb-3 text-lg font-bold">Confirmar pagamento</h2>
          {plans.isLoading ? (
            <Spinner />
          ) : (
            <div className="space-y-2">
              {plans.data!.map((p) => (
                <button
                  key={p.id}
                  disabled={busy}
                  className="w-full"
                  onClick={() => onConfirmPlan(p)}
                >
                  <Card className="flex items-center justify-between py-3 text-left">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.duration_days} dias</p>
                    </div>
                    <span className="font-bold text-brand">{mzn(p.price_mzn)}</span>
                  </Card>
                </button>
              ))}
            </div>
          )}
          {busy && <p className="mt-3 text-center text-sm text-slate-500">A processar…</p>}
        </Modal>
      )}

      {/* Modal: QR do membro */}
      {showQr && (
        <Modal onClose={() => setShowQr(false)}>
          <div className="flex flex-col items-center gap-3 py-2">
            {token.data ? (
              <QrImage value={`gymcheck:${token.data}`} size={220} />
            ) : (
              <Spinner />
            )}
            <p className="font-semibold">{member.full_name}</p>
          </div>
        </Modal>
      )}
    </>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
