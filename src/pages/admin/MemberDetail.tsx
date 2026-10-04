import { useState } from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { PageHeader } from '@/components/AppShell'
import {
  Avatar,
  Card,
  EmptyState,
  MembershipBadge,
  SectionTitle,
  Spinner,
} from '@/components/ui'
import { Modal } from '@/components/Modal'
import { QrImage } from '@/components/QrImage'
import { useMember, usePayments, useAttendances, usePlans, useActions } from '@/lib/store'
import { dateLabel, dateTimeLabel, mzn } from '@/lib/format'
import { membershipStateOf, type Plan } from '@/lib/types'

export default function MemberDetail() {
  const { id = '' } = useParams()
  const member = useMember(id)
  const payments = usePayments(id)
  const attendances = useAttendances(id, 10)
  const plans = usePlans(true)
  const actions = useActions()

  const [showPay, setShowPay] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  if (member.isLoading) return <Spinner />
  const m = member.data
  if (!m) return <EmptyState icon="🤷" text="Membro não encontrado." />

  const state = membershipStateOf(m.valid_until)

  async function confirm(plan: Plan) {
    setBusy(true)
    try {
      const p = await actions.confirmPayment(id, plan)
      setDone(`✅ ${plan.name} · ${mzn(plan.price_mzn)} · válido até ${dateLabel(p.valid_until)}`)
    } finally {
      setBusy(false)
    }
  }

  async function downloadQr() {
    const url = await QRCode.toDataURL(`gymcheck:${m!.token}`, { width: 600, margin: 2 })
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${m!.full_name.replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
  }

  return (
    <>
      <PageHeader title={m.full_name} subtitle={m.phone ?? undefined} />

      <Card className="mb-3 flex items-center gap-4">
        <Avatar name={m.full_name} url={m.photo} size={56} />
        <div className="flex-1">
          {m.status === 'suspended' ? (
            <span className="badge bg-slate-200 text-slate-600 dark:bg-slate-700">
              Suspenso
            </span>
          ) : (
            <MembershipBadge state={state} />
          )}
          <p className="mt-1 text-xs text-slate-500">
            Válida até {dateLabel(m.valid_until)}
          </p>
        </div>
      </Card>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button className="btn-primary" onClick={() => setShowPay(true)}>
          💳 Confirmar pagamento
        </button>
        <button className="btn-ghost" onClick={() => setShowQr(true)}>
          📷 Ver QR
        </button>
      </div>

      <button
        className={`btn-ghost mb-4 w-full ${m.status === 'active' ? 'text-rose-600' : 'text-emerald-600'}`}
        onClick={() => actions.toggleStatus(id)}
      >
        {m.status === 'active' ? 'Suspender membro' : 'Reativar membro'}
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

      {showPay && (
        <Modal
          onClose={() => {
            if (!busy) {
              setShowPay(false)
              setDone(null)
            }
          }}
        >
          {done ? (
            <div className="text-center">
              <h2 className="text-lg font-bold">Pagamento confirmado</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{done}</p>
              <button
                className="btn-primary mt-4 w-full"
                onClick={() => {
                  setShowPay(false)
                  setDone(null)
                }}
              >
                Concluir
              </button>
            </div>
          ) : (
            <>
              <h2 className="mb-3 text-lg font-bold">Confirmar pagamento</h2>
              {plans.isLoading ? (
                <Spinner />
              ) : (
                <div className="space-y-2">
                  {plans.data!.map((p) => (
                    <button key={p.id} disabled={busy} className="w-full" onClick={() => confirm(p)}>
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
            </>
          )}
        </Modal>
      )}

      {showQr && (
        <Modal onClose={() => setShowQr(false)}>
          <div className="flex flex-col items-center gap-3">
            <QrImage value={`gymcheck:${m.token}`} size={220} />
            <p className="font-semibold">{m.full_name}</p>
            <p className="text-center text-xs text-slate-400">
              O nome não está dentro do código — só este sistema o reconhece.
            </p>
            <button className="btn-primary w-full" onClick={downloadQr}>
              ⬇️ Descarregar QR (para enviar)
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
