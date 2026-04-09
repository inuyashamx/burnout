import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useClub } from '../../lib/hooks'
import type { MerchRequest } from '../../lib/types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  approved: 'bg-[var(--cyan)]/15 text-[var(--cyan)]',
  delivered: 'bg-green-500/15 text-green-400',
  cancelled: 'bg-red-500/15 text-red-400',
}

export default function MerchRequests() {
  const { club } = useClub()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<MerchRequest[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = () => {
    if (!club?.id) return
    supabase
      .from('merch_requests')
      .select('*, profiles(*), merch_items(*)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        // Filter by club
        const filtered = ((data as MerchRequest[]) ?? []).filter((r) => r.merch_items?.club_id === club.id)
        setRequests(filtered)
        setLoading(false)
      })
  }

  useEffect(() => { loadRequests() }, [club?.id])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('merch_requests').update({ status }).eq('id', id)
    loadRequests()
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

      <h1 className="font-display text-2xl tracking-tight text-white mb-6">📋 SOLICITUDES</h1>

      {requests.length === 0 ? (
        <p className="text-center text-white/30 text-sm py-8">No hay solicitudes</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-white">{r.merch_items?.name}</div>
                  <div className="text-xs text-white/40">
                    @{r.profiles?.nickname} · x{r.quantity}
                    {r.size && ` · Talla: ${r.size}`}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_COLORS[r.status]}`}>
                  {STATUS_LABELS[r.status]}
                </span>
              </div>

              {r.status === 'pending' && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => updateStatus(r.id, 'approved')}
                    className="flex-1 py-1.5 rounded-lg bg-[var(--cyan)]/10 text-[var(--cyan)] text-xs font-semibold">
                    Aprobar
                  </button>
                  <button onClick={() => updateStatus(r.id, 'cancelled')}
                    className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold">
                    Cancelar
                  </button>
                </div>
              )}
              {r.status === 'approved' && (
                <button onClick={() => updateStatus(r.id, 'delivered')}
                  className="w-full mt-2 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-semibold">
                  Marcar entregada
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
