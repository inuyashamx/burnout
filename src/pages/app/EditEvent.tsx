import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import ConfirmModal from '../../components/ConfirmModal'

export default function EditEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!eventId) return
    supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title)
          setDescription(data.description ?? '')
          setDateTime(data.date_time.slice(0, 16))
          setLocation(data.location ?? '')
        }
        setLoading(false)
      })
  }, [eventId])

  const handleSave = async () => {
    if (!title.trim()) return setError('El título es obligatorio')
    if (!dateTime) return setError('La fecha y hora son obligatorias')

    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('events').update({
      title: title.trim(),
      description: description.trim() || null,
      date_time: new Date(dateTime).toISOString(),
      location: location.trim() || null,
    }).eq('id', eventId)

    setSaving(false)
    if (err) return setError('Error al guardar. Intenta de nuevo.')
    navigate(-1)
  }

  const handleDelete = async () => {
    await supabase.from('events').delete().eq('id', eventId)
    navigate('/app/club')
  }

  if (loading) return <div className="p-5 text-center text-white/30 text-sm pt-20">Cargando...</div>

  return (
    <div className="p-5 animate-fade-in-up">
      {showDeleteConfirm && (
        <ConfirmModal
          title="Eliminar evento"
          message="¿Estás seguro de eliminar este evento? No se puede deshacer."
          confirmLabel="Eliminar"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <h1 className="font-display text-3xl tracking-tight text-white mb-6">EDITAR EVENTO</h1>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Título *</span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors" />
      </label>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Descripción</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors resize-none" />
      </label>

      <label className="block mb-3">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Fecha y hora *</span>
        <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors [color-scheme:dark]" />
      </label>

      <label className="block mb-5">
        <span className="text-xs tracking-wider uppercase text-white/30 mb-1.5 block">Ubicación</span>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Plaza Central"
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--cyan)]/40 transition-colors" />
      </label>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button onClick={handleSave} disabled={saving} className="btn-cyan rounded w-full disabled:opacity-50 mb-3">
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>

      <button onClick={() => setShowDeleteConfirm(true)} className="w-full p-3 rounded-xl text-red-400 text-sm hover:bg-red-500/10 transition-colors">
        Eliminar evento
      </button>
    </div>
  )
}
