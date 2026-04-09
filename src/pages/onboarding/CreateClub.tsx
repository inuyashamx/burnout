import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

export default function CreateClub() {
  const { session, refreshMembership } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) return setError('El nombre del club es obligatorio')
    if (!session?.user.id) return

    setSaving(true)
    setError('')

    try {
      let logoUrl: string | null = null
      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `${session.user.id}/clubs/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('media').upload(path, logoFile)
        if (!uploadErr) {
          const { data } = supabase.storage.from('media').getPublicUrl(path)
          logoUrl = data.publicUrl
        }
      }

      const { data: club, error: clubErr } = await supabase
        .from('clubs')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          logo_url: logoUrl,
          whatsapp_link: whatsappLink.trim() || null,
          created_by: session.user.id,
        })
        .select()
        .single()

      if (clubErr || !club) {
        setSaving(false)
        return setError(clubErr?.message ?? 'Error al crear el club. Intenta de nuevo.')
      }

      const { error: memberErr } = await supabase.from('club_members').insert({
        club_id: club.id,
        user_id: session.user.id,
        role: 'leader',
      })

      if (memberErr) {
        setSaving(false)
        return setError(memberErr.message)
      }

      await refreshMembership()
      navigate('/app')
    } catch (e) {
      setSaving(false)
      setError('Error inesperado. Intenta de nuevo.')
    }
  }

  return (
    <div className="flex-1 flex flex-col animate-fade-in-up">
      <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-white mb-1">
        CREA TU CLUB
      </h1>
      <p className="text-white/40 text-sm mb-6">
        Arma tu crew
      </p>

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <label className="cursor-pointer">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed border-[var(--cyan)]/30 bg-white/[0.03] flex items-center justify-center hover:border-[var(--cyan)]/50 transition-colors">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <span className="text-xl text-[var(--cyan)]/60">+</span>
                <div className="text-[9px] text-white/30 mt-0.5">Logo</div>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
        </label>
      </div>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Nombre del club *</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Stang Kings Cancún"
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors"
        />
      </label>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Descripción</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿De qué va tu club?"
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors resize-none"
        />
      </label>

      <label className="block mb-5">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Link de WhatsApp</span>
        <input
          type="text"
          value={whatsappLink}
          onChange={(e) => setWhatsappLink(e.target.value)}
          placeholder="https://chat.whatsapp.com/..."
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors"
        />
      </label>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="mt-auto">
        <button onClick={handleCreate} disabled={saving} className="btn-cyan rounded w-full disabled:opacity-50">
          {saving ? 'Creando...' : 'Crear Club'}
        </button>
      </div>
    </div>
  )
}
