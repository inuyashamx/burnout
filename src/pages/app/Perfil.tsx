import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useMyCars } from '../../lib/hooks'
import { supabase } from '../../lib/supabase'

export default function Perfil() {
  const { profile } = useAuth()
  const { cars } = useMyCars()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!profile) return null

  const birthdayDisplay = new Date(profile.birthday + 'T12:00:00').toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="p-5">
      {/* Profile header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[var(--cyan)]/10 border-2 border-[var(--cyan)]/20 overflow-hidden mb-3 flex items-center justify-center">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-2xl text-[var(--cyan)]">
              {profile.nickname[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="font-bold text-lg text-white">@{profile.nickname}</div>
        <div className="text-xs text-white/35 mt-0.5">🎂 {birthdayDisplay}</div>
        <button
          onClick={() => navigate('/app/perfil/edit')}
          className="mt-2 text-xs text-[var(--cyan)] hover:underline"
        >
          Editar perfil
        </button>
      </div>

      {/* Garage */}
      <div className="mb-6">
        <div className="text-[10px] tracking-widest uppercase text-white/25 mb-3">Mi Garage</div>

        {cars.length === 0 ? (
          <div className="text-center py-6 text-white/30 text-sm">
            No tienes carros registrados
          </div>
        ) : (
          <div className="space-y-2">
            {cars.map((car) => (
              <div
                key={car.id}
                onClick={() => navigate(`/app/perfil/cars/${car.id}/edit`)}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--cyan)]/[0.06] flex-shrink-0 flex items-center justify-center">
                  {car.photos.length > 0 ? (
                    <img src={car.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">🚗</span>
                  )}
                </div>
                <div className="flex-1">
                  {car.nickname && (
                    <div className="font-semibold text-sm text-white">"{car.nickname}"</div>
                  )}
                  <div className="text-xs text-white/40">
                    {car.make} {car.model} · {car.year}
                  </div>
                </div>
                <span className="text-white/15 text-xs">→</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/app/perfil/add-car')}
          className="w-full mt-3 p-3 rounded-xl border border-dashed border-white/10 text-center text-sm text-white/25 hover:text-white/40 hover:border-white/20 transition-colors"
        >
          + Agregar otro carro
        </button>
      </div>

      {/* Notifications link */}
      <button
        onClick={() => navigate('/app/perfil/notifications')}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors text-left mb-2"
      >
        <span className="text-lg">🔔</span>
        <span className="text-sm text-white/80">Notificaciones</span>
        <span className="ml-auto text-white/20">→</span>
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full mt-4 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  )
}
