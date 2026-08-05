import { useState } from 'react'
import { Plus, User, Power, Pencil, X } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Field, Input, Select } from '../components/ui/Input'
import { usePresidentes } from '../hooks/usePresidentes'

function PresidenteFormSheet({ initial, onClose, onSave, saving }) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [modalidad, setModalidad] = useState(initial?.modalidad_default ?? 'presencial')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ nombre, modalidad_default: modalidad })
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-app rounded-t-2xl bg-white p-4 pb-6 safe-bottom">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[16px] font-semibold text-ink-900">
            {initial ? 'Editar presidente' : 'Nuevo presidente'}
          </h2>
          <button onClick={onClose} className="tap-scale rounded-full p-1.5 text-ink-500 active:bg-ink-100">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nombre">
            <Input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Presidente Ramírez" />
          </Field>
          <Field label="Modalidad por defecto">
            <Select value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
            </Select>
          </Field>
          <Button type="submit" loading={saving} className="w-full">
            Guardar
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function Presidentes() {
  const { data: presidentes, isLoading, crear, actualizar } = usePresidentes()
  const [editando, setEditando] = useState(null) // null = cerrado, 'nuevo', o objeto presidente
  const abierto = editando !== null

  const handleSave = async (values) => {
    if (editando === 'nuevo') {
      await crear.mutateAsync({ ...values, activo: true })
    } else {
      await actualizar.mutateAsync({ id: editando.id, ...values })
    }
    setEditando(null)
  }

  const toggleActivo = (p) => {
    actualizar.mutate({ id: p.id, activo: !p.activo })
  }

  return (
    <AppLayout
      title="Presidentes"
      onBack={true}
      right={
        <button
          onClick={() => setEditando('nuevo')}
          className="tap-scale flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white"
          aria-label="Agregar presidente"
        >
          <Plus size={18} />
        </button>
      }
    >
      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {presidentes?.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white">
                <User size={16} />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-ink-900">{p.nombre}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Badge tone={p.activo ? 'brand' : 'neutral'}>{p.activo ? 'Activo' : 'Inactivo'}</Badge>
                  {p.modalidad_default && <Badge tone="neutral">{p.modalidad_default}</Badge>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditando(p)}
                className="tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
                aria-label="Editar"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => toggleActivo(p)}
                className={`tap-scale flex h-9 w-9 items-center justify-center rounded-full active:bg-ink-100 ${
                  p.activo ? 'text-ink-500' : 'text-brand-600'
                }`}
                aria-label="Activar/Desactivar"
              >
                <Power size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {abierto && (
        <PresidenteFormSheet
          initial={editando === 'nuevo' ? null : editando}
          onClose={() => setEditando(null)}
          onSave={handleSave}
          saving={crear.isPending || actualizar.isPending}
        />
      )}
    </AppLayout>
  )
}
