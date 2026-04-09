import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingScreen from '../components/LoadingScreen'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL params
        const params = new URLSearchParams(window.location.search)
        const errorParam = params.get('error_description') || params.get('error')
        if (errorParam) {
          setError(errorParam)
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        // Check for code (PKCE flow)
        const code = params.get('code')
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            setError(exchangeError.message)
            setTimeout(() => navigate('/login'), 3000)
            return
          }
        }

        // Wait for session
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          // No session yet, wait a bit for hash-based auth to process
          await new Promise((r) => setTimeout(r, 1000))
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (!retrySession) {
            navigate('/login')
            return
          }
        }

        // Check if profile exists
        const userId = session?.user?.id ?? (await supabase.auth.getSession()).data.session?.user?.id
        if (!userId) {
          navigate('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle()

        if (profile) {
          navigate('/app')
        } else {
          navigate('/onboarding')
        }
      } catch {
        setError('Error de autenticación')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#0a0a0a] px-5">
        <p className="text-red-400 text-sm text-center mb-2">{error}</p>
        <p className="text-white/30 text-xs">Redirigiendo al login...</p>
      </div>
    )
  }

  return <LoadingScreen />
}
