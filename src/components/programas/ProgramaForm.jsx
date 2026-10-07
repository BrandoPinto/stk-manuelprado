import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Trash2, X, FileDown } from 'lucide-react'
import { Field, Input, Select, Textarea } from '../ui/Input'
import Button from '../ui/Button'
import { TIPOS_REUNION } from '../../lib/constants'

const TIEMPOS_INICIALES = 3

function Opcional({ label, activo, onToggle, children }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink-600">{label}</span>
        <button
          type="button"
          onClick={onToggle}
          className={`tap-scale flex h-8 items-center gap-1 rounded-full border px-3 text-[12px] font-medium ${
            activo ? 'border-red-200 bg-red-50 text-red-600' : 'border-brand-200 bg-brand-50 text-brand-700'
          }`}
        >
          {activo ? (
            <>
              <X size={13} /> Quitar
            </>
          ) : (
            <>
              <Plus size={13} /> Habilitar
            </>
          )}
        </button>
      </div>
      {activo && <div className="mt-2">{children}</div>}
    </div>
  )
}

export default function ProgramaForm({
  initialValues,
  onSubmit,
  onEliminar,
  onExportar,
  submitting,
  errorMsg,
}) {
  const [form, setForm] = useState({
    tipo: initialValues?.tipo ?? TIPOS_REUNION[0],
    fecha: initialValues?.fecha ?? format(new Date(), 'yyyy-MM-dd'),
    preside: initialValues?.preside ?? '',
    dirige: initialValues?.dirige ?? '',
    himno_inicial: initialValues?.himno_inicial ?? '',
    primera_oracion: initialValues?.primera_oracion ?? '',
    pensamiento: initialValues?.pensamiento ?? '',
    anuncios: initialValues?.anuncios ?? '',
    tiempos: initialValues?.tiempos ?? Array.from({ length: TIEMPOS_INICIALES }, () => ''),
    relevos: initialValues?.relevos ?? null,
    sostenimientos: initialValues?.sostenimientos ?? null,
    ultima_oracion: initialValues?.ultima_oracion ?? '',
  })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setTiempo = (i, valor) =>
    setForm((f) => ({ ...f, tiempos: f.tiempos.map((t, idx) => (idx === i ? valor : t)) }))
  const agregarTiempo = () => setForm((f) => ({ ...f, tiempos: [...f.tiempos, ''] }))
  const quitarTiempo = (i) => setForm((f) => ({ ...f, tiempos: f.tiempos.filter((_, idx) => idx !== i) }))
  const toggleOpcional = (key) => setForm((f) => ({ ...f, [key]: f[key] == null ? '' : null }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-6">
      <Field label="Reunión">
        <Select value={form.tipo} onChange={update('tipo')}>
          {TIPOS_REUNION.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Fecha">
        <Input type="date" required value={form.fecha} onChange={update('fecha')} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Preside">
          <Input value={form.preside} onChange={update('preside')} />
        </Field>
        <Field label="Dirige">
          <Input value={form.dirige} onChange={update('dirige')} />
        </Field>
      </div>

      <Field label="1er himno">
        <Input value={form.himno_inicial} onChange={update('himno_inicial')} />
      </Field>

      <Field label="1era oración">
        <Input value={form.primera_oracion} onChange={update('primera_oracion')} />
      </Field>

      <Field label="Pensamiento del Ven, Sígueme">
        <Input value={form.pensamiento} onChange={update('pensamiento')} />
      </Field>

      <Field label="Anuncios">
        <Textarea value={form.anuncios} onChange={update('anuncios')} />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-ink-600">Tiempos</span>
        {form.tiempos.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={t}
              onChange={(e) => setTiempo(i, e.target.value)}
              placeholder={`Tiempo ${i + 1}`}
              aria-label={`Tiempo ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => quitarTiempo(i)}
              aria-label={`Quitar tiempo ${i + 1}`}
              className="tap-scale flex h-12 w-10 shrink-0 items-center justify-center rounded-xl text-ink-400 active:bg-ink-100"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={agregarTiempo} className="self-start">
          Agregar tiempo
        </Button>
      </div>

      <Opcional label="Relevos" activo={form.relevos != null} onToggle={() => toggleOpcional('relevos')}>
        <Textarea value={form.relevos ?? ''} onChange={update('relevos')} />
      </Opcional>

      <Opcional
        label="Sostenimientos"
        activo={form.sostenimientos != null}
        onToggle={() => toggleOpcional('sostenimientos')}
      >
        <Textarea value={form.sostenimientos ?? ''} onChange={update('sostenimientos')} />
      </Opcional>

      <Field label="Última oración">
        <Input value={form.ultima_oracion} onChange={update('ultima_oracion')} />
      </Field>

      {errorMsg && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMsg}</p>
      )}

      <Button type="submit" size="lg" loading={submitting} className="mt-2 w-full">
        Guardar programa
      </Button>

      <Button type="button" variant="secondary" icon={FileDown} onClick={() => onExportar(form)} className="w-full">
        Exportar PDF
      </Button>

      {onEliminar && (
        <Button type="button" variant="danger" icon={Trash2} onClick={onEliminar} className="w-full">
          Eliminar programa
        </Button>
      )}
    </form>
  )
}
