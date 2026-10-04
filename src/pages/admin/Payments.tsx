import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card, EmptyState, SectionTitle, Spinner } from '@/components/ui'
import { useMembers, usePayments } from '@/lib/store'
import { dateLabel, mzn } from '@/lib/format'
import { membershipStateOf } from '@/lib/types'

type Tab = 'pending' | 'history'

export default function Payments() {
  const [tab, setTab] = useState<Tab>('pending')
  const members = useMembers()
  const payments = usePayments()

  const pending = useMemo(
    () =>
      (members.data ?? []).filter((m) => {
        const st = membershipStateOf(m.valid_until)
        return st === 'expired' || st === 'none'
      }),
    [members.data],
  )

  const nameById = useMemo(() => {
    const map = new Map<string, { name: string; photo: string | null }>()
    for (const m of members.data ?? []) map.set(m.id, { name: m.full_name, photo: m.photo })
    return map
  }, [members.data])

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
          {members.isLoading ? (
            <Spinner />
          ) : pending.length === 0 ? (
            <EmptyState icon="✅" text="Sem pagamentos pendentes." />
          ) : (
            <div className="space-y-2">
              {pending.map((m) => (
                <Link key={m.id} to={`/membros/${m.id}`}>
                  <Card className="flex items-center gap-3 py-3">
                    <Avatar name={m.full_name} url={m.photo} size={40} />
                    <div className="flex-1">
                      <p className="font-semibold">{m.full_name}</p>
                      <p className="text-xs text-rose-500">
                        {m.valid_until ? `Expirou em ${dateLabel(m.valid_until)}` : 'Sem plano'}
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
          {payments.isLoading ? (
            <Spinner />
          ) : (payments.data?.length ?? 0) === 0 ? (
            <EmptyState icon="🧾" text="Sem pagamentos registados." />
          ) : (
            <div className="space-y-2">
              {payments.data!.map((p) => {
                const info = nameById.get(p.member_id)
                return (
                  <Card key={p.id} className="flex items-center gap-3 py-3">
                    <Avatar name={info?.name ?? '?'} url={info?.photo} size={40} />
                    <div className="flex-1">
                      <p className="font-semibold">{info?.name ?? 'Membro removido'}</p>
                      <p className="text-xs text-slate-500">
                        {dateLabel(p.paid_at)} · {p.plan_name} · {p.receipt_no}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-600">{mzn(p.amount_mzn)}</span>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </>
  )
}
