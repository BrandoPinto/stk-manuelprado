import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

const KEY = ['programas']

/**
 * Lista paginada en el servidor, de los últimos creados a los más antiguos.
 * Devuelve { programas, total }.
 */
export function useProgramas({ tipo = 'todos', pagina = 0, porPagina = 10 } = {}) {
  return useQuery({
    queryKey: [...KEY, 'lista', tipo, pagina, porPagina],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      let q = supabase
        .from('programas')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(pagina * porPagina, pagina * porPagina + porPagina - 1)
      if (tipo !== 'todos') q = q.eq('tipo', tipo)
      const { data, error, count } = await q
      if (error) throw error
      return { programas: data, total: count ?? 0 }
    },
  })
}

export function usePrograma(id) {
  return useQuery({
    queryKey: [...KEY, 'detalle', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('programas').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
  })
}

export function useProgramaMutations() {
  const queryClient = useQueryClient()
  const invalidar = () => queryClient.invalidateQueries({ queryKey: KEY })

  const crear = useMutation({
    mutationFn: async (nuevo) => {
      const { data, error } = await supabase.from('programas').insert(nuevo).select().single()
      if (error) throw error
      return data
    },
    onSuccess: invalidar,
  })

  const actualizar = useMutation({
    mutationFn: async ({ id, ...cambios }) => {
      const { data, error } = await supabase.from('programas').update(cambios).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: invalidar,
  })

  const eliminar = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('programas').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidar,
  })

  return { crear, actualizar, eliminar }
}
