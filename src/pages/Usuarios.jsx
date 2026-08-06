import { useState } from 'react'
import { Plus, Trash2, Shield, ShieldPlus, ShieldMinus, UserCircle } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Field, Input, Select } from '../components/ui/Input'
import { useUsuarios } from '../hooks/useUsuarios'
import { useAuth } from '../context/AuthContext'

function NuevoUsuarioModal({ onClose, onSave, saving, errorMsg }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('secretario')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ nombre, email, password, role })
  }

  return (
    <Modal open title="Nuevo usuario" onClose={onClose}>
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
    </Modal>
  )
}

export default function Usuarios() {
  const { data: usuarios, isLoading, crear, actualizarRol, eliminar } = useUsuarios()
  const { user } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null)
  const [usuarioACambiarRol, setUsuarioACambiarRol] = useState(null)

  const handleCrear = async (values) => {
    setErrorMsg('')
    try {
      await crear.mutateAsync(values)
      setAbierto(false)
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleEliminar = () => {
    eliminar.mutate(usuarioAEliminar.id)
    setUsuarioAEliminar(null)
  }

  const handleCambiarRol = () => {
    const nuevoRol = usuarioACambiarRol.role === 'admin' ? 'secretario' : 'admin'
    actualizarRol.mutate({ id: usuarioACambiarRol.id, role: nuevoRol })
    setUsuarioACambiarRol(null)
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
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setUsuarioACambiarRol(u)}
                  className="tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
                  aria-label={u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                >
                  {u.role === 'admin' ? <ShieldMinus size={16} /> : <ShieldPlus size={16} />}
                </button>
                <button
                  onClick={() => setUsuarioAEliminar(u)}
                  className="tap-scale flex h-9 w-9 items-center justify-center rounded-full text-red-500 active:bg-red-50"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {abierto && (
        <NuevoUsuarioModal
          onClose={() => setAbierto(false)}
          onSave={handleCrear}
          saving={crear.isPending}
          errorMsg={errorMsg}
        />
      )}

      <ConfirmDialog
        open={!!usuarioAEliminar}
        icon={Trash2}
        title={`¿Eliminar a ${usuarioAEliminar?.nombre}?`}
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleEliminar}
        onCancel={() => setUsuarioAEliminar(null)}
      />

      <ConfirmDialog
        open={!!usuarioACambiarRol}
        icon={usuarioACambiarRol?.role === 'admin' ? ShieldMinus : ShieldPlus}
        variant="primary"
        title={
          usuarioACambiarRol?.role === 'admin'
            ? `¿Quitarle el rol de admin a ${usuarioACambiarRol?.nombre}?`
            : `¿Hacer admin a ${usuarioACambiarRol?.nombre}?`
        }
        description={
          usuarioACambiarRol?.role === 'admin'
            ? 'Pasará a ser secretario, sin acceso a gestión de usuarios ni presidentes.'
            : 'Va a tener acceso completo, incluyendo gestión de usuarios y presidentes.'
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleCambiarRol}
        onCancel={() => setUsuarioACambiarRol(null)}
      />
    </AppLayout>
  )
}
