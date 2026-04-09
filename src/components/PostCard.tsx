import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Post, PostReaction, PostComment, ReactionType } from '../lib/types'

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: 'like', emoji: '👍' },
  { type: 'fire', emoji: '🔥' },
  { type: 'laugh', emoji: '😂' },
  { type: 'angry', emoji: '😤' },
  { type: 'poop', emoji: '💩' },
]

export default function PostCard({ post }: { post: Post }) {
  const { session } = useAuth()
  const [reactions, setReactions] = useState<PostReaction[]>([])
  const [comments, setComments] = useState<PostComment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showReactions, setShowReactions] = useState(false)
  const [commenting, setCommenting] = useState(false)

  const userId = session?.user.id

  useEffect(() => {
    supabase
      .from('post_reactions')
      .select('*')
      .eq('post_id', post.id)
      .then(({ data }) => setReactions(data ?? []))
  }, [post.id])

  const loadComments = () => {
    supabase
      .from('post_comments')
      .select('*, profiles(*)')
      .eq('post_id', post.id)
      .order('created_at')
      .then(({ data }) => setComments((data as PostComment[]) ?? []))
  }

  useEffect(() => {
    if (showComments) loadComments()
  }, [showComments])

  const toggleReaction = async (type: ReactionType) => {
    if (!userId) return
    const existing = reactions.find((r) => r.user_id === userId)

    if (existing) {
      if (existing.type === type) {
        await supabase.from('post_reactions').delete().eq('id', existing.id)
        setReactions((prev) => prev.filter((r) => r.id !== existing.id))
      } else {
        await supabase.from('post_reactions').update({ type }).eq('id', existing.id)
        setReactions((prev) => prev.map((r) => r.id === existing.id ? { ...r, type } : r))
      }
    } else {
      const { data } = await supabase
        .from('post_reactions')
        .insert({ post_id: post.id, user_id: userId, type })
        .select()
        .single()
      if (data) setReactions((prev) => [...prev, data])
    }
    setShowReactions(false)
  }

  const handleComment = async () => {
    if (!newComment.trim() || !userId) return
    setCommenting(true)
    await supabase.from('post_comments').insert({
      post_id: post.id,
      user_id: userId,
      content: newComment.trim(),
    })
    setNewComment('')
    setCommenting(false)
    loadComments()
  }

  const myReaction = reactions.find((r) => r.user_id === userId)
  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count: reactions.filter((rx) => rx.type === r.type).length,
  })).filter((r) => r.count > 0)

  const commentCount = comments.length || 0
  const timeAgo = getTimeAgo(post.created_at)

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 pt-3.5 pb-2">
        <div className="w-9 h-9 rounded-full bg-[var(--cyan)]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {post.profiles?.avatar_url ? (
            <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-[var(--cyan)]">
              {post.profiles?.nickname?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-white">@{post.profiles?.nickname}</span>
          <span className="text-xs text-white/25 ml-2">{timeAgo}</span>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-3.5 pb-2 text-sm text-white/80 whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Photos */}
      {post.photos.length > 0 && (
        <div className={`grid gap-0.5 ${post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-full aspect-square object-cover"
            />
          ))}
        </div>
      )}

      {/* Reaction summary */}
      {reactionCounts.length > 0 && (
        <div className="flex items-center gap-1 px-3.5 pt-2">
          {reactionCounts.map((r) => (
            <span key={r.type} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/[0.04] text-xs">
              {r.emoji} <span className="text-white/40">{r.count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center border-t border-white/[0.04] mt-2">
        {/* React button */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`w-full py-2.5 text-xs font-medium transition-colors ${
              myReaction ? 'text-[var(--cyan)]' : 'text-white/35 hover:text-white/50'
            }`}
          >
            {myReaction ? REACTIONS.find((r) => r.type === myReaction.type)?.emoji : '👍'} Reaccionar
          </button>

          {/* Reaction picker */}
          {showReactions && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 flex gap-1 p-1.5 rounded-full bg-[#1a1a1a] border border-white/10 shadow-xl z-10">
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => toggleReaction(r.type)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg hover:bg-white/10 transition-colors ${
                    myReaction?.type === r.type ? 'bg-[var(--cyan)]/20' : ''
                  }`}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2.5 text-xs font-medium text-white/35 hover:text-white/50 transition-colors border-l border-white/[0.04]"
        >
          💬 {commentCount > 0 ? commentCount : 'Comentar'}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-white/[0.04] px-3.5 py-2.5">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[var(--cyan)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[8px] font-bold text-[var(--cyan)]">
                  {c.profiles?.nickname?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-white/70">@{c.profiles?.nickname}</span>
                <p className="text-xs text-white/50">{c.content}</p>
              </div>
            </div>
          ))}

          {/* New comment input */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Escribe un comentario..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/20 focus:outline-none focus:border-[var(--cyan)]/30"
            />
            <button
              onClick={handleComment}
              disabled={commenting || !newComment.trim()}
              className="px-3 py-2 rounded-lg bg-[var(--cyan)]/10 text-[var(--cyan)] text-xs font-semibold disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}
