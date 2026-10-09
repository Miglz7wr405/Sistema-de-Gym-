import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'

export default function Login({ onSignUp }: { onSignUp: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou palavra-passe incorretos.')
    setBusy(false)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-brand-grad opacity-20 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={190} className="mb-3 shadow-glow" />
          <p className="mt-1 text-sm text-slate-400">Entra na tua conta</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@exemplo.com"
            />
          </div>
          <div>
            <label className="label">Palavra-passe</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            <LogIn size={18} /> {busy ? 'A entrar…' : 'Entrar'}
          </button>
        </form>

        <button
          onClick={onSignUp}
          className="mt-5 w-full text-center text-sm text-slate-400"
        >
          Novo no ginásio?{' '}
          <span className="font-semibold text-brand-400">Criar conta de membro</span>
        </button>
      </div>
    </div>
  )
}
