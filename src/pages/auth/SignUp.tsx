import { useRef, useState } from 'react'
import { ArrowLeft, Camera, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fileToResizedDataUrl } from '@/lib/image'
import { Avatar } from '@/components/ui'
import { Logo } from '@/components/Logo'

export default function SignUp({ onBack }: { onBack: () => void }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPhoto(await fileToResizedDataUrl(file, 400))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    setBusy(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          birth_date: birthDate || null,
          gender: gender || null,
          photo: photo || null,
        },
      },
    })
    setBusy(false)
    if (error) {
      setError(error.message.includes('already') ? 'Este email já tem conta.' : error.message)
      return
    }
    if (!data.session) {
      // Confirmação por email ativada no projeto
      setDone('Conta criada! Confirma pelo email e depois entra. Falta o ginásio ativar a tua mensalidade.')
    }
    // Se houver sessão, o AuthProvider encaminha automaticamente.
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <div className="card max-w-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/20 text-lime-400">
            <UserPlus size={26} />
          </div>
          <h2 className="text-lg font-bold">Conta criada</h2>
          <p className="mt-2 text-sm text-slate-400">{done}</p>
          <button className="btn-primary mt-5 w-full" onClick={onBack}>
            Ir para o login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-sm px-5 py-8">
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm text-slate-400">
        <ArrowLeft size={16} /> Voltar
      </button>
      <Logo size={150} className="mb-4" />
      <h1 className="text-2xl font-bold">Criar conta de membro</h1>
      <p className="mb-6 mt-1 text-sm text-slate-400">
        Preenche os teus dados. A tua conta fica pendente até o ginásio confirmar o pagamento.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="relative">
            <Avatar name={fullName || '?'} url={photo} size={88} />
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white shadow-glow">
              <Camera size={16} />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={onPickPhoto}
          />
          <span className="text-xs text-slate-500">Toca para adicionar foto</span>
        </div>

        <div>
          <label className="label">Nome completo</label>
          <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Palavra-passe</label>
          <input type="password" className="input" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label">Data de nascimento</label>
            <input type="date" className="input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="label">Telefone</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Género</label>
          <div className="flex gap-2">
            {['Masculino', 'Feminino', 'Outro'].map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 rounded-2xl border px-2 py-2.5 text-sm font-medium transition ${
                  gender === g
                    ? 'border-brand bg-brand/15 text-brand-400'
                    : 'border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          <UserPlus size={18} /> {busy ? 'A criar…' : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}
