import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import ConfirmModal from './ConfirmModal'
import NickLink from './NickLink'
import type { Post, PostReaction, PostComment, ReactionType } from '../lib/types'

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: 'like', emoji: '👍' },
  { type: 'fire', emoji: '🔥' },
  { type: 'laugh', emoji: '😂' },
  { type: 'angry', emoji: '😤' },
  { type: 'poop', emoji: '💩' },
]

export default function PostCard({ post, onDeleted }: { post: Post; onDeleted?: () => void }) {
  const { session } = useAuth()
  const [reactions, setReactions] = useState<PostReaction[]>([])
  const [comments, setComments] = useState<PostComment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showReactions, setShowReactions] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const userId = session?.user.id
  const isMyPost = userId === post.user_id

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

  const handleDeletePost = async () => {
    await supabase.from('posts').delete().eq('id', post.id)
    setShowDeleteConfirm(false)
    onDeleted?.()
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {showDeleteConfirm && (
        <ConfirmModal title="Eliminar publicación" message="¿Eliminar esta publicación?" confirmLabel="Eliminar" danger onConfirm={handleDeletePost} onCancel={() => setShowDeleteConfirm(false)} />
      )}
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
          {post.profiles && <NickLink userId={post.user_id} nickname={post.profiles.nickname} className="text-sm text-white" />}
          <span className="text-xs text-white/25 ml-2">{timeAgo}</span>
        </div>
        {isMyPost && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-white/20 hover:text-red-400 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
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
                {c.profiles && <NickLink userId={c.user_id} nickname={c.profiles.nickname} className="text-xs text-white/70" />}
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
