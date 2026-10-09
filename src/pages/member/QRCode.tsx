import { Lock, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { PageHeader } from '@/components/AppShell'
import { Card, StatusPill } from '@/components/ui'
import { QrImage } from '@/components/QrImage'
import { membershipStateOf } from '@/lib/types'

export default function MemberQR() {
  const { profile } = useAuth()
  if (!profile) return null

  const state = membershipStateOf(profile.valid_until)
  const active = profile.status === 'active' && (state === 'active' || state === 'expiring')

  const reason =
    profile.status === 'pending'
      ? 'A tua conta aguarda ativação pelo ginásio.'
      : profile.status === 'suspended'
        ? 'A tua conta está suspensa. Fala com a receção.'
        : 'A tua mensalidade expirou. Renova para reativar o QR.'

  return (
    <>
      <PageHeader title="O meu QR Code" subtitle="Apresenta à entrada do ginásio" />

      <Card className="flex flex-col items-center gap-5 py-8">
        {active ? (
          <>
            <QrImage value={`gymcheck:${profile.token}`} size={250} />
            <div className="text-center">
              <p className="text-lg font-bold">{profile.full_name}</p>
              <div className="mt-1.5 flex justify-center">
                <StatusPill profile={profile} />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2.5 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-lime-400" />
              O teu nome não está dentro do código — só o ginásio o reconhece.
            </div>
          </>
        ) : (
          <>
            <div className="flex h-[250px] w-[250px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-500">
              <Lock size={46} />
              <span className="mt-3 text-sm">QR bloqueado</span>
            </div>
            <div className="text-center">
              <StatusPill profile={profile} />
              <p className="mt-3 max-w-xs text-sm text-slate-400">{reason}</p>
            </div>
          </>
        )}
      </Card>
    </>
  )
}
