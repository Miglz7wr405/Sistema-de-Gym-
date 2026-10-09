import { useRef, useState } from 'react'
import { Camera, LogOut, Save } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useActions } from '@/lib/store'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card } from '@/components/ui'
import { fileToResizedDataUrl } from '@/lib/image'
import { ageFrom } from '@/lib/types'

export default function MemberProfile() {
  const { profile, signOut, refreshProfile } = useAuth()
  const { updateOwnProfile } = useActions()
  const fileRef = useRef<HTMLInputElement>(null)
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  if (!profile) return null

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    const photo = await fileToResizedDataUrl(file, 400)
    await updateOwnProfile(profile.id, { photo })
    await refreshProfile()
  }

  async function save() {
    if (!profile) return
    setSaving(true)
    await updateOwnProfile(profile.id, { phone })
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const age = ageFrom(profile.birth_date)

  return (
    <>
      <PageHeader title="Perfil" />

      <Card className="mb-4 flex items-center gap-4">
        <button onClick={() => fileRef.current?.click()} className="relative">
          <Avatar name={profile.full_name} url={profile.photo} size={68} />
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
            <Camera size={14} />
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{profile.full_name}</p>
          <p className="truncate text-sm text-slate-400">{profile.email}</p>
        </div>
      </Card>

      <Card className="mb-4 space-y-4">
        <div>
          <label className="label">Telefone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex-1">
            <span className="label">Idade</span>
            <p className="font-medium">{age != null ? `${age} anos` : '—'}</p>
          </div>
          <div className="flex-1">
            <span className="label">Género</span>
            <p className="font-medium">{profile.gender || '—'}</p>
          </div>
        </div>
        <button className="btn-primary w-full" onClick={save} disabled={saving}>
          <Save size={18} /> {saving ? 'A guardar…' : saved ? 'Guardado ✓' : 'Guardar'}
        </button>
      </Card>

      <button onClick={signOut} className="btn-ghost w-full text-rose-400">
        <LogOut size={18} /> Terminar sessão
      </button>
    </>
  )
}
