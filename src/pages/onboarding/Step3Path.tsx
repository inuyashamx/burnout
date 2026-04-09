import { useNavigate } from 'react-router-dom'

export default function Step3Path() {
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex flex-col animate-fade-in-up">
      <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-white mb-1">
        TU CAMINO
      </h1>
      <p className="text-white/40 text-sm mb-8">
        ¿Qué quieres hacer?
      </p>

      <div className="flex flex-col gap-3">
        <PathCard
          emoji="🏁"
          title="Unirme a un club"
          desc="Busca y únete a un club existente"
          onClick={() => navigate('/onboarding/join-club')}
          accent
        />
        <PathCard
          emoji="⚙️"
          title="Crear mi club"
          desc="Eres líder, arma tu crew aquí"
          onClick={() => navigate('/onboarding/create-club')}
          accent
        />
        <PathCard
          emoji="🚗"
          title="Soy independiente"
          desc="Explora sin club, únete después"
          onClick={() => navigate('/app')}
        />
      </div>
    </div>
  )
}

function PathCard({
  emoji,
  title,
  desc,
  onClick,
  accent,
}: {
  emoji: string
  title: string
  desc: string
  onClick: () => void
  accent?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 active:scale-[0.98] ${
        accent
          ? 'border-[var(--cyan)]/20 bg-[var(--cyan)]/[0.03] hover:bg-[var(--cyan)]/[0.06]'
          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <div className="font-semibold text-sm text-white">{title}</div>
          <div className="text-xs text-white/40 mt-0.5">{desc}</div>
        </div>
      </div>
    </button>
  )
}
