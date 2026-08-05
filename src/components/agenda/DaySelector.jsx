import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { format, addDays, isToday, parseISO, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import CalendarPicker from './CalendarPicker'

export default function DaySelector({ fecha, onChange }) {
  const [calendarioAbierto, setCalendarioAbierto] = useState(false)
  const date = parseISO(fecha)
  const hoy = startOfDay(new Date())

  const ir = (dias) => {
    const nueva = addDays(date, dias)
    if (isBefore(nueva, hoy)) return
    onChange(format(nueva, 'yyyy-MM-dd'))
  }

  const label = format(date, "EEEE dd 'de' MMMM", { locale: es })
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1)

  return (
    <>
      <div className="mb-3 flex items-center justify-between rounded-xl2 border border-ink-100 bg-white p-2 shadow-card">
        <button
          onClick={() => ir(-1)}
          disabled={isToday(date)}
          className="tap-scale flex h-10 w-10 items-center justify-center rounded-full text-ink-500 active:bg-ink-100 disabled:text-ink-200 disabled:active:bg-transparent"
          aria-label="Día anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => setCalendarioAbierto(true)}
          className="tap-scale flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1 active:bg-ink-50"
        >
          <span className="flex items-center gap-1.5 font-display text-[15px] font-semibold text-ink-900">
            <CalendarDays size={15} className="text-ink-400" />
            {capitalized}
          </span>
          {isToday(date) && <span className="text-[11px] font-medium text-brand-600">Hoy</span>}
        </button>

        <button
          onClick={() => ir(1)}
          className="tap-scale flex h-10 w-10 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
          aria-label="Día siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {calendarioAbierto && (
        <CalendarPicker
          value={fecha}
          onSelect={(nuevaFecha) => {
            onChange(nuevaFecha)
            setCalendarioAbierto(false)
          }}
          onClose={() => setCalendarioAbierto(false)}
        />
      )}
    </>
  )
}
