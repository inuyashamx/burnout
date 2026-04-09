import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { useClub } from '../../lib/hooks'
import type { MerchItem } from '../../lib/types'

export default function MerchStore() {
  const { session, membership } = useAuth()
  const { club } = useClub()
  const navigate = useNavigate()
  const [items, setItems] = useState<MerchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState<string | null>(null)
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [success, setSuccess] = useState('')

  const canManage = membership?.role === 'leader' || membership?.role === 'admin'

  useEffect(() => {
    if (!club?.id) return
    supabase.from('merch_items').select('*').eq('club_id', club.id).eq('active', true).order('created_at')
      .then(({ data }) => { setItems(data ?? []); setLoading(false) })
  }, [club?.id])

  const handleRequest = async (itemId: string) => {
    if (!session?.user.id) return
    await supabase.from('merch_requests').insert({
      item_id: itemId,
      user_id: session.user.id,
      size: size.trim() || null,
      quantity,
    })
    setRequesting(null)
    setSize('')
    setQuantity(1)
    setSuccess('Solicitud enviada')
    setTimeout(() => setSuccess(''), 2000)
  }

  if (loading) return <div className="p-5 text-center text-white/30 text-sm pt-20">Cargando...</div>

  return (
    <div className="p-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl tracking-tight text-white">🛍️ MERCH</h1>
        {canManage && (
          <button onClick={() => navigate('/app/club/merch/add')} className="px-3 py-1.5 rounded-lg bg-[var(--cyan)]/10 text-[var(--cyan)] text-xs font-semibold">
            + Agregar
          </button>
        )}
      </div>

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">{success}</div>
      )}

      {items.length === 0 ? (
        <p className="text-center text-white/30 text-sm py-8">No hay artículos disponibles</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              {item.photo_url && (
                <img src={item.photo_url} alt="" className="w-full h-40 object-cover" />
              )}
              <div className="p-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">{item.name}</div>
                    {item.description && <p className="text-xs text-white/40 mt-0.5">{item.description}</p>}
                  </div>
                  <span className="text-[var(--cyan)] font-bold text-sm flex-shrink-0 ml-3">${item.price}</span>
                </div>

                {requesting === item.id ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <input type="text" value={size} onChange={(e) => setSize(e.target.value)} placeholder="Talla (S, M, L, XL...)"
                        className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/20 focus:outline-none focus:border-[var(--cyan)]/30" />
                      <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
                        className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white focus:outline-none [color-scheme:dark]">
                        {[1,2,3,4,5].map((n) => <option key={n} value={n} className="bg-[#111]">{n}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleRequest(item.id)}
                        className="flex-1 py-2 rounded-lg bg-[var(--cyan)] text-[#0a0a0a] text-xs font-semibold">
                        Confirmar
                      </button>
                      <button onClick={() => setRequesting(null)}
                        className="px-4 py-2 rounded-lg bg-white/[0.04] text-white/40 text-xs">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setRequesting(item.id)}
                    className="mt-3 w-full py-2 rounded-lg bg-[var(--cyan)]/10 text-[var(--cyan)] text-xs font-semibold hover:bg-[var(--cyan)]/20 transition-colors">
                    Solicitar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <button onClick={() => navigate('/app/club/merch/requests')}
          className="w-full mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white/60 hover:bg-white/[0.04] transition-colors">
          📋 Ver solicitudes
        </button>
      )}
    </div>
  )
}
