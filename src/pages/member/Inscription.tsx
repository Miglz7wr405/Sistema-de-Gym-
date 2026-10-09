import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Info } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { usePlans, useActions } from '@/lib/store'
import { PageHeader } from '@/components/AppShell'
import { Card, Spinner } from '@/components/ui'
import { mzn } from '@/lib/format'

export default function MemberInscription() {
  const { profile, refreshProfile } = useAuth()
  const plans = usePlans(true)
  const { requestPlan } = useActions()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!profile || !selectedId) return
    setBusy(true)
    await requestPlan(profile.id, selectedId)
    await refreshProfile()
    setBusy(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-2 text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-lime/15 text-lime-400">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-bold">Inscrição enviada!</h2>
        <p className="mt-2 max-w-xs text-sm text-slate-400">
          Entrega o valor ao ginásio. Assim que o pagamento for confirmado, a tua conta fica
          ativa e o teu QR Code aparece.
        </p>
        <button className="btn-primary mt-6 w-full max-w-xs" onClick={() => navigate('/')}>
          Voltar ao início
        </button>
      </div>
    )
  }

  return (
    <>
      <PageHeader title="Fazer inscrição" subtitle="Escolhe o teu plano" />

      <Card className="mb-4 flex items-start gap-3 border-brand/20 bg-brand/10 py-3">
        <Info size={18} className="mt-0.5 shrink-0 text-brand-400" />
        <p className="text-xs text-slate-300">
          Escolhe um plano e confirma. A tua conta fica <b>pendente</b> até entregares o
          pagamento e o ginásio confirmar.
        </p>
      </Card>

      {plans.isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-2">
          {plans.data!.map((p) => (
            <button key={p.id} className="w-full" onClick={() => setSelectedId(p.id)}>
              <div
                className={`flex items-center justify-between rounded-3xl border p-4 text-left transition ${
                  selectedId === p.id ? 'border-brand bg-brand/10 shadow-glow' : 'border-white/10 bg-ink-850/80'
                }`}
              >
                <div>
                  <p className="text-lg font-bold">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.duration_days} dias de acesso</p>
                </div>
                <span className="text-lg font-bold text-brand-400">{mzn(p.price_mzn)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <button className="btn-primary mt-5 w-full" disabled={!selectedId || busy} onClick={submit}>
        {busy ? 'A enviar…' : 'Confirmar inscrição'}
      </button>
    </>
  )
}
