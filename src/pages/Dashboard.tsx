import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 noise-overlay">
      <div className="text-center animate-fade-in-up">
        <div className="font-display text-5xl sm:text-6xl text-gold tracking-tight mb-3">
          DASHBOARD
        </div>
        <p className="text-white/40 text-sm mb-8">
          Próximamente...
        </p>
        <Link
          to="/"
          className="btn-outline rounded text-sm"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
