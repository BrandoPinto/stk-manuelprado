import { createPortal } from 'react-dom'
import Button from './Button'

const iconTones = {
  danger: 'bg-red-50 text-red-600',
  primary: 'bg-brand-50 text-brand-600',
  secondary: 'bg-ink-100 text-ink-600',
  ghost: 'bg-ink-100 text-ink-600',
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  icon: Icon,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-5"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[300px] rounded-xl2 bg-white p-5 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {Icon && (
          <span
            className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconTones[variant] ?? iconTones.danger}`}
          >
            <Icon size={22} />
          </span>
        )}
        <h2 className="font-display text-[16px] font-semibold text-ink-900">{title}</h2>
        {description && <p className="mt-1.5 text-[13.5px] leading-snug text-ink-500">{description}</p>}

        <div className="mt-5 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={variant} className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
