import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Chamada from './pages/Chamada'
import Alunos from './pages/Alunos'
import Historico from './pages/Historico'
import Ranking from './pages/Ranking'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import { migrarDatasParaDomingo } from './utils/storage'

export default function App() {
  const [page, setPage] = useState({ name: 'home', params: {} })

  useEffect(() => { migrarDatasParaDomingo() }, [])
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigate = (name, params = {}) => {
    setPage({ name, params })
    window.scrollTo(0, 0)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        page={page}
        navigate={navigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
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
            {page.name === 'chamada'       && <Chamada        params={page.params} navigate={navigate} />}
            {page.name === 'alunos'        && <Alunos         params={page.params} navigate={navigate} />}
            {page.name === 'historico'     && <Historico      params={page.params} navigate={navigate} />}
            {page.name === 'ranking'       && <Ranking        navigate={navigate} />}
            {page.name === 'relatorios'    && <Relatorios     navigate={navigate} />}
            {page.name === 'configuracoes' && <Configuracoes  navigate={navigate} />}
          </div>
        </main>
      </div>
    </div>
  )
}
