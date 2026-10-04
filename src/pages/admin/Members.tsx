import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card, EmptyState, Spinner } from '@/components/ui'
import { useMembers } from '@/lib/queries'
import { supabase } from '@/lib/supabase'

export default function AdminMembers() {
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
        placeholder="Pesquisar por nome ou email…"
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
            <Link key={m.id} to={`/admin/membros/${m.id}`}>
              <Card className="flex items-center gap-3 py-3">
                <Avatar name={m.full_name} url={m.photo_url} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{m.full_name}</p>
                  <p className="truncate text-xs text-slate-500">{m.email}</p>
                </div>
                {m.status !== 'active' && (
                  <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800">
                    {m.status === 'suspended' ? 'Suspenso' : 'Inativo'}
                  </span>
                )}
                <span className="text-slate-300">›</span>
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
  const qc = useQueryClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ email: string; temp_password: string } | null>(
    null,
  )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { data, error } = await supabase.functions.invoke('admin-create-member', {
      body: { full_name: fullName, email, phone },
    })
    setBusy(false)
    if (error || data?.member_id == null) {
      setError(data?.message ?? 'Não foi possível criar o membro.')
      return
    }
    setCreated({ email: data.email, temp_password: data.temp_password })
    qc.invalidateQueries({ queryKey: ['members'] })
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {created ? (
          <div className="text-center">
            <div className="mb-2 text-3xl">✅</div>
            <h2 className="text-lg font-bold">Membro criado</h2>
            <p className="mt-3 text-sm text-slate-500">
              Entrega estes dados de acesso ao membro:
            </p>
            <div className="mt-3 rounded-xl bg-slate-100 p-3 text-left text-sm dark:bg-slate-800">
              <p>
                <b>Email:</b> {created.email}
              </p>
              <p>
                <b>Palavra-passe:</b> {created.temp_password}
              </p>
            </div>
            <button className="btn-primary mt-4 w-full" onClick={onClose}>
              Concluir
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h2 className="text-lg font-bold">Adicionar membro</h2>
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
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Telefone (opcional)</label>
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={busy}>
                {busy ? 'A criar…' : 'Criar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
