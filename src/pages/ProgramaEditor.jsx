import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { plantillaDesde } from '../lib/programaPlantilla'
import AppLayout from '../components/layout/AppLayout'
import ProgramaForm from '../components/programas/ProgramaForm'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ErrorState from '../components/ui/ErrorState'
import { usePrograma, useProgramaMutations } from '../hooks/useProgramas'
import { useAuth } from '../context/AuthContext'
import { exportarProgramaPdf } from '../lib/programaPdf'

/** Crea (sin :id) o edita (con :id) un programa de reunión. */
export default function ProgramaEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, canEdit } = useAuth()
  const soloLectura = !!id && !canEdit
  // Al duplicar, el programa llega por state y se abre como uno nuevo
  const plantilla = !id ? location.state?.plantilla : undefined
  const { crear, actualizar, eliminar } = useProgramaMutations()
  const { data: programa, isLoading, isError, refetch } = usePrograma(id)
  const [errorMsg, setErrorMsg] = useState('')
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)

  const handleSubmit = async (form) => {
    setErrorMsg('')
    try {
      if (id) await actualizar.mutateAsync({ id, ...form })
      else await crear.mutateAsync({ ...form, creado_por: user?.id })
      navigate('/programas', { state: { toast: id ? 'Programa actualizado' : 'Programa creado' } })
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleEliminar = async () => {
    setConfirmandoEliminar(false)
    try {
      await eliminar.mutateAsync(id)
      navigate('/programas', { state: { toast: 'Programa eliminado' } })
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleExportar = async (form) => {
    try {
      await exportarProgramaPdf(form)
    } catch (err) {
      setErrorMsg(`No se pudo generar el PDF: ${err.message}`)
    }
  }

  const titulo = soloLectura ? 'Programa' : id ? 'Editar programa' : plantilla ? 'Duplicar programa' : 'Nuevo programa'

  if (id && isError) {
    return (
      <AppLayout title={titulo} onBack={true}>
        <ErrorState message="No se pudo cargar el programa." onRetry={refetch} />
      </AppLayout>
    )
  }

  if (id && (isLoading || !programa)) {
    return (
      <AppLayout title={titulo} onBack={true}>
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={titulo} onBack={true}>
      <ProgramaForm
        key={location.key}
        initialValues={programa ?? plantilla}
        soloLectura={soloLectura}
        onDuplicar={
          id && canEdit
            ? (form) => navigate('/programas/nuevo', { state: { plantilla: plantillaDesde(form) } })
            : undefined
        }
        onSubmit={handleSubmit}
        onExportar={handleExportar}
        onEliminar={id ? () => setConfirmandoEliminar(true) : undefined}
        submitting={crear.isPending || actualizar.isPending || eliminar.isPending}
        errorMsg={errorMsg}
      />

      <ConfirmDialog
        open={confirmandoEliminar}
        icon={Trash2}
        title="¿Eliminar este programa?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleEliminar}
        onCancel={() => setConfirmandoEliminar(false)}
      />
    </AppLayout>
  )
}
