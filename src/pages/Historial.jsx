import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ErrorState from '../components/ui/ErrorState'
import { Input, Select } from '../components/ui/Input'
import { useHistorialCitas } from '../hooks/useCitas'
import { usePresidentes } from '../hooks/usePresidentes'
import { formatHora } from '../lib/constants'

const POR_PAGINA = 15

function etiquetaFecha(fecha) {
  const label = format(new Date(fecha + 'T00:00:00'), "EEEE dd 'de' MMMM yyyy", { locale: es })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function Historial() {
  const navigate = useNavigate()
  const hoy = format(new Date(), 'yyyy-MM-dd')

  const [pagina, setPagina] = useState(0)
  const [busquedaInput, setBusquedaInput] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroPresidente, setFiltroPresidente] = useState('todos')
  const [filtroModalidad, setFiltroModalidad] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const { data: presidentes } = usePresidentes()

  // La búsqueda espera a que se deje de escribir antes de consultar
  useEffect(() => {
    const t = setTimeout(() => {
      setBusqueda(busquedaInput)
      setPagina(0)
    }, 350)
    return () => clearTimeout(t)
  }, [busquedaInput])

  const cambiarFiltro = (setter) => (e) => {
    setter(e.target.value)
    setPagina(0)
  }

  const { data, isLoading, isFetching, isError, refetch } = useHistorialCitas({
    hasta: hoy,
    pagina,
    porPagina: POR_PAGINA,
    busqueda,
    presidenteId: filtroPresidente,
    modalidad: filtroModalidad,
    estado: filtroEstado,
  })

  const citas = data?.citas ?? []
  const total = data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  // Si tras eliminar citas la página actual queda vacía, volver a la última
  useEffect(() => {
    if (data && pagina > 0 && citas.length === 0) setPagina(totalPaginas - 1)
  }, [data, pagina, citas.length, totalPaginas])

  // Agrupar por fecha (las citas ya vienen ordenadas de más reciente a más antigua)
  const grupos = []
  citas.forEach((c) => {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.fecha === c.fecha) ultimo.citas.push(c)
    else grupos.push({ fecha: c.fecha, citas: [c] })
  })

  const irA = (n) => {
    setPagina(n)
    window.scrollTo?.({ top: 0 })
  }

  return (
    <AppLayout title="Historial" onBack={false}>
      <div className="mb-3 flex flex-col gap-2">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input
            value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)}
            placeholder="Buscar por nombre o barrio"
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Select value={filtroPresidente} onChange={cambiarFiltro(setFiltroPresidente)}>
            <option value="todos">Presidente</option>
            {presidentes?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Select>
          <Select value={filtroModalidad} onChange={cambiarFiltro(setFiltroModalidad)}>
            <option value="todas">Modalidad</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </Select>
          <Select value={filtroEstado} onChange={cambiarFiltro(setFiltroEstado)}>
            <option value="todos">Estado</option>
            <option value="realizada">Se dio</option>
            <option value="no_realizada">No se dio</option>
            <option value="pendiente">Pendiente</option>
          </Select>
        </div>
      </div>

      {isLoading && !isError && (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      )}

      {isError && (
        <ErrorState message="No se pudo cargar el historial. Revisa tu conexión." onRetry={refetch} />
      )}

      {!isLoading && !isError && total === 0 && (
        <p className="mt-8 text-center text-sm text-ink-500">No se encontraron citas.</p>
      )}

      {!isError && total > 0 && (
        <p className="mb-2 px-1 text-[12px] text-ink-400">
          {total} cita{total !== 1 ? 's' : ''}
        </p>
      )}

      <div className={`transition-opacity ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {!isError &&
          grupos.map((g) => (
            <section key={g.fecha} className="mb-4">
              <h2 className="mb-2 px-1 font-display text-[13px] font-semibold text-ink-700">
                {etiquetaFecha(g.fecha)}
              </h2>
              <div className="flex flex-col gap-2">
                {g.citas.map((c) => (
                  <Card
                    key={c.id}
                    className="tap-scale cursor-pointer"
                    onClick={() => navigate(`/citas/${c.id}/editar`, { state: { cita: c } })}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-ink-900">{c.nombre_persona}</span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {c.estado === 'realizada' && (
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700"
                            title="Se dio"
                          >
                            <Check size={14} />
                          </span>
                        )}
                        {c.estado === 'no_realizada' && (
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700"
                            title="No se dio"
                          >
                            <X size={14} />
                          </span>
                        )}
                        <Badge tone={c.modalidad === 'virtual' ? 'brand' : 'ocupado'}>{c.modalidad}</Badge>
                      </div>
                    </div>
                    <p className="mt-1 text-[12.5px] text-ink-500">
                      {formatHora(c.hora)} · {c.presidentes?.nombre}
                      {c.barrio ? ` · ${c.barrio}` : ''}
                    </p>
                    {c.creador?.nombre && (
                      <p className="text-[11px] text-ink-400">Agendado por {c.creador.nombre}</p>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          ))}
      </div>

      {!isError && totalPaginas > 1 && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <Button variant="secondary" icon={ChevronLeft} disabled={pagina === 0} onClick={() => irA(pagina - 1)}>
            Anterior
          </Button>
          <span className="text-[13px] text-ink-500">
            {pagina + 1} / {totalPaginas}
          </span>
          <Button
            variant="secondary"
            disabled={pagina >= totalPaginas - 1}
            onClick={() => irA(pagina + 1)}
          >
            Siguiente <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </AppLayout>
  )
}
