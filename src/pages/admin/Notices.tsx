import { useState } from 'react'
import { Bell, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { useNotices, useActions } from '@/lib/store'
import { dateTimeLabel } from '@/lib/format'

export default function AdminNotices() {
  const notices = useNotices()
  const { deleteNotice } = useActions()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <PageHeader
        title="Avisos"
        subtitle="Mensagens para todos os membros"
        action={<button className="btn-primary" onClick={() => setAdding(true)}><Plus size={18} /> Novo</button>}
      />
      {notices.isLoading ? (
        <Spinner />
      ) : (notices.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Bell size={22} />} text="Sem avisos publicados." />
      ) : (
        <div className="space-y-2">
          {notices.data!.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{n.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{n.body}</p>
                  <p className="mt-2 text-xs text-slate-500">{dateTimeLabel(n.created_at)}</p>
                </div>
                <button className="rounded-xl p-2 text-rose-400 hover:bg-white/5" onClick={() => deleteNotice(n.id)}>
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
  const { addNotice } = useActions()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    await addNotice({ title, body })
    setBusy(false)
    onClose()
  }

  return (
    <Modal title="Novo aviso" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Título</label>
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Encerramento no feriado" />
        </div>
        <div>
          <label className="label">Mensagem</label>
          <textarea className="input" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'A enviar…' : 'Enviar aviso'}
        </button>
      </form>
    </Modal>
  )
}
