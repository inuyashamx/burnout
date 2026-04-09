import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { useClub, useClubMembers, useClubEvents, useEventRsvps, useBirthdays } from '../../lib/hooks'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import CreatePost from '../../components/CreatePost'
import PostCard from '../../components/PostCard'
import type { Post } from '../../lib/types'

export default function Inicio() {
  const { session, membership } = useAuth()
  const { club, loading } = useClub()
  const { members } = useClubMembers(club?.id)
  const { events } = useClubEvents(club?.id)
  const birthdays = useBirthdays(club?.id)
  const [posts, setPosts] = useState<Post[]>([])
  const navigate = useNavigate()

  const loadPosts = () => {
    if (!club?.id) return
    supabase
      .from('posts')
      .select('*, profiles(*)')
      .eq('club_id', club.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => setPosts((data as Post[]) ?? []))
  }

  useEffect(() => { loadPosts() }, [club?.id])

  const now = new Date().toISOString()
  const nextEvent = events.find((e) => e.date_time >= now)

  if (loading) {
    return <div className="p-5 text-center text-white/30 text-sm pt-20">Cargando...</div>
  }

  if (!membership || !club) {
    return (
      <div className="p-5 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="text-4xl mb-4">🚗</span>
        <h2 className="font-display text-2xl text-white mb-2">SIN CLUB</h2>
        <p className="text-white/40 text-sm mb-6">Únete o crea un club para empezar</p>
        <button onClick={() => navigate('/onboarding/camino')} className="btn-cyan rounded">
          Buscar Club
        </button>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-4">
      {/* Club header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[var(--cyan)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {club.logo_url ? (
            <img src={club.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-lg text-[var(--cyan)]">{club.name[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-white truncate">{club.name}</div>
          <div className="text-xs text-white/35">{members.length} miembros</div>
        </div>
        {club.whatsapp_link && (
          <a
            href={club.whatsapp_link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20bd5a] transition-colors flex-shrink-0"
          >
            WhatsApp
          </a>
        )}
      </div>

      {/* Next event */}
      {nextEvent && (
        <NextEventCard event={nextEvent} userId={session?.user.id} />
      )}

      {/* Birthdays */}
      {birthdays.length > 0 && (
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          {birthdays.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <span className="text-xl">🎂</span>
              <div>
                <div className="text-sm text-white">
                  ¡Hoy es cumple de <span className="text-[var(--cyan)] font-medium">@{m.profiles.nickname}</span>!
                </div>
                <div className="text-xs text-white/30">Felicítalo en el grupo</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create post */}
      <CreatePost clubId={club.id} onCreated={loadPosts} />

      {/* Posts feed */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {posts.length === 0 && (
        <p className="text-center text-white/20 text-sm py-4">
          Sé el primero en publicar algo
        </p>
      )}
    </div>
  )
}

function NextEventCard({ event, userId }: { event: { id: string; title: string; date_time: string; location: string | null; event_type: string | null }; userId?: string }) {
  const { rsvps, refresh } = useEventRsvps(event.id)
  const myRsvp = rsvps.find((r) => r.user_id === userId)
  const goingCount = rsvps.filter((r) => r.status === 'going').length

  const handleRsvp = async (status: 'going' | 'not_going' | 'maybe') => {
    if (!userId) return
    if (myRsvp) {
      if (myRsvp.status === status) {
        await supabase.from('event_rsvps').delete().eq('id', myRsvp.id)
      } else {
        await supabase.from('event_rsvps').update({ status }).eq('id', myRsvp.id)
      }
    } else {
      await supabase.from('event_rsvps').insert({ event_id: event.id, user_id: userId, status })
    }
    refresh()
  }

  const dt = new Date(event.date_time)
  const dateStr = dt.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="p-4 rounded-xl bg-[var(--cyan)]/[0.04] border border-[var(--cyan)]/15">
      <div className="text-[10px] tracking-widest uppercase text-[var(--cyan)] mb-1.5">Próximo evento</div>
      <div className="font-semibold text-white mb-1">{event.title}</div>
      <div className="text-xs text-white/40 mb-3">
        {dateStr} · {timeStr}
        {event.location && ` · ${event.location}`}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-white/35">{goingCount} van</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleRsvp('going')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
            myRsvp?.status === 'going'
              ? 'bg-[var(--cyan)] text-[#0a0a0a]'
              : 'bg-[var(--cyan)]/10 text-[var(--cyan)] hover:bg-[var(--cyan)]/20'
          }`}
        >
          ¡Voy! 🏁
        </button>
        <button
          onClick={() => handleRsvp('maybe')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
            myRsvp?.status === 'maybe'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08]'
          }`}
        >
          Tal vez
        </button>
        <button
          onClick={() => handleRsvp('not_going')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
            myRsvp?.status === 'not_going'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08]'
          }`}
        >
          No voy
        </button>
      </div>
    </div>
  )
}
