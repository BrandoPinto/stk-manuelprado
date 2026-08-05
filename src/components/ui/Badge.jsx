const tones = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  ocupado: 'bg-ocupado-50 text-ocupado-700 border-blue-200',
  neutral: 'bg-ink-100 text-ink-600 border-ink-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
