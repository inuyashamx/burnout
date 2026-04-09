import { useNavigate } from 'react-router-dom'

export default function NickLink({ userId, nickname, className }: { userId: string; nickname: string; className?: string }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigate(`/app/user/${userId}`) }}
      className={`font-medium hover:underline ${className ?? 'text-[var(--cyan)]'}`}
    >
      @{nickname}
    </button>
  )
}
