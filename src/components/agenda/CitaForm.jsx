import { useState } from 'react'
import { format } from 'date-fns'
import { Field, Input, Select, Textarea } from '../ui/Input'
import Button from '../ui/Button'
import { HORARIOS, MODALIDADES, BARRIOS, PREFIJO_CELULAR } from '../../lib/constants'
import { Trash2 } from 'lucide-react'

const HOY = format(new Date(), 'yyyy-MM-dd')

export default function CitaForm({
  presidentes,
  initialValues,
  onSubmit,
  onEliminar,
  submitting,
  errorMsg,
}) {
  const presidenteInicialId = initialValues?.presidente_id ?? presidentes?.[0]?.id ?? ''
  const presidenteInicial = presidentes?.find((p) => p.id === presidenteInicialId)

  const [form, setForm] = useState({
    nombre_persona: initialValues?.nombre_persona ?? '',
    barrio: initialValues?.barrio ?? '',
    motivo: initialValues?.motivo ?? '',
    modalidad: initialValues?.modalidad ?? presidenteInicial?.modalidad_default ?? 'presencial',
    presidente_id: presidenteInicialId,
    fecha: initialValues?.fecha ?? '',
    hora: initialValues?.hora ?? HORARIOS[0],
    celular: (initialValues?.celular ?? '').replace(PREFIJO_CELULAR, ''),
  })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const updatePresidente = (e) => {
    const id = e.target.value
    const presidente = presidentes?.find((p) => p.id === id)
    setForm((f) => ({
      ...f,
      presidente_id: id,
      modalidad: presidente?.modalidad_default ?? f.modalidad,
    }))
  }

  const updateCelular = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
    setForm((f) => ({ ...f, celular: digits }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const esVirtual = form.modalidad === 'virtual'
    onSubmit({
      ...form,
      celular: esVirtual && form.celular ? `${PREFIJO_CELULAR}${form.celular}` : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-6">
      <Field label="Nombre de la persona">
        <Input
          required
          value={form.nombre_persona}
          onChange={update('nombre_persona')}
          placeholder="Ej. Juan Pérez"
        />
      </Field>

      <Field label="Barrio">
        <Select value={form.barrio} onChange={update('barrio')}>
          <option value="">Selecciona un barrio</option>
          {BARRIOS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Motivo">
        <Textarea
          value={form.motivo}
          onChange={update('motivo')}
          placeholder="Ej. Recomendación para el templo"
        />
      </Field>

      <Field label="Modalidad">
        <div className="flex gap-2">
          {MODALIDADES.map((m) => (
            <label
              key={m.value}
              className={`tap-scale flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-center text-[14px] font-medium transition-colors ${
                form.modalidad === m.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-ink-200 bg-white text-ink-600'
              }`}
            >
              <input
                type="radio"
                name="modalidad"
                value={m.value}
                checked={form.modalidad === m.value}
                onChange={update('modalidad')}
                className="sr-only"
              />
              {m.label}
            </label>
          ))}
        </div>
      </Field>

      {form.modalidad === 'virtual' && (
        <Field label="Celular">
          <div className="flex items-center overflow-hidden rounded-xl border border-ink-200 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
            <span className="pl-3.5 text-[15px] font-medium text-ink-500">{PREFIJO_CELULAR}</span>
            <input
              type="tel"
              inputMode="numeric"
              required
              pattern="\d{9}"
              maxLength={9}
              value={form.celular}
              onChange={updateCelular}
              placeholder="987654321"
              className="h-12 w-full border-0 bg-transparent px-2 text-[15px] text-ink-900 placeholder:text-ink-400 outline-none"
            />
          </div>
        </Field>
      )}

      <Field label="Presidente">
        <Select required value={form.presidente_id} onChange={updatePresidente}>
          {presidentes?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha">
          <Input type="date" required min={HOY} value={form.fecha} onChange={update('fecha')} />
        </Field>
        <Field label="Hora">
          <Select required value={form.hora} onChange={update('hora')}>
            {HORARIOS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {errorMsg && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMsg}</p>
      )}

      <Button type="submit" size="lg" loading={submitting} className="mt-2 w-full">
        Guardar cita
      </Button>

      {onEliminar && (
        <Button type="button" variant="danger" icon={Trash2} onClick={onEliminar} className="w-full">
          Eliminar cita
        </Button>
      )}
    </form>
  )
}
