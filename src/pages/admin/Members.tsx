import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card, EmptyState, MemberMeta, Spinner, StatusPill } from '@/components/ui'
import { useMembers } from '@/lib/store'

type Tab = 'all' | 'pending' | 'active'

export default function AdminMembers() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const members = useMembers(search)

  const list = useMemo(() => {
    const all = members.data ?? []
    if (tab === 'pending') return all.filter((m) => m.status === 'pending')
    if (tab === 'active') return all.filter((m) => m.status === 'active')
    return all
  }, [members.data, tab])

  const pendingCount = (members.data ?? []).filter((m) => m.status === 'pending').length

  return (
    <>
      <PageHeader title="Membros" subtitle={`${members.data?.length ?? 0} no total`} />

      <div className="mb-3 flex gap-2">
        <button className={tab === 'all' ? 'btn-primary flex-1' : 'btn-ghost flex-1'} onClick={() => setTab('all')}>
          Todos
        </button>
        <button className={tab === 'pending' ? 'btn-primary flex-1' : 'btn-ghost flex-1'} onClick={() => setTab('pending')}>
          Pendentes{pendingCount > 0 ? ` (${pendingCount})` : ''}
        </button>
        <button className={tab === 'active' ? 'btn-primary flex-1' : 'btn-ghost flex-1'} onClick={() => setTab('active')}>
          Ativos
        </button>
      </div>

      <div className="relative mb-3">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-10"
          placeholder="Pesquisar por nome ou telefone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {members.isLoading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          text={tab === 'pending' ? 'Sem membros pendentes.' : 'Ainda sem membros. Eles registam-se na app.'}
        />
      ) : (
        <div className="space-y-2">
          {list.map((m) => (
            <Link key={m.id} to={`/membros/${m.id}`}>
              <Card className="flex items-center gap-3 py-3">
                <Avatar name={m.full_name} url={m.photo} size={46} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{m.full_name}</p>
                  <MemberMeta p={m} />
                </div>
                <StatusPill profile={m} />
                <ChevronRight size={18} className="text-slate-600" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
