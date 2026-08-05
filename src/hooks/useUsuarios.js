import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

const KEY = ['usuarios']

export function useUsuarios() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre, email, role, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel('realtime-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: KEY })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [queryClient])

  // Crear usuario requiere privilegios de servicio (service_role), que NUNCA
  // deben exponerse en el cliente. Se invoca una Edge Function que use
  // supabase.auth.admin.createUser en el servidor. Ver /supabase/functions/create-user
  const crear = useMutation({
    mutationFn: async ({ nombre, email, password, role }) => {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { nombre, email, password, role },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })

  const actualizarRol = useMutation({
    mutationFn: async ({ id, role }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })

  // Eliminar usuario también requiere service_role -> Edge Function
  const eliminar = useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { id },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })

  return { ...query, crear, actualizarRol, eliminar }
}
