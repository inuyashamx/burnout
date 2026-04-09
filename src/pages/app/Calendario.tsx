import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClub, useClubEvents } from '../../lib/hooks'

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function Calendario() {
  const { club } = useClub()
  const { events, loading } = useClubEvents(club?.id)
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const navigate = useNavigate()

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7 // Monday start
  const daysInMonth = lastDay.getDate()

  const eventsByDay: Record<number, typeof events> = {}
  events.forEach((e) => {
    const d = new Date(e.date_time)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!eventsByDay[day]) eventsByDay[day] = []
      eventsByDay[day].push(e)
    }
  })

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const monthName = viewDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  // Show all events for this month, or filter by selected day
  const monthEvents = events
    .filter((e) => {
      const d = new Date(e.date_time)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())

  const displayEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : monthEvents

  return (
    <div className="p-5">
      <h1 className="font-display text-2xl tracking-tight text-white mb-4">CALENDARIO</h1>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 text-white/40 hover:text-white/70 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="font-medium text-sm text-white capitalize">{monthName}</span>
        <button onClick={nextMonth} className="p-2 text-white/40 hover:text-white/70 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-[10px] tracking-wider text-white/25 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const hasEvents = !!eventsByDay[day]
          const selected = selectedDay === day

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(selected ? null : day)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors relative ${
                selected
                  ? 'bg-[var(--cyan)]/15 text-[var(--cyan)] font-bold'
                  : isToday(day)
                    ? 'bg-[var(--cyan)]/10 text-[var(--cyan)] font-bold'
                    : 'text-white/60 hover:bg-white/[0.04]'
              }`}
            >
              {day}
              {hasEvents && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--cyan)]" />
              )}
            </button>
          )
        })}
      </div>

      {/* Events list */}
      <div>
        {selectedDay && (
          <button onClick={() => setSelectedDay(null)} className="text-xs text-[var(--cyan)] hover:underline mb-2">
            ← Ver todos los eventos
          </button>
        )}

        <div className="text-[10px] tracking-widest uppercase text-white/25 mb-2">
          {selectedDay ? `Eventos del ${selectedDay}` : 'Eventos del mes'}
        </div>

        {displayEvents.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No hay eventos{selectedDay ? ' este día' : ' este mes'}</p>
        ) : (
          <div className="space-y-2">
            {displayEvents.map((e) => {
              const dt = new Date(e.date_time)
              const dateLabel = dt.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' })
              const time = dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
              return (
                <div
                  key={e.id}
                  onClick={() => navigate(`/app/club/events/${e.id}`)}
                  className="p-3 rounded-xl bg-[var(--cyan)]/[0.04] border-l-[3px] border-[var(--cyan)] cursor-pointer hover:bg-[var(--cyan)]/[0.07] transition-colors"
                >
                  <div className="font-semibold text-sm text-white">{e.title}</div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {!selectedDay && <span className="capitalize">{dateLabel} · </span>}
                    {time}
                    {e.location && ` · ${e.location}`}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {loading && <p className="text-white/30 text-sm text-center py-4">Cargando...</p>}
    </div>
  )
}
