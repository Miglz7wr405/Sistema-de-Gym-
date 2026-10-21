import { useState } from 'react'
import { Trophy, Plus, Trash2, MapPin, Clock } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { useEvents, useActions } from '@/lib/store'
import { dateTimeLabel } from '@/lib/format'

export default function AdminEvents() {
  const events = useEvents(true)
  const { deleteEvent } = useActions()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <PageHeader
        title="Eventos"
        action={<button className="btn-primary" onClick={() => setAdding(true)}><Plus size={18} /> Novo</button>}
      />
      {events.isLoading ? (
        <Spinner />
      ) : (events.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Trophy size={22} />} text="Sem eventos marcados." />
      ) : (
        <div className="space-y-3">
          {events.data!.map((ev) => (
            <Card key={ev.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-lg font-bold">{ev.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300"><Clock size={14} /> {dateTimeLabel(ev.starts_at)}</p>
                  {ev.location && <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400"><MapPin size={13} /> {ev.location}</p>}
                  {ev.description && <p className="mt-2 text-sm text-slate-400">{ev.description}</p>}
                </div>
                <button className="rounded-xl p-2 text-rose-400 hover:bg-white/5" onClick={() => deleteEvent(ev.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {adding && <AddModal onClose={() => setAdding(false)} />}
    </>
  )
}

function AddModal({ onClose }: { onClose: () => void }) {
  const { addEvent } = useActions()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [location, setLocation] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startsAt) return
    setBusy(true)
    await addEvent({ title, description, starts_at: new Date(startsAt).toISOString(), location })
    setBusy(false)
    onClose()
  }

  return (
    <Modal title="Novo evento" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Nome do evento</label>
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Evento de Fitness" />
        </div>
        <div>
          <label className="label">Data e hora</label>
          <input type="datetime-local" className="input" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </div>
        <div>
          <label className="label">Local</label>
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex.: Olympus Gym" />
        </div>
        <div>
          <label className="label">Descrição (opcional)</label>
          <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'A guardar…' : 'Publicar evento'}
        </button>
      </form>
    </Modal>
  )
}
