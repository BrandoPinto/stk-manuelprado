import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import ErrorState from '../components/ui/ErrorState'
import { useCitasPorRango } from '../hooks/useCitas'
import { formatHora } from '../lib/constants'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'

export default function Semana() {
  const navigate = useNavigate()
  const [refDate, setRefDate] = useState(new Date())

  // Semana de lunes a domingo, mostrando principalmente martes/miércoles
  const inicioSemana = startOfWeek(refDate, { weekStartsOn: 1 })
  const dias = [1, 2].map((offset) => addDays(inicioSemana, offset)) // martes, miércoles

  const fechaInicio = format(dias[0], 'yyyy-MM-dd')
  const fechaFin = format(dias[dias.length - 1], 'yyyy-MM-dd')

  const { data: citas, isLoading, isError, refetch } = useCitasPorRango(fechaInicio, fechaFin)

  const citasPorDia = useMemo(() => {
    const map = {}
    dias.forEach((d) => (map[format(d, 'yyyy-MM-dd')] = []))
    ;(citas ?? []).forEach((c) => {
      if (map[c.fecha]) map[c.fecha].push(c)
    })
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citas])

  const agruparPorPresidente = (lista) => {
    const map = new Map()
    lista.forEach((c) => {
      const key = c.presidentes?.nombre ?? 'Sin presidente'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(c)
    })
    return Array.from(map.entries())
  }

  return (
    <AppLayout title="Agenda semanal" onBack={false}>
      <div className="mb-3 flex items-center justify-between rounded-xl2 border border-ink-100 bg-white p-2 shadow-card">
        <button
          onClick={() => setRefDate((d) => addDays(d, -7))}
          className="tap-scale flex h-10 w-10 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="text-[13px] font-medium text-ink-600">
          Semana del {format(dias[0], 'dd MMM', { locale: es })}
        </p>
        <button
          onClick={() => setRefDate((d) => addDays(d, 7))}
          className="tap-scale flex h-10 w-10 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {isLoading && !isError && (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      )}

      {isError && (
        <ErrorState message="No se pudo cargar la semana. Revisa tu conexión." onRetry={refetch} />
      )}

      {!isLoading &&
        !isError &&
        dias.map((d) => {
          const key = format(d, 'yyyy-MM-dd')
          const lista = citasPorDia[key] ?? []
          const label = format(d, "EEEE dd 'de' MMMM", { locale: es })

          return (
            <div key={key} className="mb-4">
              <h2 className="mb-2 px-1 font-display text-[14px] font-semibold text-ink-800">
                {label.charAt(0).toUpperCase() + label.slice(1)}
                <span className="ml-2 text-[12px] font-normal text-ink-400">
                  {lista.length} cita{lista.length !== 1 ? 's' : ''}
                </span>
              </h2>

              {lista.length === 0 ? (
                <Card className="text-center text-[13px] text-ink-400">Sin citas agendadas</Card>
              ) : (
                agruparPorPresidente(lista).map(([nombrePresidente, citasPresidente]) => (
                  <Card key={nombrePresidente} className="mb-2">
                    <div className="mb-2 flex items-center gap-2">
                      <User size={14} className="text-ink-500" />
                      <span className="text-[13px] font-semibold text-ink-800">{nombrePresidente}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {citasPresidente
                        .sort((a, b) => a.hora.localeCompare(b.hora))
                        .map((c) => (
                          <button
                            key={c.id}
                            onClick={() => navigate(`/citas/${c.id}/editar`, { state: { cita: c } })}
                            className="tap-scale flex items-center justify-between rounded-lg bg-ink-50 px-2.5 py-2 text-left"
                          >
                            <span className="text-[13px] text-ink-700">
                              <strong className="font-semibold">{formatHora(c.hora)}</strong> · {c.nombre_persona}
                            </span>
                            <Badge tone={c.modalidad === 'virtual' ? 'brand' : 'ocupado'}>
                              {c.modalidad}
                            </Badge>
                          </button>
                        ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )
        })}
    </AppLayout>
  )
}
