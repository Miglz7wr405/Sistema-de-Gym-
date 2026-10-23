import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Profile } from './types'

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  /** Injecta sessao+perfil ja carregados (apos login) — evita 2.o round-trip. */
  setSessionAndProfile: (session: Session, profile: Profile | null) => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return (data ?? null) as Profile | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session) setProfile(await fetchProfile(data.session.user.id))
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)
      // So vai buscar o perfil quando ainda nao foi carregado (SIGNED_IN inicial).
      // Em TOKEN_REFRESHED/USER_UPDATED mantem o perfil atual — evita round-trip extra.
      if (!newSession) {
        setProfile(null)
      } else if (event === 'SIGNED_IN') {
        setProfile((cur) => cur ?? null)
        const p = await fetchProfile(newSession.user.id)
        setProfile(p)
      }
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      session,
      profile,
      loading,
      signOut: async () => {
        await supabase.auth.signOut()
        setProfile(null)
      },
      refreshProfile: async () => {
        if (session) setProfile(await fetchProfile(session.user.id))
      },
      setSessionAndProfile: (s2, p2) => {
        setSession(s2)
        setProfile(p2)
      },
    }),
    [session, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve estar dentro de <AuthProvider>')
  return ctx
}
