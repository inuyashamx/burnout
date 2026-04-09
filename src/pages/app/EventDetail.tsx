import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import type { EventRow, EventRsvp, Profile } from '../../lib/types'

interface RsvpWithProfile extends EventRsvp {
  profiles: Profile
}

export default function EventDetail() {
  const { eventId } = useParams()
  const { session, membership } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState<EventRow | null>(null)
  const [rsvps, setRsvps] = useState<RsvpWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  const userId = session?.user.id
  const canEdit = membership?.role === 'leader' || membership?.role === 'admin'

  useEffect(() => {
    if (!eventId) return
    supabase.from('events').select('*').eq('id', eventId).single()
      .then(({ data }) => { setEvent(data); setLoading(false) })
    loadRsvps()
  }, [eventId])

  const loadRsvps = () => {
    if (!eventId) return
    supabase.from('event_rsvps').select('*, profiles(*)').eq('event_id', eventId)
      .then(({ data }) => setRsvps((data as RsvpWithProfile[]) ?? []))
  }

  const myRsvp = rsvps.find((r) => r.user_id === userId)
  const going = rsvps.filter((r) => r.status === 'going')
  const maybe = rsvps.filter((r) => r.status === 'maybe')
  const notGoing = rsvps.filter((r) => r.status === 'not_going')

  const handleRsvp = async (status: 'going' | 'not_going' | 'maybe') => {
    if (!userId || !eventId) return
    if (myRsvp) {
      if (myRsvp.status === status) {
        await supabase.from('event_rsvps').delete().eq('id', myRsvp.id)
      } else {
        await supabase.from('event_rsvps').update({ status }).eq('id', myRsvp.id)
      }
    } else {
      await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: userId, status })
    }
    loadRsvps()
  }

  if (loading || !event) return <div className="p-5 text-center text-white/30 text-sm pt-20">Cargando...</div>

  const dt = new Date(event.date_time)
  const dateStr = dt.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Volver
        </button>
        {canEdit && (
          <button onClick={() => navigate(`/app/club/events/${eventId}/edit`)} className="text-xs text-[var(--cyan)] hover:underline">
            Editar
          </button>
        )}
      </div>

      {event.banner_url && (
        <img src={event.banner_url} alt="" className="w-full h-40 object-cover rounded-xl mb-4" />
      )}

      <h1 className="font-display text-3xl tracking-tight text-white mb-2">{event.title}</h1>
      <div className="text-sm text-white/40 mb-1 capitalize">{dateStr}</div>
      <div className="text-sm text-white/40 mb-4">{timeStr}{event.location && ` · ${event.location}`}</div>
      {event.description && <p className="text-sm text-white/60 mb-6">{event.description}</p>}

      {/* RSVP buttons */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => handleRsvp('going')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${myRsvp?.status === 'going' ? 'bg-[var(--cyan)] text-[#0a0a0a]' : 'bg-[var(--cyan)]/10 text-[var(--cyan)]'}`}>
          ¡Voy! 🏁
        </button>
        <button onClick={() => handleRsvp('maybe')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${myRsvp?.status === 'maybe' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/[0.04] text-white/40'}`}>
          Tal vez
        </button>
        <button onClick={() => handleRsvp('not_going')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${myRsvp?.status === 'not_going' ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.04] text-white/40'}`}>
          No voy
        </button>
      </div>

      {/* Attendee lists */}
      {going.length > 0 && (
        <RsvpSection label={`Van (${going.length})`} people={going} color="text-[var(--cyan)]" />
      )}
      {maybe.length > 0 && (
        <RsvpSection label={`Tal vez (${maybe.length})`} people={maybe} color="text-yellow-400" />
      )}
      {notGoing.length > 0 && (
        <RsvpSection label={`No van (${notGoing.length})`} people={notGoing} color="text-red-400" />
      )}
    </div>
  )
}

function RsvpSection({ label, people, color }: { label: string; people: RsvpWithProfile[]; color: string }) {
  return (
    <div className="mb-4">
      <div className={`text-xs font-semibold ${color} mb-2`}>{label}</div>
      <div className="flex flex-wrap gap-2">
        {people.map((r) => (
          <div key={r.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] text-xs text-white/60">
            <div className="w-5 h-5 rounded-full bg-[var(--cyan)]/10 flex items-center justify-center overflow-hidden">
              {r.profiles.avatar_url ? (
                <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[8px] font-bold text-[var(--cyan)]">{r.profiles.nickname[0].toUpperCase()}</span>
              )}
            </div>
            @{r.profiles.nickname}
          </div>
        ))}
      </div>
    </div>
  )
}
