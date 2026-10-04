import { useState } from 'react'
import { supabase, supabaseConfigured } from '@/lib/supabase'

export default function Login() {
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
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-2xl text-white">
            🏋️
          </div>
          <h1 className="text-2xl font-bold">Ginásio</h1>
          <p className="text-sm text-slate-500">Entra na tua conta</p>
        </div>

        {!supabaseConfigured && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            ⚠️ Supabase não configurado. Copia <code>.env.example</code> para{' '}
            <code>.env</code> e preenche as chaves do teu projeto.
          </div>
        )}

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
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'A entrar…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Não tens conta? Pede ao administrador do ginásio para te registar.
        </p>
      </div>
    </div>
  )
}
