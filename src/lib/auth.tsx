import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [membership, setMembership] = useState<ClubMember | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      setProfile(data)
      return data
    } catch {
      return null
    }
  }, [])

  const fetchMembership = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('club_members')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle()
      setMembership(data)
      return data
    } catch {
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) await fetchProfile(session.user.id)
  }, [session?.user.id, fetchProfile])

  const refreshMembership = useCallback(async () => {
    if (session?.user.id) await fetchMembership(session.user.id)
  }, [session?.user.id, fetchMembership])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(s)
        if (s?.user.id) {
          await fetchProfile(s.user.id)
          await fetchMembership(s.user.id)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (!mounted) return
        setSession(s)
        if (s?.user.id) {
          await fetchProfile(s.user.id)
          await fetchMembership(s.user.id)
        } else {
          setProfile(null)
          setMembership(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, fetchMembership])

  return (
    <AuthContext.Provider value={{ session, profile, membership, loading, refreshProfile, refreshMembership }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
