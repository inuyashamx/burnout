import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string).trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string).trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

// Manually handle OAuth hash tokens — detectSessionInUrl breaks with "Invalid value" on Vercel
if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')

  console.log('[BURNOUT AUTH] Manual hash parse — access_token length:', accessToken?.length, 'refresh_token:', refreshToken)

  if (accessToken && refreshToken) {
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then(({ data, error }) => {
      console.log('[BURNOUT AUTH] setSession result:', data.session ? 'SUCCESS' : 'NO SESSION', error ? `error=${error.message}` : '')
      // Clean hash from URL
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    })
  }
}
