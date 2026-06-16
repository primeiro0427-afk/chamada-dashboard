import { useState, useEffect } from 'react'
import { GraduationCap, ChevronUp, ChevronDown, Trash2, AlertTriangle, CheckCircle, Save, Star, Users, Copy, Upload } from 'lucide-react'
import { getTurmas, saveTurmas, getChamadas, getCategorias, saveCategorias, DEFAULT_CATEGORIAS, importarBackup } from '../utils/storage'
import { getCor, CORES_LISTA } from '../utils/colors'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabase'

// ─── Seção: Turmas ────────────────────────────────────────────────────────────

function SecaoTurmas({ igrejaId }) {
  const [turmas, setTurmas]   = useState([])
  const [deletando, setDeletando] = useState(null)
  const [saved, setSaved]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [erro, setErro]       = useState('')

  useEffect(() => { getTurmas().then(setTurmas) }, [])

  const setField = (id, field, value) => {
    setSaved(false)
    setErro('')
    setTurmas(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  const mover = (idx, dir) => {
    const alvo = idx + dir
    if (alvo < 0 || alvo >= turmas.length) return
    setSaved(false)
    const nova = [...turmas]
    ;[nova[idx], nova[alvo]] = [nova[alvo], nova[idx]]
    setTurmas(nova)
  }

  const adicionarTurma = () => {
    setSaved(false)
    const usadas   = new Set(turmas.map(t => t.cor))
    const corLivre = CORES_LISTA.find(c => !usadas.has(c.key))?.key || CORES_LISTA[turmas.length % CORES_LISTA.length].key
    setTurmas(prev => [...prev, {
      id:   crypto.randomUUID(),
      nome: `Turma ${String.fromCharCode(65 + prev.length)}`,
      cor:  corLivre,
    }])
  }

  const pedirDelete = async (id) => {
    const [alunos, chamadas] = await Promise.all([
      import('../utils/storage').then(m => m.getAlunos(id)),
      getChamadas(id),
    ])
    setDeletando({ id, temAlunos: alunos.length > 0, temChamadas: chamadas.length > 0 })
  }

  const confirmarDelete = () => {
    setSaved(false)
    setTurmas(prev => prev.filter(t => t.id !== deletando.id))
    setDeletando(null)
  }

  const salvar = async () => {
    const vazio = turmas.find(t => !t.nome.trim())
    if (vazio) { setErro('Todas as turmas precisam ter um nome.'); return }
    setSaving(true)
    await saveTurmas(turmas.map(t => ({ ...t, nome: t.nome.trim() })), igrejaId)
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Turmas</h3>
          <p className="text-sm text-gray-500">Defina nomes, cores e a quantidade de turmas do sistema.</p>
        </div>
        <button onClick={adicionarTurma} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition flex-shrink-0">
          + Nova turma
        </button>
      </div>

      {turmas.length === 0 ? (
        <div className="text-center py-10 text-gray-400 border border-dashed border-gray-300 rounded-xl">
          <p>Nenhuma turma cadastrada.</p>
          <p className="text-sm mt-1">Clique em "Nova turma" para adicionar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {turmas.map((turma, idx) => {
            const cor = getCor(turma.cor)
            return (
              <div key={turma.id} className={`rounded-xl border-2 ${cor.bg} ${cor.border} p-3`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button onClick={() => mover(idx, -1)} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded transition" title="Mover para cima">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => mover(idx, 1)} disabled={idx === turmas.length - 1} className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded transition" title="Mover para baixo">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-gray-400 w-5 text-center flex-shrink-0">{idx + 1}</span>
                  <input
                    type="text"
                    value={turma.nome}
                    onChange={e => setField(turma.id, 'nome', e.target.value)}
                    placeholder="Nome da turma"
                    className={`flex-1 min-w-32 border rounded-lg px-3 py-1.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 ${!turma.nome.trim() ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {CORES_LISTA.map(c => (
                      <button key={c.key} onClick={() => setField(turma.id, 'cor', c.key)} title={c.label}
                        className={`w-5 h-5 rounded-full ${c.dot} transition-transform ${turma.cor === c.key ? 'ring-2 ring-offset-1 ring-gray-600 scale-125' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                  <button onClick={() => pedirDelete(turma.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0" title="Remover turma">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
        <button onClick={salvar} disabled={saving || turmas.some(t => !t.nome.trim())}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition ${saved ? 'bg-green-500 cursor-default' : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed'}`}
        >
          {saved ? <><CheckCircle size={16} className="text-white" /> Salvo!</> : <><Save size={16} className="text-white" /> {saving ? 'Salvando...' : 'Salvar alterações'}</>}
        </button>
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        {saved && <p className="text-green-600 text-sm">As turmas foram atualizadas.</p>}
      </div>

      {deletando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h4 className="text-lg font-bold text-gray-800 mb-3">Remover esta turma?</h4>
            {(deletando.temAlunos || deletando.temChamadas) && (
              <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  Esta turma possui
                  {deletando.temAlunos && <strong> alunos matriculados</strong>}
                  {deletando.temAlunos && deletando.temChamadas && ' e'}
                  {deletando.temChamadas && <strong> chamadas registradas</strong>}.
                  <p className="mt-1 text-amber-700">Os dados ficam no banco, mas a turma não aparecerá mais na tela inicial.</p>
                </div>
              </div>
            )}
            <p className="text-gray-500 text-sm mb-5">A remoção só é aplicada ao clicar em "Salvar alterações".</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeletando(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancelar</button>
              <button onClick={confirmarDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition">Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Seção: Pontuação ─────────────────────────────────────────────────────────

function SecaoPontuacao({ igrejaId }) {
  const [cats, setCats]   = useState([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { getCategorias().then(setCats) }, [])

  const setField = (id, field, value) => {
    setSaved(false)
    setCats(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const restaurar = () => { setCats(DEFAULT_CATEGORIAS); setSaved(false) }

  const salvar = async () => {
    setSaving(true)
    await saveCategorias(cats, igrejaId)
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Pontuação</h3>
          <p className="text-sm text-gray-500">Configure os critérios e pontos de cada categoria da EBD.</p>
        </div>
        <button onClick={restaurar} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition flex-shrink-0">
          Restaurar padrão
        </button>
      </div>

      <div className="space-y-2">
        {cats.map(cat => (
          <div key={cat.id} className={`flex items-center gap-3 rounded-xl border p-3 transition ${cat.ativo ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
            <button
              onClick={() => cat.id !== 'presenca' && setField(cat.id, 'ativo', !cat.ativo)}
              disabled={cat.id === 'presenca'}
              className={`w-10 h-6 rounded-full flex-shrink-0 transition relative ${cat.ativo ? 'bg-indigo-600' : 'bg-gray-300'} ${cat.id === 'presenca' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              title={cat.id === 'presenca' ? 'Presença sempre ativa' : cat.ativo ? 'Desativar' : 'Ativar'}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${cat.ativo ? 'left-5' : 'left-1'}`} />
            </button>
            <span className="flex-1 text-sm font-medium text-gray-700">{cat.nome}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <input
                type="number" min="0" value={cat.pontos}
                onChange={e => setField(cat.id, 'pontos', parseInt(e.target.value) || 0)}
                className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <span className="text-xs text-gray-400 w-24">
                {cat.tipo === 'currency' ? 'pts por R$1' : cat.tipo === 'numeric' ? 'pts por visit.' : cat.tipo === 'ausencia' ? 'pts (desconto)' : 'pts'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
        <button onClick={salvar} disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition ${saved ? 'bg-green-500 cursor-default' : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40'}`}
        >
          {saved ? <><CheckCircle size={16} className="text-white" /> Salvo!</> : <><Save size={16} className="text-white" /> {saving ? 'Salvando...' : 'Salvar pontuação'}</>}
        </button>
        {saved && <p className="text-green-600 text-sm">Pontuação atualizada.</p>}
      </div>
    </div>
  )
}

// ─── Seção: Usuários ──────────────────────────────────────────────────────────

function SecaoUsuarios({ igrejaId }) {
  const [usuarios, setUsuarios] = useState([])
  const [copiado, setCopiado]   = useState(false)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('igreja_id', igrejaId).then(({ data }) => setUsuarios(data || []))
  }, [igrejaId])

  const copiar = () => {
    navigator.clipboard.writeText(igrejaId)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const ROLE_LABEL = { admin: 'Admin', secretaria: 'Secretária' }
  const ROLE_COLOR = { admin: 'bg-indigo-100 text-indigo-700', secretaria: 'bg-gray-100 text-gray-600' }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-800">Usuários</h3>
        <p className="text-sm text-gray-500">Usuários com acesso ao sistema da sua igreja.</p>
      </div>

      <div className="space-y-2">
        {usuarios.map(u => (
          <div key={u.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-800">{u.nome || '—'}</div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[u.role] || 'bg-gray-100 text-gray-600'}`}>
              {ROLE_LABEL[u.role] || u.role}
            </span>
          </div>
        ))}
        {usuarios.length === 0 && <p className="text-sm text-gray-400">Nenhum usuário encontrado.</p>}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Para adicionar ou remover usuários:</p>
        <p className="text-amber-700">Entre em contato com o administrador do sistema informando o ID da sua igreja:</p>
        <div className="flex items-center gap-2 mt-2">
          <code className="flex-1 bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs text-gray-700 break-all">{igrejaId}</code>
          <button onClick={copiar} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition flex-shrink-0" title="Copiar">
            {copiado ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Seção: Importar Backup ───────────────────────────────────────────────────

function SecaoImportar({ igrejaId }) {
  const [status, setStatus]   = useState(null) // null | 'loading' | 'ok' | 'erro'
  const [msg, setMsg]         = useState('')

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setStatus('loading')
    setMsg('')
    try {
      const texto = await file.text()
      const dados = JSON.parse(texto)
      if (!dados.turmas && !dados.alunos && !dados.chamadas) {
        throw new Error('Arquivo inválido — não parece um backup do sistema.')
      }
      await importarBackup(dados, igrejaId)
      setStatus('ok')
      setMsg(`Importado: ${dados.turmas?.length ?? 0} turmas, ${dados.alunos?.length ?? 0} alunos, ${dados.chamadas?.length ?? 0} chamadas.`)
    } catch (err) {
      setStatus('erro')
      setMsg(err.message || 'Erro ao importar.')
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-800">Importar Backup</h3>
        <p className="text-sm text-gray-500">Importe os dados do sistema antigo (arquivo JSON de backup).</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Antes de importar:</p>
        <ul className="list-disc list-inside space-y-1 text-amber-700">
          <li>Acesse o sistema antigo no seu computador</li>
          <li>Vá em <strong>Início → Exportar Backup</strong> e salve o arquivo JSON</li>
          <li>Volte aqui e selecione o arquivo abaixo</li>
        </ul>
      </div>

      <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition
        ${status === 'loading' ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}`}>
        <Upload size={32} className={status === 'loading' ? 'text-indigo-400' : 'text-gray-400'} />
        <span className="text-sm font-medium text-gray-600">
          {status === 'loading' ? 'Importando, aguarde...' : 'Clique para selecionar o arquivo JSON'}
        </span>
        <input type="file" accept=".json" onChange={handleFile} className="hidden" disabled={status === 'loading'} />
      </label>

      {status === 'ok' && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Importação concluída!</p>
            <p className="text-green-700 mt-0.5">{msg}</p>
            <p className="text-green-600 mt-1">Volte para o Início para ver os dados importados.</p>
          </div>
        </div>
      )}

      {status === 'erro' && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Erro na importação</p>
            <p className="text-red-700 mt-0.5">{msg}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Configuracoes() {
  const { profile } = useAuth()
  const igrejaId    = profile?.igreja_id
  const [secao, setSecao] = useState('turmas')

  const SECOES = [
    { id: 'turmas',    label: 'Turmas',    Icon: GraduationCap, desc: 'Nomes, cores e quantidade' },
    { id: 'pontuacao', label: 'Pontuação', Icon: Star,          desc: 'Critérios e pontos da EBD' },
    { id: 'usuarios',  label: 'Usuários',  Icon: Users,         desc: 'Secretárias e acessos' },
    { id: 'importar',  label: 'Importar',  Icon: Upload,        desc: 'Backup do sistema antigo' },
  ]

  const CONTEUDO = {
    turmas:    <SecaoTurmas    igrejaId={igrejaId} />,
    pontuacao: <SecaoPontuacao igrejaId={igrejaId} />,
    usuarios:  <SecaoUsuarios  igrejaId={igrejaId} />,
    importar:  <SecaoImportar  igrejaId={igrejaId} />,
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
        <p className="text-gray-500">Personalize o sistema de acordo com sua necessidade.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <nav className="w-full sm:w-52 flex-shrink-0">
          <ul className="space-y-1">
            {SECOES.map(s => {
              const ativo = secao === s.id
              return (
                <li key={s.id}>
                  <button onClick={() => setSecao(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${ativo ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <s.Icon size={16} className={ativo ? 'text-indigo-600' : 'text-gray-500'} />
                      {s.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 pl-6">{s.desc}</div>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 w-full">
          {CONTEUDO[secao] ?? <p className="text-gray-400">Seção não encontrada.</p>}
        </div>
      </div>
    </div>
  )
}
