import { useState } from 'react'
import { Plus, X, Trash2, Shield, UserCircle } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Field, Input, Select } from '../components/ui/Input'
import { useUsuarios } from '../hooks/useUsuarios'
import { useAuth } from '../context/AuthContext'

function NuevoUsuarioSheet({ onClose, onSave, saving, errorMsg }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('secretario')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ nombre, email, password, role })
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-app rounded-t-2xl bg-white p-4 pb-6 safe-bottom">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[16px] font-semibold text-ink-900">Nuevo usuario</h2>
          <button onClick={onClose} className="tap-scale rounded-full p-1.5 text-ink-500 active:bg-ink-100">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nombre">
            <Input required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </Field>
          <Field label="Correo">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Contraseña temporal">
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Rol">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="secretario">Secretario</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          {errorMsg && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{errorMsg}</p>
          )}
          <Button type="submit" loading={saving} className="w-full">
            Crear usuario
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function Usuarios() {
  const { data: usuarios, isLoading, crear, eliminar } = useUsuarios()
  const { user } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleCrear = async (values) => {
    setErrorMsg('')
    try {
      await crear.mutateAsync(values)
      setAbierto(false)
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleEliminar = (u) => {
    if (u.id === user.id) return
    if (!window.confirm(`¿Eliminar a ${u.nombre}?`)) return
    eliminar.mutate(u.id)
  }

  return (
    <AppLayout
      title="Usuarios"
      onBack={true}
      right={
        <button
          onClick={() => setAbierto(true)}
          className="tap-scale flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white"
          aria-label="Agregar usuario"
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
        {usuarios?.map((u) => (
          <Card key={u.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-ink-600">
                {u.role === 'admin' ? <Shield size={16} /> : <UserCircle size={18} />}
              </span>
              <div>
                <p className="text-[14px] font-semibold text-ink-900">{u.nombre}</p>
                <p className="text-[12px] text-ink-500">{u.email}</p>
                <Badge tone={u.role === 'admin' ? 'warning' : 'neutral'} className="mt-1">
                  {u.role}
                </Badge>
              </div>
            </div>
            {u.id !== user.id && (
              <button
                onClick={() => handleEliminar(u)}
                className="tap-scale flex h-9 w-9 items-center justify-center rounded-full text-red-500 active:bg-red-50"
                aria-label="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            )}
          </Card>
        ))}
      </div>

      {abierto && (
        <NuevoUsuarioSheet
          onClose={() => setAbierto(false)}
          onSave={handleCrear}
          saving={crear.isPending}
          errorMsg={errorMsg}
        />
      )}
    </AppLayout>
  )
}
