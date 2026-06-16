import { useState } from 'react'
import { Menu } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Chamada from './pages/Chamada'
import Alunos from './pages/Alunos'
import Historico from './pages/Historico'
import Ranking from './pages/Ranking'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import SuperAdminPanel from './pages/SuperAdminPanel'

function AppContent() {
  const { session, profile, loading } = useAuth()
  const [page, setPage]           = useState({ name: 'home', params: {} })
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigate = (name, params = {}) => {
    setPage({ name, params })
    window.scrollTo(0, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    )
  }

  if (!session) return <Login />

  if (profile?.role === 'superadmin') return <SuperAdminPanel />

  if (!profile?.igreja_id) return <Onboarding />

  const isAdmin = profile.role === 'admin'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        page={page}
        navigate={navigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        isAdmin={isAdmin}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-800 text-white flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-700 transition"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm">Sistema de Chamada</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-6">
            {page.name === 'home'          && <Home          navigate={navigate} />}
            {page.name === 'chamada'       && <Chamada       params={page.params} navigate={navigate} />}
            {page.name === 'alunos'        && <Alunos        params={page.params} navigate={navigate} />}
            {page.name === 'historico'     && <Historico     params={page.params} navigate={navigate} />}
            {page.name === 'ranking'       && <Ranking       navigate={navigate} />}
            {page.name === 'relatorios'    && <Relatorios    navigate={navigate} />}
            {isAdmin && page.name === 'configuracoes' && <Configuracoes navigate={navigate} />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
