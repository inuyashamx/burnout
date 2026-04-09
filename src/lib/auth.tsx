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

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return data
}

async function fetchMembership(userId: string): Promise<ClubMember | null> {
  const { data } = await supabase
    .from('club_members')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [membership, setMembership] = useState<ClubMember | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on mount — handles initial load
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)

        if (s?.user.id) {
          // Use setTimeout to avoid Supabase deadlock with auth state change
          setTimeout(async () => {
            const [p, m] = await Promise.all([
              fetchProfile(s.user.id).catch(() => null),
              fetchMembership(s.user.id).catch(() => null),
            ])
            setProfile(p)
            setMembership(m)
            setLoading(false)
          }, 0)
        } else {
          setProfile(null)
          setMembership(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
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
