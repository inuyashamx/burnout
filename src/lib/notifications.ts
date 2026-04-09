import { supabase } from './supabase'

// Request push permission on first load
export async function requestPushPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// Show a browser notification (when app is open)
export function showBrowserNotification(title: string, body: string) {
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  } catch {
    // Fallback for mobile — use service worker
    navigator.serviceWorker?.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      })
    })
  }
}

// --- Notification creators ---

export async function notifyNewEvent(clubId: string, eventTitle: string, eventId: string, eventDate: string) {
  // Get all club members
  const { data: members } = await supabase
    .from('club_members')
    .select('user_id')
    .eq('club_id', clubId)

  if (!members) return

  const notifications = members.map((m) => ({
    user_id: m.user_id,
    type: 'new_event',
    title: 'Nuevo evento',
    body: `${eventTitle} — ${new Date(eventDate).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}`,
    data: { event_id: eventId, club_id: clubId },
  }))

  await supabase.from('notifications').insert(notifications)
  showBrowserNotification('Nuevo evento', eventTitle)
}

export async function notifyMemberJoined(clubId: string, nickname: string) {
  // Notify leaders and admins
  const { data: admins } = await supabase
    .from('club_members')
    .select('user_id')
    .eq('club_id', clubId)
    .in('role', ['leader', 'admin'])

  if (!admins) return

  const notifications = admins.map((a) => ({
    user_id: a.user_id,
    type: 'member_joined',
    title: 'Nuevo miembro',
    body: `@${nickname} se unió al club`,
    data: { club_id: clubId },
  }))

  await supabase.from('notifications').insert(notifications)
}

export async function notifyBirthday(clubId: string, nickname: string, birthdayUserId: string) {
  const { data: members } = await supabase
    .from('club_members')
    .select('user_id')
    .eq('club_id', clubId)
    .neq('user_id', birthdayUserId)

  if (!members) return

  const notifications = members.map((m) => ({
    user_id: m.user_id,
    type: 'birthday',
    title: '¡Cumpleaños!',
    body: `¡Hoy es cumple de @${nickname}!`,
    data: { club_id: clubId },
  }))

  await supabase.from('notifications').insert(notifications)
}
