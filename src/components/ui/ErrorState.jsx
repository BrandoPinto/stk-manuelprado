import { AlertTriangle } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ message = 'No se pudo cargar la información.', onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-red-100 bg-red-50/60 px-4 py-8 text-center">
      <AlertTriangle size={26} className="text-red-500" />
      <p className="text-[13.5px] text-ink-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
