import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useClub, useClubMembers, useClubEvents } from '../../lib/hooks'

export default function MiClub() {
  const { membership } = useAuth()
  const { club, loading } = useClub()
  const { members } = useClubMembers(club?.id)
  const { events } = useClubEvents(club?.id)
  const navigate = useNavigate()

  const isLeader = membership?.role === 'leader'
  const isAdmin = membership?.role === 'admin'
  const canManage = isLeader || isAdmin

  const now = new Date()
  const eventsThisMonth = events.filter((e) => {
    const d = new Date(e.date_time)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  if (loading) {
    return <div className="p-5 text-center text-white/30 text-sm pt-20">Cargando...</div>
  }

  if (!membership || !club) {
    return (
      <div className="p-5 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="text-4xl mb-4">🏁</span>
        <h2 className="font-display text-2xl text-white mb-2">SIN CLUB</h2>
        <p className="text-white/40 text-sm mb-6">Únete a un club o crea el tuyo</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/onboarding/join-club')} className="btn-outline rounded text-xs">
            Unirme
          </button>
          <button onClick={() => navigate('/onboarding/create-club')} className="btn-cyan rounded text-xs">
            Crear Club
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-4">
      {/* Club header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-[var(--cyan)]/10 flex items-center justify-center overflow-hidden">
          {club.logo_url ? (
            <img src={club.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-xl text-[var(--cyan)]">{club.name[0]}</span>
          )}
        </div>
        <div>
          <div className="font-bold text-white">{club.name}</div>
          <div className="text-xs text-white/35">{isLeader ? 'Líder' : isAdmin ? 'Admin' : 'Miembro'}</div>
        </div>
      </div>

      {/* Stats */}
      {canManage && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[var(--cyan)]/[0.04] border border-[var(--cyan)]/15 text-center">
            <div className="font-display text-2xl text-[var(--cyan)]">{members.length}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Miembros</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
            <div className="font-display text-2xl text-white">{eventsThisMonth.length}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Eventos este mes</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <MenuButton
          icon="👥"
          label="Miembros"
          onClick={() => navigate('/app/club/members')}
        />

        {canManage && (
          <MenuButton
            icon="📅"
            label="Crear evento"
            onClick={() => navigate('/app/club/create-event')}
          />
        )}

        {isLeader && (
          <MenuButton
            icon="⚙️"
            label="Configuración del club"
            onClick={() => navigate('/app/club/settings')}
          />
        )}

        {club.whatsapp_link ? (
          <a
            href={club.whatsapp_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-[#25D366]/20 bg-[#25D366]/[0.06] hover:bg-[#25D366]/[0.1] transition-colors"
          >
            <span className="text-lg">💬</span>
            <span className="text-sm font-medium text-[#25D366]">Grupo de WhatsApp</span>
            <span className="ml-auto text-white/20">→</span>
          </a>
        ) : isLeader ? (
          <MenuButton
            icon="💬"
            label="Agregar link de WhatsApp"
            onClick={() => navigate('/app/club/settings')}
          />
        ) : null}
      </div>

      {/* Upcoming events */}
      {events.length > 0 && (
        <div>
          <div className="text-[10px] tracking-widest uppercase text-white/25 mb-2">Próximos eventos</div>
          {events.filter((e) => e.date_time >= now.toISOString()).slice(0, 5).map((e) => {
            const dt = new Date(e.date_time)
            return (
              <div key={e.id} className="py-2.5 border-b border-white/[0.04] flex items-center gap-3">
                <div className="text-center flex-shrink-0 w-10">
                  <div className="text-xs font-bold text-[var(--cyan)]">{dt.getDate()}</div>
                  <div className="text-[9px] text-white/30 uppercase">
                    {dt.toLocaleDateString('es-MX', { month: 'short' })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white">{e.title}</div>
                  <div className="text-xs text-white/35">
                    {dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    {e.location && ` · ${e.location}`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MenuButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors text-left"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm text-white/80">{label}</span>
      <span className="ml-auto text-white/20">→</span>
    </button>
  )
}
