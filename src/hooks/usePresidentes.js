import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

const KEY = ['presidentes']

export function usePresidentes({ soloActivos = false } = {}) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('presidentes')
        .select('*')
        .order('nombre', { ascending: true })
      if (error) throw error
      return data
    },
  })

  // Realtime: cualquier cambio en presidentes refresca la lista para todos
  useEffect(() => {
    const channel = supabase
      .channel('realtime-presidentes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presidentes' }, () => {
        queryClient.invalidateQueries({ queryKey: KEY })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [queryClient])

  const crear = useMutation({
    mutationFn: async (nuevo) => {
      const { data, error } = await supabase.from('presidentes').insert(nuevo).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })

  const actualizar = useMutation({
    mutationFn: async ({ id, ...cambios }) => {
      const { data, error } = await supabase
        .from('presidentes')
        .update(cambios)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })

  const eliminar = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('presidentes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })

  const data = soloActivos ? (query.data ?? []).filter((p) => p.activo) : query.data ?? []

  return { ...query, data, crear, actualizar, eliminar }
}
