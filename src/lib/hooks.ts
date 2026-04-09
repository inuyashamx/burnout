import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'
import type { Club, ClubMemberWithProfile, EventRow, EventRsvp, Car, Notification } from './types'

export function useClub() {
  const { membership } = useAuth()
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!membership?.club_id) { setLoading(false); return }
    supabase
      .from('clubs')
      .select('*')
      .eq('id', membership.club_id)
      .single()
      .then(({ data }) => { setClub(data); setLoading(false) })
  }, [membership?.club_id])

  return { club, loading }
}

export function useClubMembers(clubId: string | undefined) {
  const [members, setMembers] = useState<ClubMemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clubId) { setLoading(false); return }
    supabase
      .from('club_members')
      .select('*, profiles(*)')
      .eq('club_id', clubId)
      .order('joined_at')
      .then(({ data }) => { setMembers((data as ClubMemberWithProfile[]) ?? []); setLoading(false) })
  }, [clubId])

  return { members, loading, refresh: () => {
    if (!clubId) return
    supabase
      .from('club_members')
      .select('*, profiles(*)')
      .eq('club_id', clubId)
      .order('joined_at')
      .then(({ data }) => setMembers((data as ClubMemberWithProfile[]) ?? []))
  }}
}

export function useClubEvents(clubId: string | undefined) {
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    if (!clubId) return
    supabase
      .from('events')
      .select('*')
      .eq('club_id', clubId)
      .order('date_time', { ascending: true })
      .then(({ data }) => { setEvents(data ?? []); setLoading(false) })
  }

  useEffect(() => { refresh() }, [clubId])
  return { events, loading, refresh }
}

export function useEventRsvps(eventId: string | undefined) {
  const [rsvps, setRsvps] = useState<EventRsvp[]>([])

  const refresh = () => {
    if (!eventId) return
    supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .then(({ data }) => setRsvps(data ?? []))
  }

  useEffect(() => { refresh() }, [eventId])
  return { rsvps, refresh }
}

export function useBirthdays(clubId: string | undefined) {
  const [birthdays, setBirthdays] = useState<ClubMemberWithProfile[]>([])

  useEffect(() => {
    if (!clubId) return
    const today = new Date()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')

    supabase
      .from('club_members')
      .select('*, profiles(*)')
      .eq('club_id', clubId)
      .then(({ data }) => {
        const todayBirthdays = ((data as ClubMemberWithProfile[]) ?? []).filter((m) => {
          const b = m.profiles?.birthday
          return b && b.slice(5) === `${mm}-${dd}`
        })
        setBirthdays(todayBirthdays)
      })
  }, [clubId])

  return birthdays
}

export function useMyCars() {
  const { session } = useAuth()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    if (!session?.user.id) return
    supabase
      .from('cars')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at')
      .then(({ data }) => { setCars(data ?? []); setLoading(false) })
  }

  useEffect(() => { refresh() }, [session?.user.id])
  return { cars, loading, refresh }
}

export function useNotifications() {
  const { session } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const refresh = () => {
    if (!session?.user.id) return
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        const items = data ?? []
        setNotifications(items)
        setUnreadCount(items.filter((n) => !n.read).length)
      })
  }

  useEffect(() => { refresh() }, [session?.user.id])

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    refresh()
    window.dispatchEvent(new Event('notifications-updated'))
  }

  const markAllRead = async () => {
    if (!session?.user.id) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id).eq('read', false)
    refresh()
    window.dispatchEvent(new Event('notifications-updated'))
  }

  return { notifications, unreadCount, refresh, markAsRead, markAllRead }
}
