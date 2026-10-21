import { Trophy, Clock, MapPin } from 'lucide-react'
import { useEvents } from '@/lib/store'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { dateTimeLabel } from '@/lib/format'

export default function MemberEvents() {
  const events = useEvents(true)
  return (
    <>
      <PageHeader title="Eventos" subtitle="Próximos eventos do ginásio" />
      {events.isLoading ? (
        <Spinner />
      ) : (events.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Trophy size={22} />} text="Sem eventos marcados de momento." />
      ) : (
        <div className="space-y-3">
          {events.data!.map((ev) => (
            <Card key={ev.id}>
              <p className="text-lg font-bold">{ev.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300"><Clock size={14} /> {dateTimeLabel(ev.starts_at)}</p>
              {ev.location && <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400"><MapPin size={13} /> {ev.location}</p>}
              {ev.description && <p className="mt-2 text-sm text-slate-400">{ev.description}</p>}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
