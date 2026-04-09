export default function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#0a0a0a]">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--cyan)] animate-spin" />
      </div>
      <span className="font-display text-lg tracking-wide text-white/40">YCEV</span>
    </div>
  )
}
