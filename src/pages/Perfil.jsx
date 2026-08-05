import { useState } from 'react'
import { UserCircle, Lock, Shield } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Field, Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function Perfil() {
  const { user, profile, isAdmin, refreshProfile } = useAuth()

  const [nombre, setNombre] = useState(profile?.nombre ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [guardando, setGuardando] = useState(false)
  const [infoMsg, setInfoMsg] = useState('')
  const [infoError, setInfoError] = useState('')

  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [cambiandoPassword, setCambiandoPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleGuardarInfo = async (e) => {
    e.preventDefault()
    setInfoMsg('')
    setInfoError('')
    setGuardando(true)
    try {
      if (nombre.trim() !== profile?.nombre) {
        const { error } = await supabase
          .from('profiles')
          .update({ nombre: nombre.trim() })
          .eq('id', user.id)
        if (error) throw error
      }

      const emailCambio = email.trim() !== user?.email
      if (emailCambio) {
        const { error } = await supabase.auth.updateUser({ email: email.trim() })
        if (error) throw error
      }

      refreshProfile()
      setInfoMsg(
        emailCambio
          ? 'Guardado. Revisa tu correo nuevo para confirmar el cambio de email.'
          : 'Datos actualizados.'
      )
    } catch (err) {
      setInfoError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleCambiarPassword = async (e) => {
    e.preventDefault()
    setPasswordMsg('')
    setPasswordError('')

    if (nuevaPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (nuevaPassword !== confirmarPassword) {
      setPasswordError('Las contraseñas no coinciden.')
      return
    }

    setCambiandoPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaPassword })
      if (error) throw error
      setNuevaPassword('')
      setConfirmarPassword('')
      setPasswordMsg('Contraseña actualizada.')
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setCambiandoPassword(false)
    }
  }

  return (
    <AppLayout title="Mi perfil" onBack={true}>
      <div className="mb-4 flex flex-col items-center gap-2 pt-2">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-900 text-white">
          <UserCircle size={32} />
        </span>
        <Badge tone={isAdmin ? 'warning' : 'neutral'}>{isAdmin ? 'Admin' : 'Secretario'}</Badge>
      </div>

      <Card className="mb-4">
        <h2 className="mb-3 flex items-center gap-2 font-display text-[15px] font-semibold text-ink-900">
          <UserCircle size={16} /> Información personal
        </h2>
        <form onSubmit={handleGuardarInfo} className="flex flex-col gap-4">
          <Field label="Nombre">
            <Input required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </Field>
          <Field label="Correo electrónico">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>

          {infoError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{infoError}</p>
          )}
          {infoMsg && (
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">{infoMsg}</p>
          )}

          <Button type="submit" loading={guardando} className="w-full">
            Guardar cambios
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 font-display text-[15px] font-semibold text-ink-900">
          <Lock size={16} /> Cambiar contraseña
        </h2>
        <form onSubmit={handleCambiarPassword} className="flex flex-col gap-4">
          <Field label="Nueva contraseña">
            <Input
              type="password"
              required
              minLength={6}
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirmar contraseña">
            <Input
              type="password"
              required
              minLength={6}
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Field>

          {passwordError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{passwordError}</p>
          )}
          {passwordMsg && (
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">{passwordMsg}</p>
          )}

          <Button type="submit" variant="secondary" loading={cambiandoPassword} className="w-full">
            Actualizar contraseña
          </Button>
        </form>
      </Card>

      {isAdmin && (
        <p className="mt-4 flex items-center gap-1.5 px-1 text-[12px] text-ink-400">
          <Shield size={13} /> Tu rol de administrador no se puede cambiar desde aquí.
        </p>
      )}
    </AppLayout>
  )
}
