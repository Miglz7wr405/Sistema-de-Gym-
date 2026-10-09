import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Receipt } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card, EmptyState, SectionTitle, Spinner } from '@/components/ui'
import { useMembers, usePayments } from '@/lib/store'
import { dateLabel, mzn } from '@/lib/format'
import { membershipStateOf } from '@/lib/types'

type Tab = 'pending' | 'history'

export default function AdminPayments() {
  const [tab, setTab] = useState<Tab>('pending')
  const members = useMembers()
  const payments = usePayments()

  const pending = useMemo(
    () =>
      (members.data ?? []).filter((m) => {
        if (m.status === 'suspended') return false
        if (m.status === 'pending') return true
        const st = membershipStateOf(m.valid_until)
        return st === 'expired' || st === 'none'
      }),
    [members.data],
  )

  const byId = useMemo(() => {
    const map = new Map<string, { name: string; photo: string | null }>()
    for (const m of members.data ?? []) map.set(m.id, { name: m.full_name, photo: m.photo })
    return map
  }, [members.data])

  return (
    <>
      <PageHeader title="Pagamentos" />
      <div className="mb-4 flex gap-2">
        <button className={tab === 'pending' ? 'btn-primary flex-1' : 'btn-ghost flex-1'} onClick={() => setTab('pending')}>
          A tratar
        </button>
        <button className={tab === 'history' ? 'btn-primary flex-1' : 'btn-ghost flex-1'} onClick={() => setTab('history')}>
          Histórico
        </button>
      </div>

      {tab === 'pending' ? (
        <>
          <SectionTitle>Pendentes e mensalidades expiradas</SectionTitle>
          {members.isLoading ? (
            <Spinner />
          ) : pending.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={22} />} text="Tudo em dia. Sem pagamentos a tratar." />
          ) : (
            <div className="space-y-2">
              {pending.map((m) => (
                <Link key={m.id} to={`/membros/${m.id}`}>
                  <Card className="flex items-center gap-3 py-3">
                    <Avatar name={m.full_name} url={m.photo} size={44} />
                    <div className="flex-1">
                      <p className="font-semibold">{m.full_name}</p>
                      <p className="text-xs text-amber-300">
                        {m.status === 'pending' ? 'Conta por ativar' : m.valid_until ? `Expirou em ${dateLabel(m.valid_until)}` : 'Sem plano'}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-brand-400">Tratar ›</span>
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
            <EmptyState icon={<Receipt size={22} />} text="Sem pagamentos registados." />
          ) : (
            <div className="space-y-2">
              {payments.data!.map((p) => {
                const info = byId.get(p.member_id)
                return (
                  <Card key={p.id} className="flex items-center gap-3 py-3">
                    <Avatar name={info?.name ?? '?'} url={info?.photo} size={44} />
                    <div className="flex-1">
                      <p className="font-semibold">{info?.name ?? 'Membro'}</p>
                      <p className="text-xs text-slate-400">{dateLabel(p.paid_at)} · {p.plan_name} · {p.receipt_no}</p>
                    </div>
                    <span className="font-bold text-lime-400">{mzn(p.amount_mzn)}</span>
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
