import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { setIgrejaAtiva } from '../utils/storage'

const AuthContext = createContext(null)

const SUPORTE_KEY = 'suporte_igreja'

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null)
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)

  // Igreja que o superadmin está acessando para dar suporte ({ id, nome }).
  // Fica no sessionStorage para o F5 não jogar de volta para o painel.
  const [suporte, setSuporte] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SUPORTE_KEY)) } catch { return null }
  })

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const isSuperadmin = profile?.role === 'superadmin'
  const emSuporte    = isSuperadmin && !!suporte

  // Durante o suporte o superadmin age como admin da igreja escolhida, então as
  // páginas continuam lendo profile.igreja_id sem precisar saber que é suporte.
  const perfilEfetivo = emSuporte
    ? { ...profile, igreja_id: suporte.id, role: 'admin' }
    : profile

  // Mantém o storage limitado à igreja certa (ver setIgrejaAtiva em storage.js).
  // Feito na renderização, e não num efeito, porque os efeitos dos filhos rodam
  // antes dos do pai — as páginas buscariam os dados antes do escopo ser definido.
  setIgrejaAtiva(perfilEfetivo?.igreja_id ?? null)

  const entrarNaIgreja = (igreja) => {
    sessionStorage.setItem(SUPORTE_KEY, JSON.stringify(igreja))
    setSuporte(igreja)
  }

  const sairDaIgreja = () => {
    sessionStorage.removeItem(SUPORTE_KEY)
    setSuporte(null)
  }

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => {
    sessionStorage.removeItem(SUPORTE_KEY)
    setSuporte(null)
    return supabase.auth.signOut()
  }

  const reloadProfile = () => {
    if (session?.user?.id) loadProfile(session.user.id)
  }

  return (
    <AuthContext.Provider value={{
      session,
      profile: perfilEfetivo,
      loading,
      signIn,
      signOut,
      reloadProfile,
      suporte: emSuporte ? suporte : null,
      entrarNaIgreja,
      sairDaIgreja,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
