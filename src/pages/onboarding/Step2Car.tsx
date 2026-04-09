import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

export default function Step2Car() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [carNickname, setCarNickname] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? [])
    const combined = [...photos, ...newFiles].slice(0, 5)
    setPhotos(combined)
    setPreviews(combined.map((f) => URL.createObjectURL(f)))
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadPhotos = async (): Promise<string[]> => {
    if (!session?.user.id || photos.length === 0) return []
    const urls: string[] = []
    for (const photo of photos) {
      const ext = photo.name.split('.').pop()
      const path = `${session.user.id}/cars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('media').upload(path, photo)
      if (!uploadErr) {
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    return urls
  }

  const handleNext = async () => {
    if (!make.trim() || !model.trim() || !year.trim()) {
      return setError('Marca, modelo y año son obligatorios')
    }
    if (!session?.user.id) return

    setSaving(true)
    setError('')

    const photoUrls = await uploadPhotos()

    const { error: err } = await supabase.from('cars').insert({
      user_id: session.user.id,
      nickname: carNickname.trim() || null,
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year),
      photos: photoUrls,
    })

    setSaving(false)
    if (err) return setError('Error al guardar. Intenta de nuevo.')
    navigate('/onboarding/camino')
  }

  const handleSkip = () => navigate('/onboarding/camino')

  return (
    <div className="flex-1 flex flex-col animate-fade-in-up">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-4 self-start">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>
      <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-white mb-1">
        TU CARRO
      </h1>
      <p className="text-white/40 text-sm mb-6">
        Registra tu máquina. Puedes agregar más después.
      </p>

      {/* Photo upload */}
      <div className="mb-5">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Fotos (hasta 5)</span>
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-0 right-0 w-5 h-5 bg-black/70 rounded-bl flex items-center justify-center text-white/70 text-xs hover:text-red-400"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--cyan)]/30 flex items-center justify-center text-[var(--cyan)]/60 hover:border-[var(--cyan)]/50 transition-colors cursor-pointer">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotos}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Car nickname */}
      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Apodo</span>
        <input
          type="text"
          value={carNickname}
          onChange={(e) => setCarNickname(e.target.value)}
          placeholder='Ej: "La Bestia", "El Rayo"'
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors"
        />
      </label>

      {/* Make + Model */}
      <div className="flex gap-3 mb-3">
        <label className="flex-1">
          <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Marca *</span>
          <input
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Ford"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors"
          />
        </label>
        <label className="flex-1">
          <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Modelo *</span>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Mustang GT"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors"
          />
        </label>
      </div>

      {/* Year */}
      <label className="block mb-5">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Año *</span>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="2016"
          min={1950}
          max={2030}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors"
        />
      </label>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="mt-auto flex flex-col gap-3">
        <button onClick={handleNext} disabled={saving} className="btn-cyan rounded w-full disabled:opacity-50">
          {saving ? 'Guardando...' : 'Siguiente'}
        </button>
        <button onClick={handleSkip} className="text-white/30 text-sm hover:text-white/50 transition-colors">
          Agregar después
        </button>
      </div>
    </div>
  )
}
