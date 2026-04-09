import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingScreen from '../components/LoadingScreen'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase auto-detects hash tokens via detectSessionInUrl
    // Just wait for the session to be available then redirect
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle()

        navigate(profile ? '/app' : '/onboarding', { replace: true })
      } else {
        // Wait for onAuthStateChange to fire
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, s) => {
            if (event === 'SIGNED_IN' && s?.user?.id) {
              subscription.unsubscribe()
              const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', s.user.id)
                .maybeSingle()

              navigate(profile ? '/app' : '/onboarding', { replace: true })
            }
          }
        )

        // Timeout fallback
        setTimeout(() => {
          subscription.unsubscribe()
          navigate('/login', { replace: true })
        }, 5000)
      }
    }

    checkSession()
  }, [navigate])

  return <LoadingScreen />
}
