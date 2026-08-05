import { useState } from 'react'
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  isToday,
  startOfDay,
  format,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const DIAS_CORTOS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function CalendarPicker({ value, onSelect, onClose }) {
  const seleccionada = parseISO(value)
  const [mesVisible, setMesVisible] = useState(startOfMonth(seleccionada))
  const hoy = startOfDay(new Date())

  const inicioGrilla = startOfWeek(startOfMonth(mesVisible), { locale: es })
  const finGrilla = endOfWeek(endOfMonth(mesVisible), { locale: es })
  const dias = eachDayOfInterval({ start: inicioGrilla, end: finGrilla })

  const labelMes = format(mesVisible, 'MMMM yyyy', { locale: es })
  const labelMesCapitalizado = labelMes.charAt(0).toUpperCase() + labelMes.slice(1)

  const elegir = (dia) => {
    if (isBefore(dia, hoy)) return
    onSelect(format(dia, 'yyyy-MM-dd'))
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-app rounded-t-2xl bg-white p-4 pb-6 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[16px] font-semibold text-ink-900">Elegir fecha</h2>
          <button
            onClick={onClose}
            className="tap-scale rounded-full p-1.5 text-ink-500 active:bg-ink-100"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setMesVisible((m) => subMonths(m, 1))}
            className="tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="text-[14px] font-semibold text-ink-900">{labelMesCapitalizado}</p>
          <button
            onClick={() => setMesVisible((m) => addMonths(m, 1))}
            className="tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {DIAS_CORTOS.map((d, i) => (
            <span key={i} className="py-1 text-[11px] font-medium text-ink-400">
              {d}
            </span>
          ))}
          {dias.map((dia) => {
            const pasado = isBefore(dia, hoy)
            const fueraDeMes = !isSameMonth(dia, mesVisible)
            const esSeleccionado = isSameDay(dia, seleccionada)
            const esHoy = isToday(dia)

            return (
              <button
                key={dia.toISOString()}
                type="button"
                disabled={pasado}
                onClick={() => elegir(dia)}
                className={`tap-scale mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[13.5px] font-medium
                  ${pasado ? 'cursor-not-allowed text-ink-200' : fueraDeMes ? 'text-ink-300' : 'text-ink-900'}
                  ${esSeleccionado ? 'bg-brand-600 text-white' : ''}
                  ${!esSeleccionado && esHoy ? 'border border-brand-400 text-brand-600' : ''}
                  ${!pasado && !esSeleccionado ? 'active:bg-ink-100' : ''}
                `}
              >
                {format(dia, 'd')}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => elegir(hoy)}
          className="tap-scale mt-4 w-full rounded-xl border border-ink-200 py-2.5 text-[14px] font-semibold text-ink-700 active:bg-ink-50"
        >
          Hoy
        </button>
      </div>
    </div>
  )
}
