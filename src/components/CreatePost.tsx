import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function CreatePost({ clubId, onCreated }: { clubId: string; onCreated: () => void }) {
  const { session } = useAuth()
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [posting, setPosting] = useState(false)

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? [])
    const combined = [...photos, ...newFiles].slice(0, 4)
    setPhotos(combined)
    setPreviews(combined.map((f) => URL.createObjectURL(f)))
    e.target.value = ''
  }

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handlePost = async () => {
    if (!content.trim() && photos.length === 0) return
    if (!session?.user.id) return

    setPosting(true)

    const photoUrls: string[] = []
    for (const photo of photos) {
      const ext = photo.name.split('.').pop()
      const path = `${session.user.id}/posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, photo)
      if (!error) {
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        photoUrls.push(data.publicUrl)
      }
    }

    await supabase.from('posts').insert({
      club_id: clubId,
      user_id: session.user.id,
      content: content.trim() || null,
      photos: photoUrls,
    })

    setContent('')
    setPhotos([])
    setPreviews([])
    setPosting(false)
    onCreated()
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Qué está pasando?"
        rows={2}
        className="w-full bg-transparent text-white text-sm placeholder-white/25 resize-none focus:outline-none"
      />

      {previews.length > 0 && (
        <div className="flex gap-2 mt-2 mb-2">
          {previews.map((src, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-0 right-0 w-5 h-5 bg-black/70 rounded-bl flex items-center justify-center text-white/70 text-xs hover:text-red-400"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
        <label className="flex items-center gap-1.5 text-white/30 hover:text-[var(--cyan)] transition-colors cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
          </svg>
          <span className="text-xs">Foto</span>
          <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
        </label>

        <button
          onClick={handlePost}
          disabled={posting || (!content.trim() && photos.length === 0)}
          className="px-4 py-1.5 rounded-lg bg-[var(--cyan)] text-[#0a0a0a] text-xs font-semibold disabled:opacity-30 transition-opacity"
        >
          {posting ? '...' : 'Publicar'}
        </button>
      </div>
    </div>
  )
}
