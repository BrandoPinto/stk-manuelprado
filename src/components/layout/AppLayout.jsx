import Header from './Header'
import BottomNav from './BottomNav'

export default function AppLayout({ title, subtitle, onBack, right, children, hideNav = false }) {
  return (
    <div className="app-shell">
      <Header title={title} subtitle={subtitle} onBack={onBack} right={right} />
      <main className="scroll-area flex-1 overflow-y-auto px-3 pb-4 pt-3">{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
