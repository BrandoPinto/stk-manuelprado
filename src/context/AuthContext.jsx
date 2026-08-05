import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId, email) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre, email, role')
      .eq('id', userId)
      .single()

    if (error) return
    setProfile(data)

    // Si el correo de Auth cambió (ej. tras confirmar un cambio de email),
    // mantenemos sincronizada la copia en profiles.
    if (email && data.email !== email) {
      const { error: syncError } = await supabase
        .from('profiles')
        .update({ email })
        .eq('id', userId)
      if (!syncError) setProfile((p) => (p ? { ...p, email } : p))
    }
  }, [])

  const refreshProfile = useCallback(() => {
    if (session?.user) loadProfile(session.user.id, session.user.email)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, loadProfile])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      loadProfile(session?.user?.id, session?.user?.email).finally(() => setLoading(false))
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      loadProfile(session?.user?.id, session?.user?.email)
    })

    return () => listener.subscription.unsubscribe()
  }, [loadProfile])

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.role === 'admin',
    loading,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
