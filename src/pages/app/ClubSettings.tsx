import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { useClub } from '../../lib/hooks'

export default function ClubSettings() {
  const { session } = useAuth()
  const { club } = useClub()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!club) return
    setName(club.name)
    setDescription(club.description ?? '')
    setWhatsappLink(club.whatsapp_link ?? '')
  }, [club])

  const handleSave = async () => {
    if (!club || !session?.user.id) return
    setSaving(true)

    await supabase.from('clubs').update({
      name: name.trim(),
      description: description.trim() || null,
      whatsapp_link: whatsappLink.trim() || null,
    }).eq('id', club.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-5 animate-fade-in-up">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <h1 className="font-display text-3xl tracking-tight text-white mb-6">CONFIGURACIÓN</h1>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Nombre del club</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors"
        />
      </label>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Descripción</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors resize-none"
        />
      </label>

      <label className="block mb-6">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Link de WhatsApp</span>
        <input
          type="text"
          value={whatsappLink}
          onChange={(e) => setWhatsappLink(e.target.value)}
          placeholder="https://chat.whatsapp.com/..."
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors"
        />
      </label>

      <button onClick={handleSave} disabled={saving} className="btn-cyan rounded w-full disabled:opacity-50">
        {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  )
}
