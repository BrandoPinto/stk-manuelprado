export function Field({ label, children, error }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-600">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`h-12 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[15px]
        text-ink-900 placeholder:text-ink-400 outline-none transition-colors
        focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-[15px]
        text-ink-900 placeholder:text-ink-400 outline-none transition-colors
        focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
      rows={3}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`h-12 w-full appearance-none rounded-xl border border-ink-200 bg-white px-3.5 text-[15px]
        text-ink-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
