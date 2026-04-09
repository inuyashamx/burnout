import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import LoadingScreen from '../components/LoadingScreen'

export default function AuthCallback() {
  const { session, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!session) {
      navigate('/login')
    } else if (!profile) {
      navigate('/onboarding')
    } else {
      navigate('/app')
    }
  }, [loading, session, profile, navigate])

  return <LoadingScreen />
}
