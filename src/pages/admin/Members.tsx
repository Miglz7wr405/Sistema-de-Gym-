import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card, EmptyState, MembershipBadge, Spinner } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { useMembers, useActions } from '@/lib/store'
import { fileToResizedDataUrl } from '@/lib/image'
import { membershipStateOf } from '@/lib/types'

export default function Members() {
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const members = useMembers(search)

  return (
    <>
      <PageHeader
        title="Membros"
        action={
          <button className="btn-primary" onClick={() => setAdding(true)}>
            + Adicionar
          </button>
        }
      />

      <input
        className="input mb-3"
        placeholder="Pesquisar por nome ou telefone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {members.isLoading ? (
        <Spinner />
      ) : (members.data?.length ?? 0) === 0 ? (
        <EmptyState icon="👥" text="Sem membros. Adiciona o primeiro." />
      ) : (
        <div className="space-y-2">
          {members.data!.map((m) => (
            <Link key={m.id} to={`/membros/${m.id}`}>
              <Card className="flex items-center gap-3 py-3">
                <Avatar name={m.full_name} url={m.photo} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{m.full_name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {m.phone || 'Sem telefone'}
                  </p>
                </div>
                {m.status === 'suspended' ? (
                  <span className="badge bg-slate-200 text-slate-600 dark:bg-slate-700">
                    Suspenso
                  </span>
                ) : (
                  <MembershipBadge state={membershipStateOf(m.valid_until)} />
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      {adding && <AddMemberModal onClose={() => setAdding(false)} />}
    </>
  )
}

function AddMemberModal({ onClose }: { onClose: () => void }) {
  const { addMember } = useActions()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPhoto(await fileToResizedDataUrl(file))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    setBusy(true)
    await addMember({ full_name: fullName, phone, photo })
    setBusy(false)
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-lg font-bold">Adicionar membro</h2>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative"
          >
            <Avatar name={fullName || '?'} url={photo} size={84} />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-sm text-white">
              📷
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={onPickPhoto}
          />
          <span className="text-xs text-slate-400">Toca para adicionar foto</span>
        </div>

        <div>
          <label className="label">Nome completo</label>
          <input
            className="input"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Telefone (opcional)</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={busy}>
            {busy ? 'A criar…' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
