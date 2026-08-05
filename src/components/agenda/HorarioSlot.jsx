import { MapPin, MessageSquare, Video, Building2, Phone } from 'lucide-react'
import Badge from '../ui/Badge'

export default function HorarioSlot({ hora, cita, onEditar }) {
  return (
    <button
      onClick={onEditar}
      className="tap-scale flex w-full flex-col gap-1.5 rounded-lg border border-blue-200 bg-ocupado-50 px-3 py-2.5 text-left"
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
    </button>
  )
}
