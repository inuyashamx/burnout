import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { Session } from '@supabase/supabase-js'
import type { Profile, ClubMember } from './types'

interface AuthState {
  session: Session | null
  profile: Profile | null
  membership: ClubMember | null
  loading: boolean
  refreshProfile: () => Promise<void>
  refreshMembership: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  membership: null,
  loading: true,
  refreshProfile: async () => {},
  refreshMembership: async () => {},
})

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return data as Profile | null
}

async function fetchMembership(userId: string) {
  const { data } = await supabase
    .from('club_members')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  return data as ClubMember | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [membership, setMembership] = useState<ClubMember | null>(null)
  const [loading, setLoading] = useState(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let ignore = false

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (ignore) return
      setSession(s)
      if (s?.user.id) {
        const [p, m] = await Promise.all([
          fetchProfile(s.user.id).catch(() => null),
          fetchMembership(s.user.id).catch(() => null),
        ])
        if (ignore) return
        setProfile(p)
        setMembership(m)
      }
      setLoading(false)
    }).catch(() => {
      if (!ignore) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (ignore) return
        setSession(s)
        if (s?.user.id) {
          const [p, m] = await Promise.all([
            fetchProfile(s.user.id).catch(() => null),
            fetchMembership(s.user.id).catch(() => null),
          ])
          if (ignore) return
          setProfile(p)
          setMembership(m)
        } else {
          setProfile(null)
          setMembership(null)
        }
      }
    )

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [])

  const refreshProfile = async () => {
    if (!session?.user.id) return
    const p = await fetchProfile(session.user.id).catch(() => null)
    setProfile(p)
  }

  const refreshMembership = async () => {
    if (!session?.user.id) return
    const m = await fetchMembership(session.user.id).catch(() => null)
    setMembership(m)
  }

  return (
    <AuthContext.Provider value={{ session, profile, membership, loading, refreshProfile, refreshMembership }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
