import { useState, useEffect } from 'react'
import {
  Building2, Users, Plus, Trash2, CheckCircle, AlertTriangle,
  LogOut, Eye, EyeOff, Pencil, X, Save,
} from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABEL = { admin: 'Admin', secretaria: 'Secretária' }
const ROLE_COLOR = {
  admin:      'bg-indigo-100 text-indigo-700',
  secretaria: 'bg-gray-100 text-gray-600',
}

export default function SuperAdminPanel() {
  const { signOut }             = useAuth()
  const [aba, setAba]           = useState('geral')
  const [igrejas, setIgrejas]   = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading]   = useState(true)

  const load = async () => {
    setLoading(true)
    const [{ data: ig }, { data: pr }] = await Promise.all([
      supabase.from('igrejas').select('*').order('created_at'),
      supabase.from('profiles').select('*').order('created_at'),
    ])
    setIgrejas(ig || [])
    setProfiles(pr || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const igrejaNome = (id) => igrejas.find(i => i.id === id)?.nome || '—'

  const ABAS = [
    { id: 'geral',    label: 'Visão Geral' },
    { id: 'igrejas',  label: 'Igrejas' },
    { id: 'usuarios', label: 'Usuários' },
    { id: 'criar',    label: '+ Criar Usuário' },
  ]

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

      {/* Abas */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1 max-w-5xl mx-auto">
          {ABAS.map(a => (
            <button key={a.id} onClick={() => setAba(a.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                aba === a.id
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : (
          <>
            {aba === 'geral'    && <AbaGeral    igrejas={igrejas} profiles={profiles} igrejaNome={igrejaNome} setAba={setAba} />}
            {aba === 'igrejas'  && <AbaIgrejas  igrejas={igrejas} profiles={profiles} reload={load} />}
            {aba === 'usuarios' && <AbaUsuarios profiles={profiles} igrejaNome={igrejaNome} igrejas={igrejas} reload={load} />}
            {aba === 'criar'    && <AbaCriar    igrejas={igrejas} reload={load} setAba={setAba} />}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Aba Visão Geral ──────────────────────────────────────────────────────────

function AbaGeral({ igrejas, profiles, igrejaNome, setAba }) {
  return (
    <div className="space-y-6">
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

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <Building2 size={16} className="text-indigo-600" /> Igrejas cadastradas
          </h3>
          <button onClick={() => setAba('igrejas')} className="text-xs text-indigo-600 hover:underline">Ver todas</button>
        </div>
        <div className="divide-y divide-gray-100">
          {igrejas.slice(0, 5).map(igreja => {
            const qtd = profiles.filter(p => p.igreja_id === igreja.id).length
            return (
              <div key={igreja.id} className="px-5 py-3 flex items-center justify-between">
                <span className="font-medium text-sm text-gray-700">{igreja.nome}</span>
                <span className="text-xs text-gray-400">{qtd} usuário{qtd !== 1 ? 's' : ''}</span>
              </div>
            )
          })}
          {igrejas.length === 0 && (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">Nenhuma igreja cadastrada ainda.</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Aba Igrejas ──────────────────────────────────────────────────────────────

function AbaIgrejas({ igrejas, profiles, reload }) {
  const [editando, setEditando]   = useState(null)
  const [nomeEdit, setNomeEdit]   = useState('')
  const [confirmDel, setConfirmDel] = useState(null)
  const [saving, setSaving]       = useState(false)

  const handleEditar = (igreja) => {
    setEditando(igreja.id)
    setNomeEdit(igreja.nome)
  }

  const handleSalvarEdit = async (id) => {
    if (!nomeEdit.trim()) return
    setSaving(true)
    await supabase.from('igrejas').update({ nome: nomeEdit.trim() }).eq('id', id)
    setSaving(false)
    setEditando(null)
    reload()
  }

  const handleExcluir = async (id) => {
    await supabase.from('igrejas').delete().eq('id', id)
    setConfirmDel(null)
    reload()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Gerencie as igrejas cadastradas no sistema.</p>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-700">{igrejas.length} igreja{igrejas.length !== 1 ? 's' : ''} cadastrada{igrejas.length !== 1 ? 's' : ''}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {igrejas.map(igreja => {
            const qtdUsuarios = profiles.filter(p => p.igreja_id === igreja.id).length
            return (
              <div key={igreja.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  {editando === igreja.id ? (
                    <input
                      value={nomeEdit}
                      onChange={e => setNomeEdit(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSalvarEdit(igreja.id)}
                      autoFocus
                      className="w-full border border-indigo-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  ) : (
                    <>
                      <div className="font-medium text-sm text-gray-800">{igreja.nome}</div>
                      <div className="text-xs text-gray-400">{qtdUsuarios} usuário{qtdUsuarios !== 1 ? 's' : ''}</div>
                    </>
                  )}
                </div>

                {editando === igreja.id ? (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleSalvarEdit(igreja.id)} disabled={saving}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition">
                      <Save size={16} />
                    </button>
                    <button onClick={() => setEditando(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                      <X size={16} />
                    </button>
                  </div>
                ) : confirmDel === igreja.id ? (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-red-600">Confirmar?</span>
                    <button onClick={() => handleExcluir(igreja.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg">Sim</button>
                    <button onClick={() => setConfirmDel(null)} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">Não</button>
                  </div>
                ) : (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleEditar(igreja)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Editar nome">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setConfirmDel(igreja.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Excluir igreja">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          {igrejas.length === 0 && (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">Nenhuma igreja cadastrada.</div>
          )}
        </div>
      </div>

      {confirmDel && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p>Excluir uma igreja remove todos os dados associados (turmas, alunos, chamadas). Esta ação não pode ser desfeita.</p>
        </div>
      )}
    </div>
  )
}

// ─── Aba Usuários ─────────────────────────────────────────────────────────────

function AbaUsuarios({ profiles, igrejaNome, igrejas, reload }) {
  const [editRole, setEditRole]   = useState(null)
  const [editIgreja, setEditIgreja] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [filtro, setFiltro]       = useState('todos')

  const filtrados = profiles.filter(p => {
    if (filtro === 'todos') return true
    return p.role === filtro
  })

  const handleSalvarEdicao = async (profileId) => {
    setSaving(true)
    await supabase.from('profiles').update({
      role:      editRole,
      igreja_id: editIgreja || null,
    }).eq('id', profileId)
    setSaving(false)
    setEditRole(null)
    setEditIgreja(null)
    reload()
  }

  const handleRemoverAcesso = async (profileId) => {
    await supabase.from('profiles').update({ igreja_id: null }).eq('id', profileId)
    setConfirmDel(null)
    reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Filtrar:</span>
        {['todos', 'admin', 'secretaria'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              filtro === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'todos' ? 'Todos' : ROLE_LABEL[f]}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-auto">{filtrados.length} usuário{filtrados.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600 text-xs">Nome</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-xs">Função</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-xs">Igreja</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-xs text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtrados.map(p => {
              const isEditing = editRole !== null && confirmDel !== p.id && saving === false && editRole !== null
                ? false : false
              const editing = editRole !== null && profiles.find(x => x.id === p.id) && editRole !== null

              return (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{p.nome || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    {confirmDel !== p.id && editRole !== null && profiles.indexOf(p) === profiles.findIndex(x => x.id === p.id) && false ? null : (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[p.role] || 'bg-gray-100 text-gray-600'}`}>
                        {ROLE_LABEL[p.role] || p.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{p.igreja_id ? igrejaNome(p.igreja_id) : <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-right">
                    {confirmDel === p.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-red-600">Remover acesso?</span>
                        <button onClick={() => handleRemoverAcesso(p.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg">Sim</button>
                        <button onClick={() => setConfirmDel(null)} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">Não</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditRole(p.role); setEditIgreja(p.igreja_id); setConfirmDel('edit_' + p.id) }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setConfirmDel(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Remover acesso">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtrados.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de edição */}
      {confirmDel?.startsWith?.('edit_') && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h4 className="text-lg font-bold text-gray-800">Editar usuário</h4>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Função</label>
              <select value={editRole} onChange={e => setEditRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="admin">Admin (pastor)</option>
                <option value="secretaria">Secretária</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Igreja</label>
              <select value={editIgreja || ''} onChange={e => setEditIgreja(e.target.value || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Sem igreja</option>
                {igrejas.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => { setConfirmDel(null); setEditRole(null); setEditIgreja(null) }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                Cancelar
              </button>
              <button
                onClick={() => {
                  const id = confirmDel.replace('edit_', '')
                  handleSalvarEdicao(id)
                  setConfirmDel(null)
                }}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Aba Criar Usuário ────────────────────────────────────────────────────────

function AbaCriar({ igrejas, reload, setAba }) {
  const [form, setForm]         = useState({ email: '', senha: '', nome: '', role: 'secretaria' })
  const [igrejaSel, setIgrejaSel] = useState(igrejas[0]?.id || '')
  const [criando, setCriando]   = useState(false)
  const [msgForm, setMsgForm]   = useState(null)
  const [showSenha, setShowSenha] = useState(false)

  const handleCriar = async (e) => {
    e.preventDefault()
    setMsgForm(null)
    setCriando(true)
    try {
      const igId = form.role === 'admin' ? null : igrejaSel || null

      const { data, error } = await supabase.functions.invoke('criar-usuario', {
        body: { email: form.email, password: form.senha, nome: form.nome, role: form.role, igreja_id: igId },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      setMsgForm({ tipo: 'ok', texto: `Usuário ${form.email} criado com sucesso!` })
      setForm({ email: '', senha: '', nome: '', role: 'secretaria' })
      reload()
    } catch (err) {
      setMsgForm({ tipo: 'erro', texto: err.message || 'Erro ao criar usuário.' })
    }
    setCriando(false)
  }

  return (
    <div className="max-w-lg space-y-5">
      <p className="text-sm text-gray-500">O usuário será criado já confirmado e poderá logar imediatamente.</p>

      <form onSubmit={handleCriar} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Função</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="secretaria">Secretária</option>
              <option value="admin">Admin (pastor)</option>
            </select>
          </div>
        </div>

        {form.role === 'secretaria' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Igreja</label>
            <select value={igrejaSel} onChange={e => setIgrejaSel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {igrejas.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
        )}

        {form.role === 'admin' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            O admin fará login e configurará o nome da própria igreja no primeiro acesso.
          </div>
        )}

        {msgForm && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${msgForm.tipo === 'ok' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {msgForm.tipo === 'ok' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
            {msgForm.texto}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={criando}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {criando ? 'Criando...' : 'Criar usuário'}
          </button>
          {msgForm?.tipo === 'ok' && (
            <button type="button" onClick={() => setAba('usuarios')}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Ver usuários
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
