import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { notifyMemberJoined } from '../../lib/notifications'
import type { Club } from '../../lib/types'

export default function JoinClub() {
  const { session, refreshMembership } = useAuth()
  const navigate = useNavigate()
  const [clubs, setClubs] = useState<Club[]>([])
  const [search, setSearch] = useState('')
  const [joining, setJoining] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setClubs(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = clubs.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleJoin = async (clubId: string) => {
    if (!session?.user.id) return
    setJoining(clubId)

    await supabase.from('club_members').insert({
      club_id: clubId,
      user_id: session.user.id,
      role: 'member',
    })

    const nickname = session.user.user_metadata?.full_name ?? 'Nuevo miembro'
    notifyMemberJoined(clubId, nickname)

    await refreshMembership()
    navigate('/app')
  }

  return (
    <div className="flex-1 flex flex-col animate-fade-in-up">
      <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-white mb-1">
        ÚNETE A UN CLUB
      </h1>
      <p className="text-white/40 text-sm mb-6">
        Encuentra tu crew
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar club..."
        className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors mb-4"
      />

      {loading ? (
        <div className="text-center text-white/30 text-sm py-8">Cargando clubs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/30 text-sm mb-4">No hay clubs todavía</p>
          <button
            onClick={() => navigate('/onboarding/create-club')}
            className="text-[var(--cyan)] text-sm font-medium hover:underline"
          >
            Crea el primero
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((club) => (
            <div
              key={club.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-[var(--cyan)]/10 flex-shrink-0 flex items-center justify-center">
                {club.logo_url ? (
                  <img src={club.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">{club.name[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-white truncate">{club.name}</div>
                {club.description && (
                  <div className="text-xs text-white/35 truncate">{club.description}</div>
                )}
              </div>
              <button
                onClick={() => handleJoin(club.id)}
                disabled={joining === club.id}
                className="px-4 py-1.5 rounded-lg bg-[var(--cyan)]/10 text-[var(--cyan)] text-xs font-semibold hover:bg-[var(--cyan)]/20 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {joining === club.id ? '...' : 'Unirme'}
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/onboarding/camino')}
        className="text-white/30 text-sm hover:text-white/50 transition-colors mt-6 text-center"
      >
        ← Volver
      </button>
    </div>
  )
}
