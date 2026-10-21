import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/Logo'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setError('Email ou palavra-passe incorretos.')
    setBusy(false)
  }

  async function recover() {
    if (!email.trim()) {
      setError('Escreve o teu email primeiro.')
      return
    }
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
    setInfo(error ? null : 'Enviámos instruções para o teu email (se existir conta).')
    if (error) setError('Não foi possível enviar a recuperação.')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-brand-grad opacity-10 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <button onClick={() => navigate('/')} className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
          <ArrowLeft size={16} /> Voltar ao site
        </button>
        <div className="mb-7 flex flex-col items-center text-center">
          <Logo size={170} className="mb-4" />
          <h1 className="display text-4xl">Entrar</h1>
          <p className="mt-1 text-sm text-slate-400">
            Bem-vindo de volta ao <span className="text-brand">Olympus</span>.
          </p>
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
              placeholder="o.teu@email.com"
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
          <button type="button" onClick={recover} className="block w-full text-right text-xs text-slate-400 hover:text-brand">
            Recuperar palavra-passe
          </button>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          {info && <p className="text-sm text-brand">{info}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            <LogIn size={18} /> {busy ? 'A entrar…' : 'Entrar'}
          </button>
        </form>

        <button onClick={() => navigate('/criar-conta')} className="mt-5 w-full text-center text-sm text-slate-400">
          Novo no ginásio? <span className="font-semibold text-brand">Criar conta de membro</span>
        </button>
      </div>
    </div>
  )
}
