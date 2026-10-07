import { MapPin, MessageSquare, Video, Building2, Phone, UserPen, Check, X } from 'lucide-react'
import Badge from '../ui/Badge'

export default function HorarioSlot({ hora, cita, onEditar, onEstado }) {
  const estado = cita.estado ?? 'pendiente'
  // Tocar el estado activo lo devuelve a pendiente
  const marcar = (e, nuevo) => {
    e.stopPropagation()
    onEstado?.(cita, estado === nuevo ? 'pendiente' : nuevo)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEditar}
      onKeyDown={(e) => e.key === 'Enter' && onEditar()}
      className="tap-scale flex w-full flex-col gap-1.5 rounded-lg border border-blue-200 bg-ocupado-50 px-3 py-2.5 cursor-pointer text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-[13px] font-semibold text-ink-500">{hora}</span>
          <span className="text-[14px] font-semibold text-ink-900">{cita.nombre_persona}</span>
        </div>
        <Badge tone={cita.modalidad === 'virtual' ? 'brand' : 'ocupado'}>
          {cita.modalidad === 'virtual' ? (
            <span className="flex items-center gap-1"><Video size={12} /> Virtual</span>
          ) : (
            <span className="flex items-center gap-1"><Building2 size={12} /> Presencial</span>
          )}
        </Badge>
      </div>
      {(cita.barrio || cita.motivo || cita.celular) && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 pl-14 text-[12.5px] text-ink-600">
          {cita.barrio && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {cita.barrio}
            </span>
          )}
          {cita.motivo && (
            <span className="flex items-center gap-1">
              <MessageSquare size={12} /> {cita.motivo}
            </span>
          )}
          {cita.celular && (
            <span className="flex items-center gap-1">
              <Phone size={12} /> {cita.celular}
            </span>
          )}
        </div>
      )}
      {cita.creador?.nombre && (
        <p className="flex items-center gap-1 pl-14 text-[11px] text-ink-400">
          <UserPen size={11} /> Agendado por {cita.creador.nombre}
        </p>
      )}
      {onEstado && (
        <div className="flex items-center justify-end gap-2 pt-0.5">
          <button
            type="button"
            onClick={(e) => marcar(e, 'realizada')}
            aria-label="Marcar entrevista como realizada"
            aria-pressed={estado === 'realizada'}
            className={`tap-scale flex h-8 items-center gap-1 rounded-full border px-3 text-[12px] font-medium ${
              estado === 'realizada'
                ? 'border-green-600 bg-green-600 text-white'
                : 'border-ink-200 bg-white text-ink-500'
            }`}
          >
            <Check size={14} /> Se dio
          </button>
          <button
            type="button"
            onClick={(e) => marcar(e, 'no_realizada')}
            aria-label="Marcar entrevista como no realizada"
            aria-pressed={estado === 'no_realizada'}
            className={`tap-scale flex h-8 items-center gap-1 rounded-full border px-3 text-[12px] font-medium ${
              estado === 'no_realizada'
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-ink-200 bg-white text-ink-500'
            }`}
          >
            <X size={14} /> No se dio
          </button>
        </div>
      )}
    </div>
  )
}
