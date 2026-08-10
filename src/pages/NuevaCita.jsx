import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import AppLayout from '../components/layout/AppLayout'
import CitaForm from '../components/agenda/CitaForm'
import { usePresidentes } from '../hooks/usePresidentes'
import { useCitaMutations } from '../hooks/useCitas'
import { useAuth } from '../context/AuthContext'

export default function NuevaCita() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { data: presidentes } = usePresidentes({ soloActivos: true })
  const { crear } = useCitaMutations()
  const [errorMsg, setErrorMsg] = useState('')

  // Puede venir prellenado desde la Agenda (tap en "Disponible")
  const prefill = location.state ?? {}
  const initialValues = {
    fecha: prefill.fecha ?? format(new Date(), 'yyyy-MM-dd'),
    hora: prefill.hora,
    presidente_id: prefill.presidenteId,
  }

  const handleSubmit = async (form) => {
    setErrorMsg('')
    try {
      await crear.mutateAsync({ ...form, creado_por: user?.id })
      navigate('/agenda', { state: { toast: 'Cita creada' } })
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  return (
    <AppLayout title="Nueva cita" onBack={true}>
      <CitaForm
        presidentes={presidentes}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitting={crear.isPending}
        errorMsg={errorMsg}
      />
    </AppLayout>
  )
}
