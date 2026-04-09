import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import ConfirmModal from '../../components/ConfirmModal'

export default function EditCar() {
  const { carId } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [carNickname, setCarNickname] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (!carId) return
    supabase.from('cars').select('*').eq('id', carId).single().then(({ data }) => {
      if (data) {
        setCarNickname(data.nickname ?? '')
        setMake(data.make)
        setModel(data.model)
        setYear(String(data.year))
        setExistingPhotos(data.photos ?? [])
      }
      setLoading(false)
    })
  }, [carId])

  const handleNewPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const totalSlots = 5 - existingPhotos.length
    const combined = [...newPhotos, ...files].slice(0, totalSlots)
    setNewPhotos(combined)
    setNewPreviews(combined.map((f) => URL.createObjectURL(f)))
    e.target.value = ''
  }

  const removeExisting = (i: number) => {
    setExistingPhotos((prev) => prev.filter((_, idx) => idx !== i))
  }

  const removeNew = (i: number) => {
    setNewPhotos((prev) => prev.filter((_, idx) => idx !== i))
    setNewPreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleSave = async () => {
    if (!make.trim() || !model.trim() || !year.trim()) return setError('Marca, modelo y año son obligatorios')
    if (!session?.user.id) return

    setSaving(true)
    setError('')

    const uploadedUrls: string[] = []
    for (const photo of newPhotos) {
      const ext = photo.name.split('.').pop()
      const path = `${session.user.id}/cars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('media').upload(path, photo)
      if (!uploadErr) {
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        uploadedUrls.push(data.publicUrl)
      }
    }

    const { error: err } = await supabase.from('cars').update({
      nickname: carNickname.trim() || null,
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year),
      photos: [...existingPhotos, ...uploadedUrls],
    }).eq('id', carId)

    setSaving(false)
    if (err) return setError('Error al guardar.')
    navigate(-1)
  }

  const handleDelete = async () => {
    await supabase.from('cars').delete().eq('id', carId)
    navigate('/app/perfil')
  }

  if (loading) return <div className="p-5 text-center text-white/30 text-sm pt-20">Cargando...</div>

  const totalPhotos = existingPhotos.length + newPhotos.length

  return (
    <div className="p-5 animate-fade-in-up">
      {showDelete && (
        <ConfirmModal title="Eliminar carro" message="¿Eliminar este carro de tu garage?" confirmLabel="Eliminar" danger onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
      )}

      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <h1 className="font-display text-3xl tracking-tight text-white mb-6">EDITAR CARRO</h1>

      {/* Photos */}
      <div className="mb-5">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Fotos ({totalPhotos}/5)</span>
        <div className="flex flex-wrap gap-2">
          {existingPhotos.map((src, i) => (
            <div key={`ex-${i}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeExisting(i)} className="absolute top-0 right-0 w-5 h-5 bg-black/70 rounded-bl flex items-center justify-center text-white/70 text-xs hover:text-red-400">×</button>
            </div>
          ))}
          {newPreviews.map((src, i) => (
            <div key={`new-${i}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--cyan)]/20">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeNew(i)} className="absolute top-0 right-0 w-5 h-5 bg-black/70 rounded-bl flex items-center justify-center text-white/70 text-xs hover:text-red-400">×</button>
            </div>
          ))}
          {totalPhotos < 5 && (
            <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--cyan)]/30 flex items-center justify-center text-[var(--cyan)]/60 cursor-pointer hover:border-[var(--cyan)]/50 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              <input type="file" accept="image/*" multiple onChange={handleNewPhotos} className="hidden" />
            </label>
          )}
        </div>
      </div>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Apodo</span>
        <input type="text" value={carNickname} onChange={(e) => setCarNickname(e.target.value)} placeholder='"La Bestia"'
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors" />
      </label>

      <div className="flex gap-3 mb-3">
        <label className="flex-1">
          <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Marca *</span>
          <input type="text" value={make} onChange={(e) => setMake(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors" />
        </label>
        <label className="flex-1">
          <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Modelo *</span>
          <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors" />
        </label>
      </div>

      <label className="block mb-5">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Año *</span>
        <input type="number" value={year} onChange={(e) => setYear(e.target.value)} min={1950} max={2030}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors" />
      </label>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button onClick={handleSave} disabled={saving} className="btn-cyan rounded w-full disabled:opacity-50 mb-3">
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>

      <button onClick={() => setShowDelete(true)} className="w-full p-3 rounded-xl text-red-400 text-sm hover:bg-red-500/10 transition-colors">
        Eliminar carro
      </button>
    </div>
  )
}
