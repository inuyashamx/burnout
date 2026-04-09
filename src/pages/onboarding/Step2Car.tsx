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
    const files = Array.from(e.target.files ?? []).slice(0, 5)
    setPhotos(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
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
      <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-white mb-1">
        TU CARRO
      </h1>
      <p className="text-white/40 text-sm mb-6">
        Registra tu máquina. Puedes agregar más después.
      </p>

      {/* Photo upload */}
      <div className="mb-5">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Fotos (hasta 5)</span>
        <label className="flex flex-wrap gap-2 cursor-pointer">
          {previews.map((src, i) => (
            <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-white/10">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {previews.length < 5 && (
            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--cyan)]/30 flex items-center justify-center text-[var(--cyan)]/60 hover:border-[var(--cyan)]/50 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotos}
            className="hidden"
          />
        </label>
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
