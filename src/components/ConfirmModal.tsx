interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4" onClick={onCancel}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-2xl bg-[#1a1a1a] border border-white/[0.08] p-5 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl text-white mb-2">{title}</h3>
        <p className="text-sm text-white/50 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg bg-white/[0.06] text-white/50 text-sm font-medium hover:bg-white/[0.1] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              danger
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-[var(--cyan)] text-[#0a0a0a] hover:brightness-110'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
