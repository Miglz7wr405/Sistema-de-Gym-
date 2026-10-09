import { useState } from 'react'
import { Tag, Plus } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { usePlans, useActions } from '@/lib/store'
import { mzn } from '@/lib/format'

export default function AdminPlans() {
  const plans = usePlans(false)
  const { togglePlan } = useActions()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <PageHeader
        title="Planos"
        action={
          <button className="btn-primary" onClick={() => setAdding(true)}>
            <Plus size={18} /> Novo
          </button>
        }
      />

      {plans.isLoading ? (
        <Spinner />
      ) : (plans.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Tag size={22} />} text="Sem planos. Cria o primeiro." />
      ) : (
        <div className="space-y-2">
          {plans.data!.map((p) => (
            <Card key={p.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-slate-400">{mzn(p.price_mzn)} · {p.duration_days} dias</p>
              </div>
              <button
                className={`badge ${p.active ? 'bg-lime/15 text-lime-400' : 'bg-white/5 text-slate-500'}`}
                onClick={() => togglePlan(p.id, p.active)}
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
    await addPlan({ name, price_mzn: Number(price) || 0, duration_days: Number(days) || 30 })
    setBusy(false)
    onClose()
  }

  return (
    <Modal title="Novo plano" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Nome</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label">Preço (MT)</label>
            <input type="number" className="input" required value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="label">Duração (dias)</label>
            <input type="number" className="input" required value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'A guardar…' : 'Guardar plano'}
        </button>
      </form>
    </Modal>
  )
}
