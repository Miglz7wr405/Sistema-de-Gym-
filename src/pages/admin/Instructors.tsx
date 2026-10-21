import { useState } from 'react'
import { Contact, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card, EmptyState, Spinner } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { useInstructors, useActions } from '@/lib/store'

export default function AdminInstructors() {
  const instructors = useInstructors()
  const { deleteInstructor } = useActions()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <PageHeader
        title="Instrutores"
        action={<button className="btn-primary" onClick={() => setAdding(true)}><Plus size={18} /> Novo</button>}
      />
      {instructors.isLoading ? (
        <Spinner />
      ) : (instructors.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Contact size={22} />} text="Sem instrutores. Adiciona o primeiro." />
      ) : (
        <div className="space-y-2">
          {instructors.data!.map((i) => (
            <Card key={i.id} className="flex items-center gap-3 py-3">
              <Avatar name={i.name} url={i.photo} size={44} />
              <div className="flex-1">
                <p className="font-semibold">{i.name}</p>
                <p className="text-xs text-slate-400">{[i.specialty, i.phone].filter(Boolean).join(' · ') || '—'}</p>
              </div>
              <button className="rounded-xl p-2 text-rose-400 hover:bg-white/5" onClick={() => deleteInstructor(i.id)}>
                <Trash2 size={18} />
              </button>
            </Card>
          ))}
        </div>
      )}
      {adding && <AddModal onClose={() => setAdding(false)} />}
    </>
  )
}

function AddModal({ onClose }: { onClose: () => void }) {
  const { addInstructor } = useActions()
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    await addInstructor({ name, specialty, phone })
    setBusy(false)
    onClose()
  }

  return (
    <Modal title="Novo instrutor" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Nome</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Especialidade</label>
          <input className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ex.: Força, Cardio" />
        </div>
        <div>
          <label className="label">Telefone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'A guardar…' : 'Guardar'}
        </button>
      </form>
    </Modal>
  )
}
