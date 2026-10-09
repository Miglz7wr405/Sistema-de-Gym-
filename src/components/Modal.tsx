import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({
  children,
  onClose,
  title,
}: {
  children: ReactNode
  onClose: () => void
  title?: string
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-ink-850 p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{title}</h2>
            <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-white/10">
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
