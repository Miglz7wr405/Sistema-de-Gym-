import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { usePlans } from '@/lib/queries'
import { supabase } from '@/lib/supabase'
import { mzn } from '@/lib/format'

export default function AdminPlans() {
  const qc = useQueryClient()
  const plans = usePlans(false)
  const [adding, setAdding] = useState(false)

  async function toggle(id: string, active: boolean) {
    await supabase.from('plans').update({ active: !active }).eq('id', id)
    qc.invalidateQueries({ queryKey: ['plans'] })
  }

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
                onClick={() => toggle(p.id, p.active)}
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
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [days, setDays] = useState('30')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    await supabase.from('plans').insert({
      name,
      price_mzn: Number(price) || 0,
      duration_days: Number(days) || 30,
      active: true,
    })
    qc.invalidateQueries({ queryKey: ['plans'] })
    setBusy(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
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
    </div>
  )
}
