import { CalendarDays, User, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useClasses, useMyEnrollments, useActions } from '@/lib/store'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { classWhen } from '@/lib/format'
import { membershipStateOf } from '@/lib/types'

export default function MemberClasses() {
  const { profile } = useAuth()
  const classes = useClasses(true)
  const enrollments = useMyEnrollments(profile?.id)
  const actions = useActions()

  const state = membershipStateOf(profile?.valid_until ?? null)
  const canJoin = profile?.status === 'active' && (state === 'active' || state === 'expiring')

  const myMap = new Map((enrollments.data ?? []).map((e) => [e.class_id, e.status]))

  return (
    <>
      <PageHeader title="Aulas" subtitle="Inscreve-te nas próximas aulas" />

      {!canJoin && (
        <Card className="mb-4 border-amber-500/25 bg-amber-500/10 py-3 text-sm text-amber-200">
          Ativa a tua mensalidade para te inscreveres nas aulas.
        </Card>
      )}

      {classes.isLoading ? (
        <Spinner />
      ) : (classes.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<CalendarDays size={22} />} text="Sem aulas marcadas de momento." />
      ) : (
        <div className="space-y-3">
          {classes.data!.map((c) => {
            const mine = myMap.get(c.id)
            const full = c.enrolled_count >= c.capacity
            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-bold">{c.title}</p>
                    <p className="mt-0.5 text-sm text-slate-300">{classWhen(c.starts_at)}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User size={13} /> {c.instructor || '—'}</span>
                      <span className="flex items-center gap-1">
                        <Users size={13} /> {Math.min(c.enrolled_count, c.capacity)}/{c.capacity} vagas
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  {mine ? (
                    <button
                      className="btn-ghost w-full text-rose-400"
                      onClick={() => actions.leaveClass(c.id, profile!.id)}
                    >
                      {mine === 'waitlist' ? 'Sair da lista de espera' : 'Cancelar inscrição'}
                    </button>
                  ) : (
                    <button
                      className={full ? 'btn-ghost w-full' : 'btn-primary w-full'}
                      disabled={!canJoin}
                      onClick={() => actions.joinClass(c, profile!.id)}
                    >
                      {full ? 'Entrar na lista de espera' : 'Participar'}
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
