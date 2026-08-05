import { NavLink } from 'react-router-dom'
import { CalendarDays, PlusCircle, CalendarRange, History, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const baseTabs = [
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/nueva-cita', label: 'Nueva cita', icon: PlusCircle },
  { to: '/semana', label: 'Semana', icon: CalendarRange },
  { to: '/historial', label: 'Historial', icon: History },
]

const adminTab = { to: '/usuarios', label: 'Usuarios', icon: Users }

export default function BottomNav() {
  const { isAdmin } = useAuth()
  const tabs = isAdmin ? [...baseTabs, adminTab] : baseTabs

  return (
    <nav className="safe-bottom sticky bottom-0 z-20 flex border-t border-ink-100 bg-white/95 shadow-nav backdrop-blur">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `tap-scale flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              isActive ? 'text-brand-600' : 'text-ink-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
