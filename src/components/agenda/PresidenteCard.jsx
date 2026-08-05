import { User, CalendarX } from 'lucide-react'
import Card from '../ui/Card'
import HorarioSlot from './HorarioSlot'
import { formatHora } from '../../lib/constants'

export default function PresidenteCard({ presidente, citas, onEditar }) {
  const ordenadas = [...citas].sort((a, b) => formatHora(a.hora).localeCompare(formatHora(b.hora)))

  return (
    <Card className="mb-3">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-white">
          <User size={16} />
        </span>
        <h3 className="font-display text-[15px] font-semibold text-ink-900">{presidente.nombre}</h3>
        {ordenadas.length > 0 && (
          <span className="ml-auto text-[12.5px] font-medium text-ink-400">
            {ordenadas.length} {ordenadas.length === 1 ? 'cita' : 'citas'}
          </span>
        )}
      </div>

      {ordenadas.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-3 text-[13px] text-ink-400">
          <CalendarX size={16} />
          Sin citas agendadas
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {ordenadas.map((cita) => (
            <HorarioSlot
              key={cita.id}
              hora={formatHora(cita.hora)}
              cita={cita}
              onEditar={() => onEditar(cita)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
