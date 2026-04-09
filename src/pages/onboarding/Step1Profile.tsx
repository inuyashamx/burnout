import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

export default function Step1Profile() {
  const { session, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [birthday, setBirthday] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const avatarUrl = session?.user.user_metadata?.avatar_url ?? null

  const handleNext = async () => {
    if (!nickname.trim()) return setError('El nickname es obligatorio')
    if (!birthday) return setError('La fecha de nacimiento es obligatoria')
    if (!session?.user.id) return

    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('profiles').insert({
      id: session.user.id,
      nickname: nickname.trim(),
      birthday,
      avatar_url: avatarUrl,
    })

    if (err) {
      setSaving(false)
      if (err.code === '23505') return setError('Ese nickname ya está en uso')
      return setError('Error al guardar. Intenta de nuevo.')
    }

    await refreshProfile()
    navigate('/onboarding/carro')
  }

  return (
    <div className="flex-1 flex flex-col animate-fade-in-up">
      <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-white mb-1">
        TU PERFIL
      </h1>
      <p className="text-white/40 text-sm mb-8">
        Así te van a conocer en la app
      </p>

      {/* Avatar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--cyan)]/30 bg-white/5">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-white/30">
              {nickname ? nickname[0].toUpperCase() : '?'}
            </div>
          )}
        </div>
      </div>

      {/* Nickname */}
      <label className="block mb-4">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Nickname *</span>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Ej: ElChema, Turbo, StangKing"
          maxLength={30}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors"
        />
      </label>

      {/* Birthday */}
      <label className="block mb-6">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">¿Cuándo es tu cumpleaños? *</span>
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors [color-scheme:dark]"
        />
      </label>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      <div className="mt-auto">
        <button
          onClick={handleNext}
          disabled={saving}
          className="btn-cyan rounded w-full disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Siguiente'}
        </button>
      </div>
    </div>
  )
}
