import { useNavigate } from 'react-router-dom'
import { useClub, useClubMembers } from '../../lib/hooks'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function Birthdays() {
  const { club } = useClub()
  const { members } = useClubMembers(club?.id)
  const navigate = useNavigate()

  const today = new Date()
  const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Group by month
  const byMonth: Record<number, typeof members> = {}
  members.forEach((m) => {
    if (!m.profiles?.birthday) return
    const month = parseInt(m.profiles.birthday.slice(5, 7)) - 1
    if (!byMonth[month]) byMonth[month] = []
    byMonth[month].push(m)
  })

  // Sort each month's members by day
  Object.values(byMonth).forEach((arr) =>
    arr.sort((a, b) => {
      const dayA = parseInt(a.profiles.birthday.slice(8, 10))
      const dayB = parseInt(b.profiles.birthday.slice(8, 10))
      return dayA - dayB
    })
  )

  return (
    <div className="p-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <h1 className="font-display text-2xl tracking-tight text-white mb-6">🎂 CUMPLEAÑOS</h1>

      {Array.from({ length: 12 }, (_, i) => i).map((monthIdx) => {
        const monthMembers = byMonth[monthIdx]
        if (!monthMembers || monthMembers.length === 0) return null

        return (
          <div key={monthIdx} className="mb-5">
            <div className="text-xs tracking-widest uppercase text-[var(--cyan)] mb-2">{MONTHS[monthIdx]}</div>
            <div className="space-y-1.5">
              {monthMembers.map((m) => {
                const day = parseInt(m.profiles.birthday.slice(8, 10))
                const mmdd = m.profiles.birthday.slice(5)
                const isToday = mmdd === todayStr

                return (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                      isToday ? 'bg-[var(--cyan)]/[0.06] border border-[var(--cyan)]/20' : 'bg-white/[0.02]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--cyan)]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {m.profiles.avatar_url ? (
                        <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[var(--cyan)]">{m.profiles.nickname[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">@{m.profiles.nickname}</div>
                      <div className="text-xs text-white/30">{day} de {MONTHS[monthIdx]}</div>
                    </div>
                    {isToday && <span className="text-lg">🎉</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
