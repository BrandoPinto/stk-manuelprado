import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, FileDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../components/ui/Button'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import ErrorState from '../components/ui/ErrorState'
import Toast from '../components/ui/Toast'
import { Select } from '../components/ui/Input'
import { useProgramas } from '../hooks/useProgramas'
import { TIPOS_REUNION } from '../lib/constants'
import { exportarProgramaPdf, formatFechaPrograma } from '../lib/programaPdf'

const POR_PAGINA = 10

export default function Programas() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tipo, setTipo] = useState('todos')
  const [toastMsg, setToastMsg] = useState(() => location.state?.toast ?? null)
  const [pagina, setPagina] = useState(0)
  const { data, isLoading, isFetching, isError, refetch } = useProgramas({
    tipo,
    pagina,
    porPagina: POR_PAGINA,
  })
  const programas = data?.programas
  const total = data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  // Si tras eliminar la página actual queda vacía, volver a la última
  useEffect(() => {
    if (data && pagina > 0 && data.programas.length === 0) setPagina(totalPaginas - 1)
  }, [data, pagina, totalPaginas])

  const irA = (n) => {
    setPagina(n)
    window.scrollTo?.({ top: 0 })
  }

  useEffect(() => {
    if (location.state?.toast) navigate(location.pathname, { replace: true, state: {} })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exportar = async (e, programa) => {
    e.stopPropagation()
    try {
      await exportarProgramaPdf(programa)
    } catch {
      setToastMsg('No se pudo generar el PDF')
    }
  }

  return (
    <AppLayout title="Programas" onBack={false}>
      <div className="mb-3">
        <Select
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value)
            setPagina(0)
          }}
        >
          <option value="todos">Todas las reuniones</option>
          {TIPOS_REUNION.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && !isError && (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      )}

      {isError && <ErrorState message="No se pudieron cargar los programas." onRetry={refetch} />}

      {!isLoading && !isError && programas?.length === 0 && (
        <p className="mt-8 text-center text-sm text-ink-500">
          Aún no hay programas. Crea el primero con el botón +.
        </p>
      )}

      {!isError && total > 0 && (
        <p className="mb-2 px-1 text-[12px] text-ink-400">
          {total} programa{total !== 1 ? 's' : ''}
        </p>
      )}

      <div className={`flex flex-col gap-2 transition-opacity ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {!isError &&
          programas?.map((p) => (
            <Card
              key={p.id}
              className="tap-scale cursor-pointer"
              onClick={() => navigate(`/programas/${p.id}/editar`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink-900">{p.tipo}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-500">{formatFechaPrograma(p.fecha)}</p>
                  {(p.preside || p.dirige) && (
                    <p className="mt-1 truncate text-[12px] text-ink-400">
                      {p.preside && `Preside: ${p.preside}`}
                      {p.preside && p.dirige && ' · '}
                      {p.dirige && `Dirige: ${p.dirige}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => exportar(e, p)}
                  aria-label="Exportar PDF"
                  className="tap-scale flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
                >
                  <FileDown size={18} />
                </button>
              </div>
              {(p.relevos != null || p.sostenimientos != null) && (
                <div className="mt-2 flex gap-1.5">
                  {p.relevos != null && <Badge tone="warning">Relevos</Badge>}
                  {p.sostenimientos != null && <Badge tone="warning">Sostenimientos</Badge>}
                </div>
              )}
            </Card>
          ))}
      </div>

      {!isError && totalPaginas > 1 && (
        <div className="mt-3 flex items-center justify-between gap-2 pb-16">
          <Button variant="secondary" icon={ChevronLeft} disabled={pagina === 0} onClick={() => irA(pagina - 1)}>
            Anterior
          </Button>
          <span className="text-[13px] text-ink-500">
            {pagina + 1} / {totalPaginas}
          </span>
          <Button
            variant="secondary"
            disabled={pagina >= totalPaginas - 1}
            onClick={() => irA(pagina + 1)}
          >
            Siguiente <ChevronRight size={16} />
          </Button>
        </div>
      )}

      <button
        onClick={() => navigate('/programas/nuevo')}
        className="tap-scale absolute bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg active:bg-brand-700"
        aria-label="Nuevo programa"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <Toast message={toastMsg} onDone={() => setToastMsg(null)} />
    </AppLayout>
  )
}
