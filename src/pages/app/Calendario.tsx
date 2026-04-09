import { useState } from 'react'
import { useClub, useClubEvents } from '../../lib/hooks'

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function Calendario() {
  const { club } = useClub()
  const { events, loading } = useClubEvents(club?.id)
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

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

  const selectedEvents = selectedDay ? eventsByDay[selectedDay] ?? [] : []

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

      {/* Selected day events */}
      {selectedDay && (
        <div className="space-y-2">
          {selectedEvents.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">No hay eventos este día</p>
          ) : (
            selectedEvents.map((e) => {
              const dt = new Date(e.date_time)
              const time = dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={e.id} className="p-3 rounded-xl bg-[var(--cyan)]/[0.04] border-l-[3px] border-[var(--cyan)]">
                  <div className="font-semibold text-sm text-white">{e.title}</div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {time}
                    {e.location && ` · ${e.location}`}
                  </div>
                  {e.event_type && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] bg-[var(--cyan)]/10 text-[var(--cyan)]">
                      {e.event_type}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {loading && <p className="text-white/30 text-sm text-center py-4">Cargando...</p>}
    </div>
  )
}
