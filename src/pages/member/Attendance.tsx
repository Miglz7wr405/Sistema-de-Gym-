import { useAuth } from '@/lib/auth'
import { useAttendances } from '@/lib/queries'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { dateTimeLabel } from '@/lib/format'

export default function MemberAttendance() {
  const { profile } = useAuth()
  const attendances = useAttendances(profile?.id, 50)

  const granted = (attendances.data ?? []).filter((a) => a.result === 'granted')

  return (
    <>
      <PageHeader title="Presenças" subtitle={`${granted.length} registadas`} />

      {attendances.isLoading ? (
        <Spinner />
      ) : granted.length === 0 ? (
        <EmptyState icon="🚪" text="Ainda sem presenças registadas." />
      ) : (
        <div className="space-y-2">
          {granted.map((a) => (
            <Card key={a.id} className="flex items-center gap-3 py-3">
              <span className="text-lg">🟢</span>
              <span className="text-sm">{dateTimeLabel(a.checked_in_at)}</span>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
