import { Home, Users, BarChart2, FileText, Settings, Menu, ClipboardList, Trophy } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'home',        label: 'Início',       Icon: Home },
  { id: 'alunos',      label: 'Alunos',       Icon: Users },
  { id: 'historico',   label: 'Frequência',   Icon: BarChart2 },
  { id: 'ranking',     label: 'Ranking',      Icon: Trophy },
  { id: 'relatorios',  label: 'Relatórios',   Icon: FileText },
]

const BOTTOM_ITEMS = [
  { id: 'configuracoes', label: 'Configurações', Icon: Settings },
]

const PAGE_TO_NAV = {
  home:          'home',
  chamada:       'home',
  alunos:        'alunos',
  historico:     'historico',
  ranking:       'ranking',
  relatorios:    'relatorios',
  configuracoes: 'configuracoes',
}

export default function Sidebar({ page, navigate, collapsed, onToggle, mobileOpen, onMobileClose }) {
  const activeNav = PAGE_TO_NAV[page.name] || 'home'

  const handleNav = (id) => {
    navigate(id)
    onMobileClose?.()
  }

  const itemClass = (id) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group
    ${activeNav === id
      ? 'bg-indigo-600 text-white'
      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
    }`

  const renderItem = ({ id, label, Icon }) => (
    <li key={id}>
      <button
        onClick={() => handleNav(id)}
        className={itemClass(id)}
        title={collapsed ? label : undefined}
      >
        <Icon size={20} className="flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
            {label}
          </span>
        )}
      </button>
    </li>
  )

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-800">
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <ClipboardList size={22} className="text-indigo-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">Sistema de Chamada</p>
              <p className="text-slate-400 text-xs">Domingos · 08:30</p>
            </div>
          </div>
        )}
        {collapsed && <ClipboardList size={22} className="text-indigo-400 mx-auto" />}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition flex-shrink-0 hidden md:flex"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <ul className="space-y-1">
          {NAV_ITEMS.map(renderItem)}
        </ul>
      </nav>

      {/* Bottom items */}
      <div className="px-2 py-3 border-t border-slate-700">
        <ul className="space-y-1">
          {BOTTOM_ITEMS.map(renderItem)}
        </ul>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 w-56 z-50 md:hidden flex flex-col">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
