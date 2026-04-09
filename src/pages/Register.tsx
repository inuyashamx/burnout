import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const handleGoogleRegister = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col noise-overlay overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, var(--cyan) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-15%] right-[-15%] w-[50vw] h-[50vw] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #0097A7 0%, transparent 70%)' }}
        />
      </div>

      {/* Back button */}
      <div className="relative z-10 px-5 pt-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Volver
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border border-[var(--cyan)]/20"
                style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)' }}
              />
              <span className="font-display text-[var(--cyan)] text-3xl leading-none">B</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-10 animate-fade-in-up delay-100">
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-white mb-2">
              ÚNETE
            </h1>
            <p className="text-white/40 text-sm">
              Crea tu cuenta y encuentra tu club
            </p>
          </div>

          {/* Google button */}
          <div className="animate-fade-in-up delay-200">
            <button
              onClick={handleGoogleRegister}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-gray-900 font-semibold text-sm tracking-wide transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] shadow-lg shadow-white/5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Registrarse con Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8 animate-fade-in delay-300">
            <div className="flex-1 glow-line opacity-30" />
            <span className="text-[10px] text-white/15 uppercase tracking-[0.2em]">o</span>
            <div className="flex-1 glow-line opacity-30" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-white/30 animate-fade-in delay-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[var(--cyan)] hover:text-[var(--cyan-light)] transition-colors font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom car silhouette */}
      <div className="relative z-10 pointer-events-none" aria-hidden="true">
        <svg className="w-full max-w-md mx-auto opacity-[0.04]" viewBox="0 0 800 120" fill="none">
          <path
            d="M100 100 L180 100 L220 60 L340 35 L500 30 L600 40 L680 60 L720 100 L780 100"
            stroke="var(--cyan)"
            strokeWidth="1"
          />
          <ellipse cx="240" cy="105" rx="28" ry="28" stroke="var(--cyan)" strokeWidth="0.8" />
          <ellipse cx="620" cy="105" rx="28" ry="28" stroke="var(--cyan)" strokeWidth="0.8" />
        </svg>
      </div>
    </div>
  )
}
