import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, History as HistoryIcon } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { useCitasPorRango } from '../hooks/useCitas'
import { usePresidentes } from '../hooks/usePresidentes'
import { formatHora } from '../lib/constants'

const RANGO_INICIAL_MESES = 3
const RANGO_INCREMENTO_MESES = 3

export default function Historial() {
  const navigate = useNavigate()
  const hoy = format(new Date(), 'yyyy-MM-dd')
  const [mesesAtras, setMesesAtras] = useState(RANGO_INICIAL_MESES)
  const desde = format(subMonths(new Date(), mesesAtras), 'yyyy-MM-dd')

  const { data: citas, isLoading, isFetching } = useCitasPorRango(desde, hoy)
  const { data: presidentes } = usePresidentes()

  const [busqueda, setBusqueda] = useState('')
  const [filtroPresidente, setFiltroPresidente] = useState('todos')
  const [filtroModalidad, setFiltroModalidad] = useState('todas')

  const filtradas = useMemo(() => {
    return (citas ?? [])
      .filter((c) => c.fecha <= hoy)
      .filter((c) =>
        busqueda
          ? c.nombre_persona.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.barrio?.toLowerCase().includes(busqueda.toLowerCase())
          : true
      )
      .filter((c) => (filtroPresidente === 'todos' ? true : c.presidente_id === filtroPresidente))
      .filter((c) => (filtroModalidad === 'todas' ? true : c.modalidad === filtroModalidad))
      .sort((a, b) => (a.fecha + a.hora < b.fecha + b.hora ? 1 : -1))
  }, [citas, busqueda, filtroPresidente, filtroModalidad, hoy])

  return (
    <AppLayout title="Historial" onBack={false}>
      <div className="mb-3 flex flex-col gap-2">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o barrio"
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={filtroPresidente} onChange={(e) => setFiltroPresidente(e.target.value)}>
            <option value="todos">Todos los presidentes</option>
            {presidentes?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Select>
          <Select value={filtroModalidad} onChange={(e) => setFiltroModalidad(e.target.value)}>
            <option value="todas">Toda modalidad</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      )}

      {!isLoading && filtradas.length === 0 && (
        <p className="mt-8 text-center text-sm text-ink-500">No se encontraron citas.</p>
      )}

      <div className="flex flex-col gap-2">
        {filtradas.map((c) => (
          <Card
            key={c.id}
            className="tap-scale cursor-pointer"
            onClick={() => navigate(`/citas/${c.id}/editar`, { state: { cita: c } })}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-ink-900">{c.nombre_persona}</span>
              <Badge tone={c.modalidad === 'virtual' ? 'brand' : 'ocupado'}>{c.modalidad}</Badge>
            </div>
            <p className="mt-1 text-[12.5px] text-ink-500">
              {format(new Date(c.fecha + 'T00:00:00'), "dd MMM yyyy", { locale: es })} · {formatHora(c.hora)} ·{' '}
              {c.presidentes?.nombre}
            </p>
            {c.barrio && <p className="text-[12.5px] text-ink-500">{c.barrio}</p>}
          </Card>
        ))}
      </div>

      {!isLoading && (
        <Button
          variant="secondary"
          icon={HistoryIcon}
          loading={isFetching}
          onClick={() => setMesesAtras((m) => m + RANGO_INCREMENTO_MESES)}
          className="mt-3 w-full"
        >
          Cargar más antiguo
        </Button>
      )}
    </AppLayout>
  )
}
