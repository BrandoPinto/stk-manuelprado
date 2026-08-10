import { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function Toast({ message, onDone, duration = 2500 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, duration)
    return () => clearTimeout(t)
  }, [message, onDone, duration])

  if (!message) return null

  return (
    <div className="absolute left-1/2 top-3 z-30 -translate-x-1/2">
      <div className="tap-scale flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-[13.5px] font-medium text-white shadow-lg">
        <CheckCircle2 size={16} className="text-brand-400" />
        {message}
      </div>
    </div>
  )
}
