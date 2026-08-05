const variants = {
  primary: 'bg-brand-600 text-white active:bg-brand-700 disabled:bg-ink-200 disabled:text-ink-400',
  secondary: 'bg-white text-ink-900 border border-ink-200 active:bg-ink-50',
  danger: 'bg-red-50 text-red-600 border border-red-200 active:bg-red-100',
  ghost: 'bg-transparent text-ink-600 active:bg-ink-100',
}

const sizes = {
  md: 'h-12 px-4 text-[15px]',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-14 px-6 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  loading = false,
  ...props
}) {
  return (
    <button
      className={`tap-scale inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-colors disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        Icon && <Icon size={18} strokeWidth={2.25} />
      )}
      {children}
    </button>
  )
}
