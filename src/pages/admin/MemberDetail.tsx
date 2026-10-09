import { useState } from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import {
  CreditCard,
  QrCode,
  Download,
  Ban,
  CheckCircle2,
  Phone,
  Cake,
  User2,
  Receipt,
  DoorOpen,
} from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card, EmptyState, SectionTitle, Spinner, StatusPill } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { QrImage } from '@/components/QrImage'
import { useMember, usePayments, useAttendances, usePlans, useActions } from '@/lib/store'
import { dateLabel, dateTimeLabel, mzn } from '@/lib/format'
import { ageFrom, type Plan } from '@/lib/types'

export default function AdminMemberDetail() {
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
  if (!m) return <EmptyState icon={<User2 size={22} />} text="Membro não encontrado." />

  const age = ageFrom(m.birth_date)

  async function confirm(plan: Plan, durationDays: number) {
    setBusy(true)
    try {
      const p = await actions.confirmPayment(id, plan, { durationDays })
      setDone(`Pagamento confirmado: ${plan.name} · ${mzn(plan.price_mzn)} · válido até ${dateLabel(p.valid_until)}`)
    } finally {
      setBusy(false)
    }
  }

  async function downloadQr() {
    const url = await QRCode.toDataURL(`gymcheck:${m!.token}`, { width: 700, margin: 2 })
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${m!.full_name.replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
  }

  return (
    <>
      <PageHeader title={m.full_name} subtitle={m.email ?? undefined} />

      <Card className="mb-3 flex items-center gap-4">
        <Avatar name={m.full_name} url={m.photo} size={60} />
        <div className="flex-1">
          <StatusPill profile={m} />
          <p className="mt-1.5 text-xs text-slate-400">Válido até {dateLabel(m.valid_until)}</p>
        </div>
      </Card>

      {/* Dados pessoais */}
      <Card className="mb-3 grid grid-cols-3 gap-2 text-center">
        <Info icon={<Phone size={15} />} label="Telefone" value={m.phone || '—'} />
        <Info icon={<Cake size={15} />} label="Idade" value={age != null ? `${age}` : '—'} />
        <Info icon={<User2 size={15} />} label="Género" value={m.gender || '—'} />
      </Card>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button className="btn-primary" onClick={() => setShowPay(true)}>
          <CreditCard size={18} /> {m.status === 'pending' ? 'Ativar / Pagar' : 'Confirmar pagamento'}
        </button>
        <button className="btn-ghost" onClick={() => setShowQr(true)}>
          <QrCode size={18} /> Ver QR
        </button>
      </div>

      <button
        className={`btn-ghost mb-5 w-full ${m.status === 'suspended' ? 'text-lime-400' : 'text-rose-400'}`}
        onClick={() => actions.setStatus(id, m.status === 'suspended' ? 'active' : 'suspended')}
      >
        {m.status === 'suspended' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
        {m.status === 'suspended' ? 'Reativar membro' : 'Suspender membro'}
      </button>

      <SectionTitle>Pagamentos</SectionTitle>
      {(payments.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Receipt size={20} />} text="Sem pagamentos." />
      ) : (
        <div className="mb-4 space-y-2">
          {payments.data!.map((p) => (
            <Card key={p.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{mzn(p.amount_mzn)}</p>
                <p className="text-xs text-slate-400">{dateLabel(p.paid_at)} · {p.receipt_no}</p>
              </div>
              <span className="text-xs text-slate-500">até {dateLabel(p.valid_until)}</span>
            </Card>
          ))}
        </div>
      )}

      <SectionTitle>Entradas recentes</SectionTitle>
      {(attendances.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<DoorOpen size={20} />} text="Sem entradas." />
      ) : (
        <div className="space-y-2">
          {attendances.data!.map((a) => (
            <Card key={a.id} className="flex items-center gap-3 py-2.5">
              <CheckCircle2 size={18} className={a.result === 'granted' ? 'text-lime-400' : 'text-rose-400'} />
              <span className="text-sm">{dateTimeLabel(a.checked_in_at)}</span>
            </Card>
          ))}
        </div>
      )}

      {showPay && (
        <Modal title={done ? 'Concluído' : 'Confirmar pagamento'} onClose={() => { if (!busy) { setShowPay(false); setDone(null) } }}>
          {done ? (
            <div className="text-center">
              <CheckCircle2 size={40} className="mx-auto text-lime-400" />
              <p className="mt-3 text-sm text-slate-300">{done}</p>
              <button className="btn-primary mt-5 w-full" onClick={() => { setShowPay(false); setDone(null) }}>
                Concluir
              </button>
            </div>
          ) : plans.isLoading ? (
            <Spinner />
          ) : (
            <PayForm plans={plans.data!} requestedPlanId={m.plan_id} busy={busy} onConfirm={confirm} />
          )}
        </Modal>
      )}

      {showQr && (
        <Modal title="QR do membro" onClose={() => setShowQr(false)}>
          <div className="flex flex-col items-center gap-4">
            <QrImage value={`gymcheck:${m.token}`} size={230} />
            <p className="font-semibold">{m.full_name}</p>
            <button className="btn-primary w-full" onClick={downloadQr}>
              <Download size={18} /> Descarregar QR (para enviar)
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

function PayForm({
  plans,
  requestedPlanId,
  busy,
  onConfirm,
}: {
  plans: Plan[]
  requestedPlanId: string | null
  busy: boolean
  onConfirm: (plan: Plan, days: number) => void
}) {
  const initial = plans.find((p) => p.id === requestedPlanId) ?? plans[0]
  const [selectedId, setSelectedId] = useState(initial?.id ?? '')
  const selected = plans.find((p) => p.id === selectedId) ?? initial
  const [days, setDays] = useState(String(initial?.duration_days ?? 30))

  function pick(p: Plan) {
    setSelectedId(p.id)
    setDays(String(p.duration_days))
  }

  if (!selected) return <p className="text-sm text-slate-400">Cria um plano primeiro.</p>

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">Plano pago pelo membro:</p>
      <div className="space-y-2">
        {plans.map((p) => (
          <button key={p.id} type="button" className="w-full" onClick={() => pick(p)}>
            <div
              className={`flex items-center justify-between rounded-2xl border p-3 text-left transition ${
                p.id === selectedId ? 'border-brand bg-brand/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <div>
                <p className="font-semibold">
                  {p.name}
                  {p.id === requestedPlanId && (
                    <span className="ml-2 rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-semibold text-lime-400">
                      pedido
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">{p.duration_days} dias</p>
              </div>
              <span className="font-bold text-brand-400">{mzn(p.price_mzn)}</span>
            </div>
          </button>
        ))}
      </div>

      <div>
        <label className="label">Duração (dias) — podes ajustar</label>
        <input
          type="number"
          className="input"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
      </div>

      <button
        className="btn-primary w-full"
        disabled={busy}
        onClick={() => onConfirm(selected, Number(days) || selected.duration_days)}
      >
        {busy ? 'A processar…' : `Confirmar ${mzn(selected.price_mzn)}`}
      </button>
    </div>
  )
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-brand-400">
        {icon}
      </div>
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  )
}
