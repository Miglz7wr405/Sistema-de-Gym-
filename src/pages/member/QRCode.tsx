import { useAuth } from '@/lib/auth'
import { useMyToken, useMyMembership } from '@/lib/queries'
import { PageHeader } from '@/components/AppShell'
import { Card, MembershipBadge, Spinner, EmptyState } from '@/components/ui'
import { QrImage } from '@/components/QrImage'
import { membershipStateOf } from '@/lib/types'

export default function MemberQR() {
  const { profile } = useAuth()
  const token = useMyToken(profile?.id)
  const membership = useMyMembership(profile?.id)
  const state = membershipStateOf(membership.data?.valid_until ?? null)

  return (
    <>
      <PageHeader title="O meu QR Code" subtitle="Apresenta à entrada do ginásio" />

      {token.isLoading ? (
        <Spinner />
      ) : !token.data ? (
        <EmptyState icon="📷" text="QR ainda não disponível. Fala com a receção." />
      ) : (
        <Card className="flex flex-col items-center gap-4 py-8">
          <QrImage value={`gymcheck:${token.data}`} size={240} />
          <div className="text-center">
            <p className="text-lg font-bold">{profile?.full_name}</p>
            <div className="mt-1 flex justify-center">
              <MembershipBadge state={state} />
            </div>
          </div>
          <p className="max-w-xs text-center text-xs text-slate-400">
            Este código é pessoal e identifica-te de forma segura. O teu nome não está
            dentro do código — só o sistema do ginásio o reconhece.
          </p>
        </Card>
      )}
    </>
  )
}
