import { useState } from 'react'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { usePlans, useActions } from '@/lib/store'
import { mzn } from '@/lib/format'

export default function Plans() {
  const plans = usePlans(false)
  const { togglePlan } = useActions()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <PageHeader
        title="Planos"
        action={
          <button className="btn-primary" onClick={() => setAdding(true)}>
            + Novo
          </button>
        }
      />

      {plans.isLoading ? (
        <Spinner />
      ) : (plans.data?.length ?? 0) === 0 ? (
        <EmptyState icon="🏷️" text="Sem planos. Cria o primeiro." />
      ) : (
        <div className="space-y-2">
          {plans.data!.map((p) => (
            <Card key={p.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-slate-500">
                  {mzn(p.price_mzn)} · {p.duration_days} dias
                </p>
              </div>
              <button
                className={`badge ${p.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                onClick={() => togglePlan(p.id)}
              >
                {p.active ? 'Ativo' : 'Inativo'}
              </button>
            </Card>
          ))}
        </div>
      )}

      {adding && <AddPlanModal onClose={() => setAdding(false)} />}
    </>
  )
}

function AddPlanModal({ onClose }: { onClose: () => void }) {
  const { addPlan } = useActions()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [days, setDays] = useState('30')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    await addPlan({
      name,
      price_mzn: Number(price) || 0,
      duration_days: Number(days) || 30,
    })
    setBusy(false)
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-lg font-bold">Novo plano</h2>
        <div>
          <label className="label">Nome</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label">Preço (MT)</label>
            <input
              type="number"
              className="input"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="label">Duração (dias)</label>
            <input
              type="number"
              className="input"
              required
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={busy}>
            {busy ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
