import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Settings, Plus, Copy, Check } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import DaySelector from '../components/agenda/DaySelector'
import PresidenteCard from '../components/agenda/PresidenteCard'
import { usePresidentes } from '../hooks/usePresidentes'
import { useCitasPorFecha } from '../hooks/useCitas'
import { useAuth } from '../context/AuthContext'
import { construirTextoAgendaWhatsApp, copiarAlPortapapeles } from '../lib/whatsapp'
import { proximoDiaEntrevistas } from '../lib/constants'

export default function Agenda() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [fecha, setFecha] = useState(() => format(proximoDiaEntrevistas(), 'yyyy-MM-dd'))
  const [copiado, setCopiado] = useState(false)

  const { data: todosPresidentes, isLoading: cargandoPresidentes } = usePresidentes()
  const { data: citas, isLoading: cargandoCitas } = useCitasPorFecha(fecha)

  const citasPorPresidente = (presidenteId) =>
    (citas ?? []).filter((c) => c.presidente_id === presidenteId)

  // Mostrar presidentes activos + los inactivos que igual tengan
  // citas agendadas ese día, para no perderlas de vista.
  const presidentes = useMemo(() => {
    const lista = todosPresidentes ?? []
    return lista.filter((p) => p.activo || citasPorPresidente(p.id).length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todosPresidentes, citas])

  const irACrear = () => {
    navigate('/nueva-cita', { state: { fecha } })
  }

  const copiarParaWhatsApp = async () => {
    const texto = construirTextoAgendaWhatsApp(fecha, presidentes ?? [], citasPorPresidente)
    await copiarAlPortapapeles(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1800)
  }

  const irAEditar = (cita) => {
    navigate(`/citas/${cita.id}/editar`, { state: { cita } })
  }

  const cargando = cargandoPresidentes || cargandoCitas

  return (
    <AppLayout
      title="Agenda"
      onBack={false}
      right={
        <div className="flex items-center gap-1">
          <button
            onClick={copiarParaWhatsApp}
            disabled={cargandoPresidentes || cargandoCitas}
            className="tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink-500 active:bg-ink-100 disabled:text-ink-200"
            aria-label="Copiar agenda para WhatsApp"
          >
            {copiado ? <Check size={18} className="text-brand-600" /> : <Copy size={18} />}
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate('/presidentes')}
              className="tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
              aria-label="Gestionar presidentes"
            >
              <Settings size={19} />
            </button>
          )}
        </div>
      }
    >
      <DaySelector fecha={fecha} onChange={setFecha} />

      {cargando && (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      )}

      {!cargando && presidentes?.length === 0 && (
        <p className="mt-8 text-center text-sm text-ink-500">
          No hay presidentes activos. Agrégalos desde la sección de Presidentes.
        </p>
      )}

      {!cargando &&
        presidentes?.map((presidente) => (
          <PresidenteCard
            key={presidente.id}
            presidente={presidente}
            citas={citasPorPresidente(presidente.id)}
            onEditar={irAEditar}
          />
        ))}

      <button
        onClick={irACrear}
        className="tap-scale absolute bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg active:bg-brand-700"
        aria-label="Nueva cita"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
    </AppLayout>
  )
}
