import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { useClub } from '../../lib/hooks'

export default function AddMerchItem() {
  const { session } = useAuth()
  const { club } = useClub()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)) }
  }

  const handleSave = async () => {
    if (!name.trim()) return setError('El nombre es obligatorio')
    if (!price || isNaN(Number(price))) return setError('El precio es obligatorio')
    if (!session?.user.id || !club?.id) return

    setSaving(true)
    setError('')

    let photoUrl: string | null = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${session.user.id}/merch/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('media').upload(path, photoFile)
      if (!uploadErr) {
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        photoUrl = data.publicUrl
      }
    }

    const { error: err } = await supabase.from('merch_items').insert({
      club_id: club.id,
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      photo_url: photoUrl,
      created_by: session.user.id,
    })

    setSaving(false)
    if (err) return setError('Error al guardar.')
    navigate(-1)
  }

  return (
    <div className="p-5 animate-fade-in-up">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <h1 className="font-display text-3xl tracking-tight text-white mb-6">AGREGAR ARTÍCULO</h1>

      {/* Photo */}
      <div className="mb-4">
        <label className="block cursor-pointer">
          <div className="w-full h-40 rounded-xl border-2 border-dashed border-[var(--cyan)]/30 bg-white/[0.02] flex items-center justify-center overflow-hidden hover:border-[var(--cyan)]/50 transition-colors">
            {photoPreview ? (
              <img src={photoPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-white/30">
                <div className="text-2xl mb-1">📷</div>
                <div className="text-xs">Foto del artículo</div>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        </label>
      </div>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Nombre *</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Playera oficial, Sticker pack"
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors" />
      </label>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Descripción</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles del artículo" rows={2}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors resize-none" />
      </label>

      <label className="block mb-5">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Precio *</span>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01"
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors" />
      </label>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button onClick={handleSave} disabled={saving} className="btn-cyan rounded w-full disabled:opacity-50">
        {saving ? 'Guardando...' : 'Agregar Artículo'}
      </button>
    </div>
  )
}
