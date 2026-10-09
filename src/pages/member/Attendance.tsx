import { DoorOpen, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useAttendances } from '@/lib/store'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { dateTimeLabel } from '@/lib/format'

export default function MemberAttendance() {
  const { profile } = useAuth()
  const attendances = useAttendances(profile?.id, 80)
  const granted = (attendances.data ?? []).filter((a) => a.result === 'granted')

  return (
    <>
      <PageHeader title="As minhas entradas" subtitle={`${granted.length} registadas`} />
      {attendances.isLoading ? (
        <Spinner />
      ) : granted.length === 0 ? (
        <EmptyState icon={<DoorOpen size={22} />} text="Ainda sem entradas registadas." />
      ) : (
        <div className="space-y-2">
          {granted.map((a) => (
            <Card key={a.id} className="flex items-center gap-3 py-3">
              <CheckCircle2 className="text-lime-400" size={20} />
              <span className="text-sm">{dateTimeLabel(a.checked_in_at)}</span>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
