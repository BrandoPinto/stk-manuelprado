import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

const baseKey = ['citas']

/**
 * Trae citas para una fecha específica (YYYY-MM-DD)
 */
export function useCitasPorFecha(fecha) {
  const queryClient = useQueryClient()
  const key = [...baseKey, 'fecha', fecha]

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citas')
        .select('*, presidentes(id, nombre, activo)')
        .eq('fecha', fecha)
        .order('hora', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!fecha,
  })

  useEffect(() => {
    if (!fecha) return
    const channel = supabase
      .channel(`realtime-citas-${fecha}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'citas', filter: `fecha=eq.${fecha}` },
        () => {
          queryClient.invalidateQueries({ queryKey: key })
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, queryClient])

  return query
}

/**
 * Trae citas para un rango de fechas (semana), usado en vista Semanal e Historial
 */
export function useCitasPorRango(fechaInicio, fechaFin) {
  const queryClient = useQueryClient()
  const key = [...baseKey, 'rango', fechaInicio, fechaFin]

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citas')
        .select('*, presidentes(id, nombre, activo)')
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!fechaInicio && !!fechaFin,
  })

  useEffect(() => {
    if (!fechaInicio || !fechaFin) return
    const channel = supabase
      .channel(`realtime-citas-rango-${fechaInicio}-${fechaFin}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citas' }, () => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicio, fechaFin, queryClient])

  return query
}

export function useCitaMutations() {
  const queryClient = useQueryClient()

  const invalidateAll = () => queryClient.invalidateQueries({ queryKey: baseKey })

  const verificarDisponibilidad = async ({ presidente_id, fecha, hora, excluirId }) => {
    let q = supabase
      .from('citas')
      .select('id')
      .eq('presidente_id', presidente_id)
      .eq('fecha', fecha)
      .eq('hora', hora)

    if (excluirId) q = q.neq('id', excluirId)

    const { data, error } = await q
    if (error) throw error
    return data.length === 0 // true = disponible
  }

  const crear = useMutation({
    mutationFn: async (nuevaCita) => {
      const disponible = await verificarDisponibilidad({
        presidente_id: nuevaCita.presidente_id,
        fecha: nuevaCita.fecha,
        hora: nuevaCita.hora,
      })
      if (!disponible) {
        throw new Error('Ese horario ya fue tomado por otra cita. Por favor elige otro horario.')
      }
      const { data, error } = await supabase.from('citas').insert(nuevaCita).select().single()
      if (error) {
        if (error.code === '23505') {
          throw new Error('Ese horario ya fue tomado por otra cita. Por favor elige otro horario.')
        }
        throw error
      }
      return data
    },
    onSuccess: invalidateAll,
  })

  const actualizar = useMutation({
    mutationFn: async ({ id, ...cambios }) => {
      if (cambios.presidente_id && cambios.fecha && cambios.hora) {
        const disponible = await verificarDisponibilidad({
          presidente_id: cambios.presidente_id,
          fecha: cambios.fecha,
          hora: cambios.hora,
          excluirId: id,
        })
        if (!disponible) {
          throw new Error('Ese horario ya fue tomado por otra cita. Por favor elige otro horario.')
        }
      }
      const { data, error } = await supabase.from('citas').update(cambios).eq('id', id).select().single()
      if (error) {
        if (error.code === '23505') {
          throw new Error('Ese horario ya fue tomado por otra cita. Por favor elige otro horario.')
        }
        throw error
      }
      return data
    },
    onSuccess: invalidateAll,
  })

  const eliminar = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('citas').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidateAll,
  })

  return { crear, actualizar, eliminar }
}
