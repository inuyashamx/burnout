import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

console.log('[BURNOUT AUTH] supabaseUrl:', supabaseUrl)
console.log('[BURNOUT AUTH] anonKey length:', supabaseAnonKey?.length)
console.log('[BURNOUT AUTH] current URL:', window.location.href)
console.log('[BURNOUT AUTH] hash:', window.location.hash ? 'HAS HASH (' + window.location.hash.length + ' chars)' : 'NO HASH')
console.log('[BURNOUT AUTH] search:', window.location.search || 'NONE')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Log auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[BURNOUT AUTH] onAuthStateChange:', event, session ? `user=${session.user.id}` : 'no session')
})

// Log if there's an existing session
supabase.auth.getSession().then(({ data, error }) => {
  console.log('[BURNOUT AUTH] getSession:', data.session ? `user=${data.session.user.id}` : 'no session', error ? `error=${error.message}` : '')
})
