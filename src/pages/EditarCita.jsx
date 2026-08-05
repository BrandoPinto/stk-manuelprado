import { useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AppLayout from '../components/layout/AppLayout'
import CitaForm from '../components/agenda/CitaForm'
import { usePresidentes } from '../hooks/usePresidentes'
import { useCitaMutations } from '../hooks/useCitas'
import { supabase } from '../lib/supabaseClient'
import { formatHora } from '../lib/constants'

export default function EditarCita() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: presidentes } = usePresidentes({ soloActivos: true })
  const { actualizar, eliminar } = useCitaMutations()
  const [errorMsg, setErrorMsg] = useState('')

  const { data: cita, isLoading } = useQuery({
    queryKey: ['cita', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('citas').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    initialData: location.state?.cita,
  })

  const handleSubmit = async (form) => {
    setErrorMsg('')
    try {
      await actualizar.mutateAsync({ id, ...form })
      navigate('/agenda')
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleEliminar = async () => {
    if (!window.confirm('¿Eliminar esta cita? Esta acción no se puede deshacer.')) return
    try {
      await eliminar.mutateAsync(id)
      navigate('/agenda')
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  if (isLoading || !cita) {
    return (
      <AppLayout title="Editar cita" onBack={true}>
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Editar cita" onBack={true}>
      <CitaForm
        presidentes={presidentes}
        initialValues={{ ...cita, hora: formatHora(cita.hora) }}
        onSubmit={handleSubmit}
        onEliminar={handleEliminar}
        submitting={actualizar.isPending || eliminar.isPending}
        errorMsg={errorMsg}
      />
    </AppLayout>
  )
}
