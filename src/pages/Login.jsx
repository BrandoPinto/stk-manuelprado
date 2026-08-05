import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, Mail, CalendarCheck2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import { Field, Input } from '../components/ui/Input'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email.trim(), password)
    setLoading(false)
    if (error) {
      setError('Correo o contraseña incorrectos.')
      return
    }
    const redirectTo = location.state?.from ?? '/agenda'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="app-shell justify-center px-6">
      <div className="mb-10 flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-card">
          <CalendarCheck2 size={30} />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Entrevistas Estaca</h1>
        <p className="mt-1 text-[14px] text-ink-500">Agenda de entrevistas semanales</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Correo electrónico">
          <div className="relative">
            <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="secretario@estaca.org"
              className="pl-10"
              autoComplete="email"
            />
          </div>
        </Field>

        <Field label="Contraseña">
          <div className="relative">
            <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10"
              autoComplete="current-password"
            />
          </div>
        </Field>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        )}

        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Iniciar sesión
        </Button>
      </form>
    </div>
  )
}
