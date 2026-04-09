import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import InstallPWA from '../components/InstallPWA'

function SpeedLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="light-streak" style={{ top: '18%' }} />
      <div className="light-streak" style={{ top: '42%' }} />
      <div className="light-streak" style={{ top: '76%' }} />
    </div>
  )
}

function HeroGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute -top-1/4 -right-1/4 w-[80vw] h-[80vw] rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, var(--cyan) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-1/3 -left-1/4 w-[60vw] h-[60vw] rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, #0097A7 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-1/2 left-0 right-0 h-px opacity-[0.08]"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, var(--cyan) 50%, transparent 95%)',
          filter: 'blur(2px)',
        }}
      />
    </div>
  )
}

function CarSilhouette() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-3xl h-24 opacity-[0.06]"
        style={{
          background: 'radial-gradient(ellipse at center bottom, var(--cyan) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <svg
        className="w-full max-w-2xl mx-auto opacity-[0.06]"
        viewBox="0 0 800 200"
        fill="none"
      >
        <path
          d="M100 160 L180 160 L220 110 L340 80 L500 75 L600 85 L680 110 L720 160 L780 160"
          stroke="var(--cyan)"
          strokeWidth="1.5"
        />
        <ellipse cx="240" cy="165" rx="35" ry="35" stroke="var(--cyan)" strokeWidth="1" />
        <ellipse cx="620" cy="165" rx="35" ry="35" stroke="var(--cyan)" strokeWidth="1" />
      </svg>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    // After Google OAuth, tokens arrive in hash on this page
    // Supabase auto-detects them, then we redirect
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

    // Also check if already logged in
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

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="relative min-h-[100dvh] flex flex-col noise-overlay">
      <SpeedLines />
      <HeroGlow />
      <CarSilhouette />

      <nav className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border border-[var(--cyan)]/30"
              style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)' }}
            />
            <span className="font-display text-cyan text-lg leading-none tracking-tight">B</span>
          </div>
          <span className="font-display text-lg tracking-wide text-white/90 hidden sm:inline">
            BURNOUT
          </span>
        </div>
        <InstallPWA />
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 text-center pb-20">
        <div className="animate-fade-in-up delay-100 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] text-xs tracking-widest uppercase text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse" />
            Club de Autos
          </span>
        </div>

        <h1 className="animate-fade-in-up delay-200">
          <span
            className="block font-display text-[clamp(4rem,16vw,10rem)] leading-[0.85] tracking-tight animate-reveal-text delay-400"
            style={{
              background: 'linear-gradient(135deg, var(--cyan-light) 0%, var(--cyan) 40%, var(--cyan-dark) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            BURNOUT
          </span>
        </h1>

        <div className="glow-line max-w-[200px] my-6 animate-fade-in delay-400" />

        <p className="max-w-md text-white/50 text-base sm:text-lg leading-relaxed animate-fade-in-up delay-500">
          Tu club, tu crew, tu camino.
          <br className="hidden sm:inline" />
          <span className="text-white/30">Organiza, conecta y sal a rodar.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-10 w-full sm:w-auto animate-fade-in-up delay-600">
          <Link to="/register" className="btn-cyan rounded w-full sm:w-auto min-w-[200px]">
            Registrarse
          </Link>
          <Link to="/login" className="btn-outline rounded w-full sm:w-auto min-w-[200px]">
            Iniciar Sesión
          </Link>
        </div>

        <div className="flex items-center gap-6 sm:gap-10 mt-14 animate-fade-in delay-700">
          <Stat value="200+" label="Miembros" />
          <div className="w-px h-8 bg-white/[0.06]" />
          <Stat value="35" label="Clubs" />
          <div className="w-px h-8 bg-white/[0.06]" />
          <Stat value="V" label="Viernes" />
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.04] bg-white/[0.01]">
        <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-white/[0.04]">
          <FeatureCard
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            }
            title="Crea tu Club"
            desc="Arma tu crew con sus reglas"
            delay="delay-500"
          />
          <FeatureCard
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
            title="Planea el Viernes"
            desc="Eventos, rutas, puntos de encuentro"
            delay="delay-600"
          />
          <FeatureCard
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
              </svg>
            }
            title="Sal a Rodar"
            desc="Conecta con otros clubes"
            delay="delay-700"
          />
        </div>
      </footer>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl sm:text-3xl text-cyan tracking-tight">{value}</div>
      <div className="text-[10px] sm:text-xs tracking-widest uppercase text-white/30 mt-0.5">{label}</div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  delay: string
}) {
  return (
    <div className={`flex-1 flex items-center gap-3.5 px-5 sm:px-6 py-4 sm:py-5 animate-fade-in-up ${delay}`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--cyan)]/[0.06] border border-[var(--cyan)]/[0.1] flex items-center justify-center text-cyan">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-white/80">{title}</div>
        <div className="text-xs text-white/35 mt-0.5">{desc}</div>
      </div>
    </div>
  )
}
