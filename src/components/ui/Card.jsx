export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-xl2 border border-ink-100 bg-white p-4 shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
