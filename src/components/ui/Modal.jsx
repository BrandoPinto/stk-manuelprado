import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ open, title, onClose, children }) {
  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-[380px] overflow-y-auto rounded-xl2 bg-white p-4 pb-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[16px] font-semibold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="tap-scale rounded-full p-1.5 text-ink-500 active:bg-ink-100"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
