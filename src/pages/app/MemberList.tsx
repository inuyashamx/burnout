import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useClub, useClubMembers } from '../../lib/hooks'
import { supabase } from '../../lib/supabase'

const ROLE_LABELS: Record<string, string> = {
  leader: 'Líder',
  admin: 'Admin',
  member: 'Miembro',
}

const ROLE_COLORS: Record<string, string> = {
  leader: 'bg-[var(--cyan)]/20 text-[var(--cyan)]',
  admin: 'bg-yellow-500/20 text-yellow-400',
  member: 'bg-white/[0.06] text-white/40',
}

export default function MemberList() {
  const { membership } = useAuth()
  const { club } = useClub()
  const { members, refresh } = useClubMembers(club?.id)
  const navigate = useNavigate()
  const isLeader = membership?.role === 'leader'

  const handleRemove = async (memberId: string) => {
    await supabase.from('club_members').delete().eq('id', memberId)
    refresh()
  }

  const handlePromote = async (memberId: string, newRole: 'admin' | 'member') => {
    await supabase.from('club_members').update({ role: newRole }).eq('id', memberId)
    refresh()
  }

  return (
    <div className="p-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <h1 className="font-display text-2xl tracking-tight text-white mb-4">
        MIEMBROS <span className="text-white/30">({members.length})</span>
      </h1>

      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-10 h-10 rounded-full bg-[var(--cyan)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {m.profiles.avatar_url ? (
                <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-[var(--cyan)]">
                  {m.profiles.nickname[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">@{m.profiles.nickname}</div>
              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-semibold ${ROLE_COLORS[m.role]}`}>
                {ROLE_LABELS[m.role]}
              </span>
            </div>
            {isLeader && m.role !== 'leader' && (
              <div className="flex gap-1 flex-shrink-0">
                {m.role === 'member' ? (
                  <button
                    onClick={() => handlePromote(m.id, 'admin')}
                    className="px-2 py-1 rounded text-[10px] bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                  >
                    Admin
                  </button>
                ) : (
                  <button
                    onClick={() => handlePromote(m.id, 'member')}
                    className="px-2 py-1 rounded text-[10px] bg-white/[0.04] text-white/40 hover:bg-white/[0.08] transition-colors"
                  >
                    Quitar admin
                  </button>
                )}
                <button
                  onClick={() => handleRemove(m.id)}
                  className="px-2 py-1 rounded text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Sacar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
