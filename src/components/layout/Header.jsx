import { useState } from 'react'
import { ChevronLeft, LogOut, UserCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function Header({ title, subtitle, onBack, right }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()
  const [confirmandoSalida, setConfirmandoSalida] = useState(false)

  const handleSignOut = async () => {
    setConfirmandoSalida(false)
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="safe-top sticky top-0 z-20 flex items-center gap-2 border-b border-ink-100 bg-white/90 px-3 py-3 backdrop-blur">
      {onBack !== false && onBack !== undefined ? (
        <button
          onClick={onBack === true ? () => navigate(-1) : onBack}
          className="tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink-600 active:bg-ink-100"
          aria-label="Volver"
        >
          <ChevronLeft size={22} />
        </button>
      ) : (
        <div className="w-1" />
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[17px] font-semibold text-ink-900">{title}</h1>
        {subtitle && <p className="truncate text-[12px] text-ink-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1">
        {right}
        {location.pathname !== '/perfil' && (
          <button
            onClick={() => navigate('/perfil')}
            className="tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
            aria-label="Mi perfil"
          >
            <UserCircle size={19} />
          </button>
        )}
        <button
          onClick={() => setConfirmandoSalida(true)}
          className="tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmandoSalida}
        icon={LogOut}
        title="¿Cerrar sesión?"
        description="Vas a salir de tu cuenta. Podrás iniciar sesión de nuevo cuando quieras."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        onConfirm={handleSignOut}
        onCancel={() => setConfirmandoSalida(false)}
      />
    </header>
  )
}
