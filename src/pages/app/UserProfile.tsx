import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Profile, Car } from '../../lib/types'

export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('cars').select('*').eq('user_id', userId).order('created_at'),
    ]).then(([profileRes, carsRes]) => {
      setProfile(profileRes.data)
      setCars(carsRes.data ?? [])
      setLoading(false)
    })
  }, [userId])

  if (loading) return <div className="p-5 text-center text-white/30 text-sm pt-20">Cargando...</div>
  if (!profile) return <div className="p-5 text-center text-white/30 text-sm pt-20">Perfil no encontrado</div>

  const birthdayDisplay = new Date(profile.birthday + 'T12:00:00').toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="p-5 animate-fade-in-up">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

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
      </div>

      {/* Garage */}
      <div className="text-[10px] tracking-widest uppercase text-white/25 mb-4">
        Garage {cars.length > 0 && `(${cars.length})`}
      </div>

      {cars.length === 0 ? (
        <p className="text-center text-white/20 text-sm py-8">Sin carros registrados</p>
      ) : (
        <div className="space-y-6">
          {cars.map((car) => (
            <div key={car.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              {/* Car photos */}
              {car.photos.length > 0 && (
                <div className={`grid gap-0.5 ${
                  car.photos.length === 1 ? 'grid-cols-1' :
                  car.photos.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2'
                }`}>
                  {car.photos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className={`w-full object-cover ${
                        car.photos.length === 1 ? 'h-48' :
                        car.photos.length === 3 && i === 0 ? 'h-48 col-span-2' :
                        'h-36'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Car info */}
              <div className="p-3.5">
                {car.nickname && (
                  <div className="font-display text-lg text-[var(--cyan)] mb-0.5">"{car.nickname}"</div>
                )}
                <div className="text-sm text-white/60">
                  {car.make} {car.model} · {car.year}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
