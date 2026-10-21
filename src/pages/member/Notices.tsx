import { Bell } from 'lucide-react'
import { useNotices } from '@/lib/store'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { dateTimeLabel } from '@/lib/format'

export default function MemberNotices() {
  const notices = useNotices()
  return (
    <>
      <PageHeader title="Avisos" subtitle="Comunicações do ginásio" />
      {notices.isLoading ? (
        <Spinner />
      ) : (notices.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Bell size={22} />} text="Sem avisos de momento." />
      ) : (
        <div className="space-y-2">
          {notices.data!.map((n) => (
            <Card key={n.id}>
              <p className="font-semibold">{n.title}</p>
              {n.body && <p className="mt-1 text-sm text-slate-300">{n.body}</p>}
              <p className="mt-2 text-xs text-slate-500">{dateTimeLabel(n.created_at)}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
