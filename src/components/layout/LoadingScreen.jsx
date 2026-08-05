export default function LoadingScreen() {
  return (
    <div className="app-shell items-center justify-center overflow-hidden bg-ink-900">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative h-9 w-9 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
    </div>
  )
}
