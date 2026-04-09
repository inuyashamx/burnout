import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingScreen from '../components/LoadingScreen'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.id) {
          subscription.unsubscribe()

          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle()

          navigate(profile ? '/app' : '/onboarding', { replace: true })
        }
      }
    )

    // Fallback: if already signed in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle()
        navigate(profile ? '/app' : '/onboarding', { replace: true })
      }
    })

    // Timeout fallback
    const timeout = setTimeout(() => navigate('/login', { replace: true }), 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return <LoadingScreen />
}
