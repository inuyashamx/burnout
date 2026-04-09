import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

export default function Step1Profile() {
  const { session, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const googleName = session?.user.user_metadata?.full_name ?? session?.user.user_metadata?.name ?? ''
  const [nickname, setNickname] = useState(googleName)
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(
    session?.user.user_metadata?.avatar_url ?? ''
  )

  const handleNext = async () => {
    if (!nickname.trim()) return setError('El nickname es obligatorio')
    if (!birthMonth || !birthDay) return setError('Selecciona tu día y mes de cumpleaños')
    if (!session?.user.id) return

    setSaving(true)
    setError('')

    // Upload custom avatar if changed
    let finalAvatarUrl = avatarPreview
    if (avatarFile && session.user.id) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${session.user.id}/avatar/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('media').upload(path, avatarFile)
      if (!uploadErr) {
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        finalAvatarUrl = data.publicUrl
      }
    }

    // Store as a fixed date with year 2000 (only month/day matter)
    const birthday = `2000-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`

    const { error: err } = await supabase.from('profiles').insert({
      id: session.user.id,
      nickname: nickname.trim(),
      birthday,
      avatar_url: finalAvatarUrl || null,
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
        <label className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--cyan)]/30 bg-white/5 cursor-pointer group">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-white/30">
              {nickname ? nickname[0].toUpperCase() : '?'}
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setAvatarFile(file)
                setAvatarPreview(URL.createObjectURL(file))
              }
            }}
          />
        </label>
      </div>
      <p className="text-center text-[10px] text-white/20 -mt-6 mb-6">Toca para cambiar</p>

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
      <div className="mb-6">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">¿Cuándo es tu cumpleaños? *</span>
        <div className="flex gap-3">
          <select
            value={birthDay}
            onChange={(e) => setBirthDay(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors appearance-none [color-scheme:dark]"
          >
            <option value="" disabled className="bg-[#111] text-white/40">Día</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={String(d)} className="bg-[#111]">{d}</option>
            ))}
          </select>
          <select
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value)}
            className="flex-[2] px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors appearance-none [color-scheme:dark]"
          >
            <option value="" disabled className="bg-[#111] text-white/40">Mes</option>
            {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, i) => (
              <option key={i} value={String(i + 1)} className="bg-[#111]">{m}</option>
            ))}
          </select>
        </div>
      </div>

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
