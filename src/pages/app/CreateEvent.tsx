import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { notifyNewEvent } from '../../lib/notifications'

export default function CreateEvent() {
  const { session, membership } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [location, setLocation] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setBannerFile(file); setBannerPreview(URL.createObjectURL(file)) }
  }

  const handleCreate = async () => {
    if (!title.trim()) return setError('El título es obligatorio')
    if (!dateTime) return setError('La fecha y hora son obligatorias')
    if (!session?.user.id || !membership?.club_id) return

    setSaving(true)
    setError('')

    let bannerUrl: string | null = null
    if (bannerFile) {
      const ext = bannerFile.name.split('.').pop()
      const path = `${session.user.id}/events/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('media').upload(path, bannerFile)
      if (!uploadErr) {
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        bannerUrl = data.publicUrl
      }
    }

    const isoDate = new Date(dateTime).toISOString()
    const { data: event, error: err } = await supabase.from('events').insert({
      club_id: membership.club_id,
      title: title.trim(),
      description: description.trim() || null,
      date_time: isoDate,
      location: location.trim() || null,
      event_type: null,
      banner_url: bannerUrl,
      created_by: session.user.id,
    }).select().single()

    setSaving(false)
    if (err || !event) return setError('Error al crear evento. Intenta de nuevo.')

    notifyNewEvent(membership.club_id, title.trim(), event.id, isoDate)
    navigate('/app/club')
  }

  return (
    <div className="p-5 animate-fade-in-up">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <h1 className="font-display text-3xl tracking-tight text-white mb-6">CREAR EVENTO</h1>

      {/* Banner */}
      <div className="mb-4">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Banner</span>
        <label className="block cursor-pointer">
          <div className="w-full h-36 rounded-xl border-2 border-dashed border-[var(--cyan)]/30 bg-white/[0.02] flex items-center justify-center overflow-hidden hover:border-[var(--cyan)]/50 transition-colors">
            {bannerPreview ? (
              <img src={bannerPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-white/30">
                <div className="text-2xl mb-1">🖼️</div>
                <div className="text-xs">Agregar banner</div>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleBanner} className="hidden" />
        </label>
      </div>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Título *</span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Rodada Nocturna, Arrancones Viernes"
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors" />
      </label>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Descripción</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿De qué va el evento?" rows={3}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors resize-none" />
      </label>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Fecha y hora *</span>
        <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors [color-scheme:dark]" />
      </label>

      <label className="block mb-5">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Ubicación</span>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Plaza Central, Autódromo"
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors" />
      </label>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button onClick={handleCreate} disabled={saving} className="btn-cyan rounded w-full disabled:opacity-50">
        {saving ? 'Creando...' : 'Crear Evento'}
      </button>
    </div>
  )
}
