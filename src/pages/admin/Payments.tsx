import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card, EmptyState, SectionTitle, Spinner } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { dateLabel, mzn } from '@/lib/format'
import type { Profile } from '@/lib/types'

type Tab = 'pending' | 'history'

interface PendingRow {
  member: Profile
  valid_until: string | null
}

function usePending() {
  return useQuery({
    queryKey: ['payments-pending'],
    queryFn: async (): Promise<PendingRow[]> => {
      const today = new Date().toISOString().slice(0, 10)
      const { data } = await supabase
        .from('memberships')
        .select('valid_until, profiles!inner(*)')
        .eq('profiles.role', 'member')
      const rows = (data ?? []) as unknown as Array<{
        valid_until: string | null
        profiles: Profile
      }>
      return rows
        .filter((r) => !r.valid_until || r.valid_until < today)
        .map((r) => ({ member: r.profiles, valid_until: r.valid_until }))
        .sort((a, b) => a.member.full_name.localeCompare(b.member.full_name))
    },
  })
}

function useRecentPayments() {
  return useQuery({
    queryKey: ['payments-recent'],
    queryFn: async () => {
      const { data } = await supabase
        .from('payments')
        .select('id, amount_mzn, paid_at, receipt_no, member:profiles!payments_member_id_fkey(full_name, photo_url)')
        .order('paid_at', { ascending: false })
        .limit(30)
      return (data ?? []) as unknown as Array<{
        id: string
        amount_mzn: number
        paid_at: string
        receipt_no: string
        member: { full_name: string; photo_url: string | null } | null
      }>
    },
  })
}

export default function AdminPayments() {
  const [tab, setTab] = useState<Tab>('pending')
  const pending = usePending()
  const recent = useRecentPayments()

  return (
    <>
      <PageHeader title="Pagamentos" />

      <div className="mb-4 flex gap-2">
        <button
          className={tab === 'pending' ? 'btn-primary flex-1' : 'btn-ghost flex-1'}
          onClick={() => setTab('pending')}
        >
          Pendentes
        </button>
        <button
          className={tab === 'history' ? 'btn-primary flex-1' : 'btn-ghost flex-1'}
          onClick={() => setTab('history')}
        >
          Histórico
        </button>
      </div>

      {tab === 'pending' ? (
        <>
          <SectionTitle>Mensalidades expiradas / sem plano</SectionTitle>
          {pending.isLoading ? (
            <Spinner />
          ) : (pending.data?.length ?? 0) === 0 ? (
            <EmptyState icon="✅" text="Sem pagamentos pendentes." />
          ) : (
            <div className="space-y-2">
              {pending.data!.map((r) => (
                <Link key={r.member.id} to={`/admin/membros/${r.member.id}`}>
                  <Card className="flex items-center gap-3 py-3">
                    <Avatar name={r.member.full_name} url={r.member.photo_url} size={40} />
                    <div className="flex-1">
                      <p className="font-semibold">{r.member.full_name}</p>
                      <p className="text-xs text-rose-500">
                        {r.valid_until ? `Expirou em ${dateLabel(r.valid_until)}` : 'Sem plano'}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-brand">Confirmar ›</span>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <SectionTitle>Pagamentos recentes</SectionTitle>
          {recent.isLoading ? (
            <Spinner />
          ) : (recent.data?.length ?? 0) === 0 ? (
            <EmptyState icon="🧾" text="Sem pagamentos registados." />
          ) : (
            <div className="space-y-2">
              {recent.data!.map((p) => (
                <Card key={p.id} className="flex items-center gap-3 py-3">
                  <Avatar name={p.member?.full_name ?? '?'} url={p.member?.photo_url} size={40} />
                  <div className="flex-1">
                    <p className="font-semibold">{p.member?.full_name ?? '—'}</p>
                    <p className="text-xs text-slate-500">
                      {dateLabel(p.paid_at)} · {p.receipt_no}
                    </p>
                  </div>
                  <span className="font-bold text-emerald-600">{mzn(p.amount_mzn)}</span>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
