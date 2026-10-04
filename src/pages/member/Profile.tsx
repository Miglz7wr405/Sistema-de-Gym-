import { useAuth } from '@/lib/auth'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card } from '@/components/ui'

export default function MemberProfile() {
  const { profile, signOut } = useAuth()

  return (
    <>
      <PageHeader title="Perfil" />

      <Card className="mb-4 flex items-center gap-4">
        <Avatar name={profile?.full_name ?? ''} url={profile?.photo_url} size={64} />
        <div>
          <p className="text-lg font-bold">{profile?.full_name}</p>
          <p className="text-sm text-slate-500">{profile?.email}</p>
        </div>
      </Card>

      <Card className="mb-4 space-y-3">
        <Row label="Telefone" value={profile?.phone || '—'} />
        <Row label="Conta" value="Membro" />
      </Card>

      <button onClick={signOut} className="btn-ghost w-full text-rose-600">
        Terminar sessão
      </button>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
