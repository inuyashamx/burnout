import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../lib/hooks'
import type { Notification } from '../../lib/types'

const TYPE_ICONS: Record<string, string> = {
  new_event: '📅',
  event_reminder: '⏰',
  member_joined: '👋',
  birthday: '🎂',
  merch_request: '🛍️',
  default: '🔔',
}

function getNotificationRoute(n: Notification): string | null {
  const data = n.data as Record<string, string>
  switch (n.type) {
    case 'new_event':
    case 'event_reminder':
      return data.event_id ? `/app/club/events/${data.event_id}` : '/app/calendario'
    case 'member_joined':
      return '/app/club/members'
    case 'birthday':
      return '/app/club/birthdays'
    case 'merch_request':
      return '/app/club/merch/requests'
    default:
      return null
  }
}

export default function Notifications() {
  const { notifications, markAsRead, markAllRead } = useNotifications()
  const navigate = useNavigate()

  const handleTap = async (n: Notification) => {
    await markAsRead(n.id)
    const route = getNotificationRoute(n)
    if (route) navigate(route)
  }

  return (
    <div className="p-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl tracking-tight text-white">NOTIFICACIONES</h1>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllRead}
            className="text-xs text-[var(--cyan)] hover:underline"
          >
            Marcar todas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">
          No tienes notificaciones
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => {
            const icon = TYPE_ICONS[n.type] ?? TYPE_ICONS.default
            const timeAgo = getTimeAgo(n.created_at)
            const hasRoute = !!getNotificationRoute(n)

            return (
              <button
                key={n.id}
                onClick={() => handleTap(n)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors ${
                  n.read ? 'bg-transparent' : 'bg-[var(--cyan)]/[0.03]'
                } hover:bg-white/[0.03]`}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${n.read ? 'text-white/50' : 'text-white font-medium'}`}>
                    {n.title}
                  </div>
                  {n.body && (
                    <div className="text-xs text-white/30 mt-0.5 truncate">{n.body}</div>
                  )}
                  <div className="text-[10px] text-white/20 mt-1">{timeAgo}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 mt-1.5">
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-[var(--cyan)]" />
                  )}
                  {hasRoute && (
                    <span className="text-white/15 text-xs">→</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}
