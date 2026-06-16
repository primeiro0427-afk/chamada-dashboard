import { useState, useEffect } from 'react'
import { Building2, Users, Plus, Trash2, CheckCircle, AlertTriangle, LogOut, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABEL = { admin: 'Admin', secretaria: 'Secretária' }
const ROLE_COLOR = { admin: 'bg-indigo-100 text-indigo-700', secretaria: 'bg-gray-100 text-gray-600' }

export default function SuperAdminPanel() {
  const { signOut } = useAuth()
  const [igrejas, setIgrejas]       = useState([])
  const [profiles, setProfiles]     = useState([])
  const [igrejaSel, setIgrejaSel]   = useState(null)
  const [loading, setLoading]       = useState(true)

  // Form novo usuário
  const [form, setForm]     = useState({ email: '', senha: '', nome: '', role: 'secretaria', igrejaNova: '' })
  const [criando, setCriando] = useState(false)
  const [msgForm, setMsgForm] = useState(null)
  const [showSenha, setShowSenha] = useState(false)

  // Confirmar exclusão
  const [confirmDel, setConfirmDel] = useState(null)

  const load = async () => {
    setLoading(true)
    const [{ data: ig }, { data: pr }] = await Promise.all([
      supabase.from('igrejas').select('*').order('created_at'),
      supabase.from('profiles').select('*').order('created_at'),
    ])
    setIgrejas(ig || [])
    setProfiles(pr || [])
    if (!igrejaSel && ig?.length > 0) setIgrejaSel(ig[0].id)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const usuariosDaIgreja = profiles.filter(p => p.igreja_id === igrejaSel)
  const igrejaNome = igrejas.find(i => i.id === igrejaSel)?.nome || ''

  const handleCriarUsuario = async (e) => {
    e.preventDefault()
    setMsgForm(null)
    setCriando(true)

    try {
      const igId = form.role === 'admin' ? null : igrejaSel

      // Criar usuário via signUp com cliente temporário
      const { createClient } = await import('@supabase/supabase-js')
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      )

      const { error: errSignUp } = await tempClient.auth.signUp({
        email: form.email,
        password: form.senha,
        options: { data: { nome: form.nome, role: form.role, igreja_id: igId } },
      })
      if (errSignUp) throw errSignUp

      // Confirmar email imediatamente via RPC
      const { error: errConfirm } = await supabase.rpc('admin_confirmar_email', { p_email: form.email })
      if (errConfirm) throw errConfirm

      setMsgForm({ tipo: 'ok', texto: `Usuário ${form.email} criado com sucesso!` })
      setForm({ email: '', senha: '', nome: '', role: 'secretaria', igrejaNova: '' })
      setTimeout(load, 1000)
    } catch (err) {
      setMsgForm({ tipo: 'erro', texto: err.message || 'Erro ao criar usuário.' })
    }
    setCriando(false)
  }

  const handleDesativar = async (profileId) => {
    await supabase.from('profiles').update({ igreja_id: null }).eq('id', profileId)
    setConfirmDel(null)
    load()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 size={22} className="text-indigo-400" />
          <div>
            <p className="font-bold text-sm">Painel Super Admin</p>
            <p className="text-slate-400 text-xs">Gerenciamento de igrejas e usuários</p>
          </div>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <LogOut size={16} /> Sair
        </button>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : (
          <>
            {/* Resumo geral */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-indigo-600">{igrejas.length}</div>
                <div className="text-xs text-gray-500 mt-1">Igrejas ativas</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{profiles.filter(p => p.role === 'admin').length}</div>
                <div className="text-xs text-gray-500 mt-1">Admins (pastores)</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600">{profiles.filter(p => p.role === 'secretaria').length}</div>
                <div className="text-xs text-gray-500 mt-1">Secretárias</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Igrejas + usuários */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Building2 size={16} className="text-indigo-600" />
                  <h3 className="font-bold text-gray-700">Igrejas</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {igrejas.map(igreja => {
                    const qtd = profiles.filter(p => p.igreja_id === igreja.id).length
                    return (
                      <button key={igreja.id} onClick={() => setIgrejaSel(igreja.id)}
                        className={`w-full text-left px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition ${igrejaSel === igreja.id ? 'bg-indigo-50' : ''}`}
                      >
                        <span className={`font-medium text-sm ${igrejaSel === igreja.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                          {igreja.nome}
                        </span>
                        <span className="text-xs text-gray-400">{qtd} usuário{qtd !== 1 ? 's' : ''}</span>
                      </button>
                    )
                  })}
                  {igrejas.length === 0 && (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">Nenhuma igreja cadastrada.</div>
                  )}
                </div>
              </div>

              {/* Usuários da igreja selecionada */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Users size={16} className="text-indigo-600" />
                  <h3 className="font-bold text-gray-700">
                    {igrejaNome ? `Usuários — ${igrejaNome}` : 'Usuários'}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {usuariosDaIgreja.map(p => (
                    <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-800 truncate">{p.nome || '—'}</div>
                        <div className="text-xs text-gray-400">{p.id.slice(0, 8)}...</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[p.role] || 'bg-gray-100 text-gray-600'}`}>
                        {ROLE_LABEL[p.role] || p.role}
                      </span>
                      {confirmDel === p.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDesativar(p.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg">Sim</button>
                          <button onClick={() => setConfirmDel(null)} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">Não</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDel(p.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition" title="Remover acesso">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                  {usuariosDaIgreja.length === 0 && (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">
                      {igrejaSel ? 'Nenhum usuário nesta igreja.' : 'Selecione uma igreja.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Criar novo usuário */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Plus size={16} className="text-indigo-600" />
                <h3 className="font-bold text-gray-700">Criar novo usuário</h3>
              </div>

              <form onSubmit={handleCriarUsuario} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
                    <input type="text" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                      placeholder="Nome completo" required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="email@dominio.com" required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Senha</label>
                    <div className="relative">
                      <input type={showSenha ? 'text' : 'password'} value={form.senha}
                        onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                        placeholder="mínimo 6 caracteres" required minLength={6}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 pr-9"
                      />
                      <button type="button" onClick={() => setShowSenha(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                        {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Papel</label>
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    >
                      <option value="secretaria">Secretária</option>
                      <option value="admin">Admin (pastor)</option>
                    </select>
                  </div>
                </div>

                {form.role === 'secretaria' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Igreja</label>
                    <select value={igrejaSel || ''} onChange={e => setIgrejaSel(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    >
                      {igrejas.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">A secretária será vinculada a esta igreja.</p>
                  </div>
                )}

                {form.role === 'admin' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                    O admin (pastor) fará login e configurará o nome da própria igreja no primeiro acesso.
                  </div>
                )}

                {msgForm && (
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${msgForm.tipo === 'ok' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {msgForm.tipo === 'ok' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                    {msgForm.texto}
                  </div>
                )}

                <button type="submit" disabled={criando}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {criando ? 'Criando...' : 'Criar usuário'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
