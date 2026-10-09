import { useState } from 'react'
import { CalendarDays, Plus, User, Users, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { useClasses, useActions } from '@/lib/store'
import { classWhen } from '@/lib/format'

export default function AdminClasses() {
  const classes = useClasses(true)
  const { cancelClass } = useActions()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <PageHeader
        title="Aulas"
        action={
          <button className="btn-primary" onClick={() => setAdding(true)}>
            <Plus size={18} /> Nova
          </button>
        }
      />

      {classes.isLoading ? (
        <Spinner />
      ) : (classes.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<CalendarDays size={22} />} text="Sem aulas marcadas. Cria a primeira." />
      ) : (
        <div className="space-y-3">
          {classes.data!.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-bold">{c.title}</p>
                  <p className="mt-0.5 text-sm text-slate-300">{classWhen(c.starts_at)}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><User size={13} /> {c.instructor || '—'}</span>
                    <span className="flex items-center gap-1">
                      <Users size={13} /> {Math.min(c.enrolled_count, c.capacity)}/{c.capacity} vagas
                    </span>
                    {c.enrolled_count > c.capacity && (
                      <span className="text-amber-300">+{c.enrolled_count - c.capacity} em espera</span>
                    )}
                  </div>
                </div>
                <button
                  className="rounded-xl p-2 text-rose-400 hover:bg-white/5"
                  onClick={() => cancelClass(c.id)}
                  title="Cancelar aula"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {adding && <AddClassModal onClose={() => setAdding(false)} />}
    </>
  )
}

function AddClassModal({ onClose }: { onClose: () => void }) {
  const { createClass } = useActions()
  const [title, setTitle] = useState('')
  const [instructor, setInstructor] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [capacity, setCapacity] = useState('15')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startsAt) return
    setBusy(true)
    setError(null)
    try {
      await createClass({
        title: title.trim(),
        instructor: instructor.trim(),
        starts_at: new Date(startsAt).toISOString(),
        capacity: Number(capacity) || 15,
      })
      onClose()
    } catch {
      setError('Não foi possível criar a aula.')
      setBusy(false)
    }
  }

  return (
    <Modal title="Nova aula" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Nome da aula</label>
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Fitness" />
        </div>
        <div>
          <label className="label">Instrutor</label>
          <input className="input" value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="Ex.: Carlos" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label">Data e hora</label>
            <input type="datetime-local" className="input" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>
          <div className="w-28">
            <label className="label">Vagas</label>
            <input type="number" className="input" required value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'A criar…' : 'Criar aula'}
        </button>
      </form>
    </Modal>
  )
}
