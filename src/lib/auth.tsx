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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [membership, setMembership] = useState<ClubMember | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    setProfile(data)
    return data
  }

  const fetchMembership = async (userId: string) => {
    const { data } = await supabase
      .from('club_members')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()
    setMembership(data)
    return data
  }

  const refreshProfile = async () => {
    if (session?.user.id) await fetchProfile(session.user.id)
  }

  const refreshMembership = async () => {
    if (session?.user.id) await fetchMembership(session.user.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s)
      if (s?.user.id) {
        await fetchProfile(s.user.id)
        await fetchMembership(s.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s)
        if (s?.user.id) {
          await fetchProfile(s.user.id)
          await fetchMembership(s.user.id)
        } else {
          setProfile(null)
          setMembership(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, profile, membership, loading, refreshProfile, refreshMembership }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
