import { useState, useEffect, useMemo } from 'react'
import {
  Users, BarChart2, CheckCircle, XCircle, RefreshCw,
  Check, X, Save, Search, ChevronRight, ChevronLeft, Star, Pencil,
} from 'lucide-react'
import {
  getTurmas, getAlunos, getChamadaByData, saveChamada,
  getCategorias, calcularPontosRegistro,
} from '../utils/storage'
import { formatDateFull } from '../utils/dates'
import { useAuth } from '../contexts/AuthContext'

export default function Chamada({ params, navigate }) {
  const { turmaId, data }    = params
  const { profile }          = useAuth()
  const igrejaId             = profile?.igreja_id

  const [turma, setTurma]           = useState(null)
  const [alunos, setAlunos]         = useState([])
  const [registros, setRegistros]   = useState({})
  const [extras, setExtras]         = useState({})
  const [configCats, setConfigCats] = useState([])
  const [busca, setBusca]           = useState('')
  const [saved, setSaved]           = useState(false)
  const [saving, setSaving]         = useState(false)
  const [recentSave, setRecentSave] = useState(false)
  const [modo, setModo]             = useState(null)
  const [abaView, setAbaView]       = useState('presenca')
  const [etapa, setEtapa]           = useState(1)

  useEffect(() => {
    if (!turmaId || !igrejaId) return
    const load = async () => {
      const [turmas, lista, cats, existente] = await Promise.all([
        getTurmas(),
        getAlunos(turmaId),
        getCategorias(),
        getChamadaByData(turmaId, data),
      ])

      const t = turmas.find(t => t.id === turmaId)
      setTurma(t)

      const sorted = lista.sort((a, b) => a.nome.localeCompare(b.nome))
      setAlunos(sorted)
      setConfigCats(cats)

      const presMap = {}
      const extMap  = {}
      const catsSem = cats.filter(c => c.id !== 'presenca')

      sorted.forEach(a => {
        presMap[a.id] = null
        extMap[a.id]  = {}
        catsSem.forEach(c => {
          extMap[a.id][c.id] = (c.tipo === 'currency' || c.tipo === 'numeric') ? '' : false
        })
        if (existente) {
          const reg = existente.registros.find(r => r.alunoId === a.id)
          if (reg) {
            presMap[a.id] = reg.presente === true ? true : reg.presente === false ? false : null
            if (reg.categorias) {
              catsSem.forEach(c => {
                if (reg.categorias[c.id] !== undefined) extMap[a.id][c.id] = reg.categorias[c.id]
              })
            }
          }
        }
      })

      setRegistros(presMap)
      setExtras(extMap)
      setModo(existente ? 'view' : 'novo')
    }
    load()
  }, [turmaId, data, igrejaId])

  // ── Computed ────────────────────────────────────────────────────────────────

  const presentes   = Object.values(registros).filter(v => v === true).length
  const ausentes    = Object.values(registros).filter(v => v === false).length
  const naoMarcados = Object.values(registros).filter(v => v === null).length

  const catsSemPresenca = configCats.filter(c => c.id !== 'presenca' && c.id !== 'ausencia' && c.ativo)

  const totalPontos = useMemo(() => alunos.reduce((sum, a) => {
    return sum + calcularPontosRegistro({ presente: registros[a.id] === true, categorias: extras[a.id] || {} }, configCats)
  }, 0), [alunos, registros, extras, configCats])

  // ── Presença handlers ───────────────────────────────────────────────────────

  const toggle = (alunoId) => {
    setSaved(false)
    setRegistros(prev => {
      const cur = prev[alunoId]
      return { ...prev, [alunoId]: cur === null ? true : cur === true ? false : null }
    })
  }

  const marcarTodos = (presente) => {
    setSaved(false)
    const map = {}
    alunos.forEach(a => { map[a.id] = presente })
    setRegistros(map)
  }

  const limpar = () => {
    setSaved(false)
    const map = {}
    alunos.forEach(a => { map[a.id] = null })
    setRegistros(map)
  }

  // ── Extras handlers ─────────────────────────────────────────────────────────

  const toggleExtra = (alunoId, catId) => {
    setSaved(false)
    setExtras(prev => ({ ...prev, [alunoId]: { ...prev[alunoId], [catId]: !prev[alunoId][catId] } }))
  }

  const setNumerico = (alunoId, catId, value) => {
    setSaved(false)
    setExtras(prev => ({ ...prev, [alunoId]: { ...prev[alunoId], [catId]: value } }))
  }

  // ── Save helpers ────────────────────────────────────────────────────────────

  const buildRegistros = (preservarExtras, existente) =>
    alunos.map(a => {
      const presente = registros[a.id] === true
      const regEx    = existente?.registros.find(r => r.alunoId === a.id)
      return {
        alunoId:    a.id,
        presente,
        categorias: preservarExtras && presente ? (regEx?.categorias || {}) : {},
      }
    })

  const buildRegistrosComExtras = () =>
    alunos.map(a => ({
      alunoId:    a.id,
      presente:   registros[a.id] === true,
      categorias: registros[a.id] === true ? (extras[a.id] || {}) : {},
    }))

  const handleSalvarPresenca = async () => {
    setSaving(true)
    const existente = await getChamadaByData(turmaId, data)
    await saveChamada({ turmaId, data, registros: buildRegistros(true, existente) }, igrejaId)
    setSaving(false)
    setModo('view')
    setAbaView('presenca')
    setRecentSave(true)
  }

  const handleSalvarPontuacao = async () => {
    setSaving(true)
    await saveChamada({ turmaId, data, registros: buildRegistrosComExtras() }, igrejaId)
    setSaving(false)
    setModo('view')
    setAbaView('pontuacao')
    setRecentSave(true)
  }

  const handleProximo = async () => {
    setSaving(true)
    await saveChamada({ turmaId, data, registros: buildRegistros(false, null) }, igrejaId)
    setSaving(false)
    setEtapa(2)
    window.scrollTo(0, 0)
  }

  const handleSalvarNovo = async () => {
    setSaving(true)
    await saveChamada({ turmaId, data, registros: buildRegistrosComExtras() }, igrejaId)
    setSaving(false)
    setSaved(true)
  }

  if (modo === null || !turma) return (
    <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
  )

  // ── Reusable bits ───────────────────────────────────────────────────────────

  const TurmaHeader = ({ rightContent, showBack, onBack }) => (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={onBack} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition">
              <ChevronLeft size={18} />
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-800">{turma.nome}</h2>
        </div>
        <p className={`text-gray-500 capitalize ${showBack ? 'pl-9' : ''}`}>{formatDateFull(data)}</p>
      </div>
      {rightContent}
    </div>
  )

  const PresencaGrid = ({ readonly = false }) => {
    const filtrados = readonly
      ? alunos
      : alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()))

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtrados.map((aluno, idx) => {
          const status = registros[aluno.id]
          const base = `flex items-center gap-3 p-3 rounded-xl border-2 text-left transition`
          const cor  = status === true ? 'bg-green-50 border-green-400'
                     : status === false ? 'bg-red-50 border-red-400'
                     : 'bg-white border-gray-200'
          const avatar = (
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${status === true ? 'bg-green-500' : status === false ? 'bg-red-500' : 'bg-gray-200'}`}>
              {status === true ? <Check size={16} className="text-white" /> : status === false ? <X size={16} className="text-white" /> : <span className="text-sm font-bold text-gray-500">{idx + 1}</span>}
            </div>
          )
          const label = (
            <div className="flex-1 min-w-0">
              <div className={`font-medium truncate ${status === true ? 'text-green-800' : status === false ? 'text-red-800' : 'text-gray-700'}`}>{aluno.nome}</div>
              {aluno.matricula && <div className="text-xs text-gray-400">Mat: {aluno.matricula}</div>}
            </div>
          )
          const badge = (
            <span className={`text-xs font-semibold flex-shrink-0 ${status === true ? 'text-green-600' : status === false ? 'text-red-500' : 'text-gray-300'}`}>
              {status === true ? 'Presente' : status === false ? 'Ausente' : '—'}
            </span>
          )
          return readonly ? (
            <div key={aluno.id} className={`${base} ${cor}`}>{avatar}{label}{badge}</div>
          ) : (
            <button key={aluno.id} onClick={() => toggle(aluno.id)} className={`${base} ${cor} select-none active:scale-95 hover:border-gray-300`}>
              {avatar}{label}{badge}
            </button>
          )
        })}
      </div>
    )
  }

  const PontuacaoLista = ({ readonly = false }) => {
    const alunosOrd = [...alunos].sort((a, b) => {
      const ap = registros[a.id] === true, bp = registros[b.id] === true
      if (ap === bp) return a.nome.localeCompare(b.nome)
      return ap ? -1 : 1
    })

    return (
      <div className="space-y-2">
        {alunosOrd.map(aluno => {
          const presente = registros[aluno.id] === true
          const pts = calcularPontosRegistro({ presente, categorias: extras[aluno.id] || {} }, configCats)

          return (
            <div key={aluno.id} className={`rounded-xl border-2 p-3 transition ${presente ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-50 pointer-events-none select-none'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${presente ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {presente ? <Check size={14} className="text-white" /> : <X size={14} className="text-white" />}
                  </div>
                  <span className={`font-medium ${presente ? 'text-gray-800' : 'text-gray-400'}`}>{aluno.nome}</span>
                </div>
                {presente
                  ? <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{pts} pts</span>
                  : pts < 0 && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{pts} pts</span>
                }
              </div>

              {presente && (
                <div className="flex flex-wrap gap-2 pl-9">
                  {catsSemPresenca.map(cat => {
                    if (readonly) {
                      const val = extras[aluno.id]?.[cat.id]
                      const temValor = cat.tipo === 'boolean' ? !!val : parseFloat(val) > 0
                      return temValor ? (
                        <span key={cat.id} className="text-xs px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 font-medium">
                          {cat.nome}{cat.tipo === 'currency' ? ` R$${parseFloat(val).toFixed(0)}` : cat.tipo === 'numeric' ? ` ${parseInt(val)}x` : ' ✓'}
                        </span>
                      ) : (
                        <span key={cat.id} className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 text-gray-400">{cat.nome}</span>
                      )
                    }

                    if (cat.tipo === 'currency') return (
                      <div key={cat.id} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                        <span className="text-xs text-gray-500">R$</span>
                        <input type="number" min="0" step="0.01" placeholder="0"
                          value={extras[aluno.id]?.[cat.id] ?? ''}
                          onChange={e => setNumerico(aluno.id, cat.id, e.target.value)}
                          className="w-14 text-xs text-center focus:outline-none bg-transparent font-medium text-gray-700"
                        />
                        <span className="text-xs text-gray-400">{cat.nome}</span>
                      </div>
                    )

                    if (cat.tipo === 'numeric') return (
                      <div key={cat.id} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                        <input type="number" min="0" step="1" placeholder="0"
                          value={extras[aluno.id]?.[cat.id] ?? ''}
                          onChange={e => setNumerico(aluno.id, cat.id, e.target.value)}
                          className="w-10 text-xs text-center focus:outline-none bg-transparent font-medium text-gray-700"
                        />
                        <span className="text-xs text-gray-400">{cat.nome}</span>
                      </div>
                    )

                    const marcado = extras[aluno.id]?.[cat.id] === true
                    return (
                      <button key={cat.id} onClick={() => toggleExtra(aluno.id, cat.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${marcado ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'}`}
                      >
                        {marcado && <Check size={11} />}
                        {cat.nome}
                        {!marcado && <span className="text-gray-300">+{cat.pontos}</span>}
                      </button>
                    )
                  })}
                </div>
              )}
              {!presente && (
                <div className="pl-9 text-xs text-gray-400">
                  {pts < 0 ? `−${Math.abs(pts)} pts por ausência` : 'Ausente — sem pontuação'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const ContadoresPresenca = () => (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
        <div className="text-3xl font-bold text-green-600">{presentes}</div>
        <div className="text-xs font-medium text-green-600 mt-1">Presentes</div>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
        <div className="text-3xl font-bold text-red-500">{ausentes}</div>
        <div className="text-xs font-medium text-red-500 mt-1">Ausentes</div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
        <div className="text-3xl font-bold text-gray-400">{naoMarcados}</div>
        <div className="text-xs font-medium text-gray-400 mt-1">Não marcados</div>
      </div>
    </div>
  )

  const BtnSalvar = ({ onClick, label }) => (
    <button
      onClick={onClick}
      disabled={saving}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-lg transition shadow-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
    >
      <Save size={20} className="text-white" />
      {saving ? 'Salvando...' : label}
    </button>
  )

  // ── VIEW MODE ────────────────────────────────────────────────────────────────

  if (modo === 'view') return (
    <div className="space-y-4">
      <TurmaHeader rightContent={
        <div className="flex gap-2 no-print">
          <button onClick={() => navigate('alunos', { turmaId })} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-gray-600">
            <Users size={15} className="text-indigo-600" /> Alunos
          </button>
          <button onClick={() => navigate('historico', { turmaId })} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-gray-600">
            <BarChart2 size={15} className="text-indigo-600" /> Histórico
          </button>
        </div>
      } />

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit no-print">
        {['presenca', 'pontuacao'].map(aba => (
          <button key={aba} onClick={() => setAbaView(aba)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${abaView === aba ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {aba === 'presenca' ? 'Presença' : 'Pontuação'}
          </button>
        ))}
      </div>

      {abaView === 'presenca' && (
        <>
          <ContadoresPresenca />
          <PresencaGrid readonly />
          <button onClick={() => setModo('edit-presenca')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-indigo-700 border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition no-print"
          >
            <Pencil size={16} /> Editar Presença
          </button>
        </>
      )}

      {abaView === 'pontuacao' && (
        <>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
            <span className="font-semibold text-indigo-700">Total da turma</span>
            <span className="text-2xl font-black text-indigo-700">{totalPontos} pts</span>
          </div>
          <PontuacaoLista readonly />
          <button onClick={() => setModo('edit-pontuacao')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-indigo-700 border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition no-print"
          >
            <Pencil size={16} /> Editar Pontuação
          </button>
        </>
      )}
      {recentSave && (
        <button onClick={() => navigate('home')}
          className="w-full py-2.5 rounded-xl font-semibold text-gray-600 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition no-print"
        >
          Voltar para o início
        </button>
      )}
    </div>
  )

  // ── EDIT-PRESENÇA ────────────────────────────────────────────────────────────

  if (modo === 'edit-presenca') {
    const filtrados = alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()))
    return (
      <div className="space-y-4">
        <TurmaHeader showBack onBack={() => setModo('view')} />
        <span className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full text-sm no-print">
          <Pencil size={13} /> Editando Presença
        </span>
        <ContadoresPresenca />
        <div className="flex gap-2 flex-wrap no-print">
          <button onClick={() => marcarTodos(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition">
            <CheckCircle size={15} className="text-white" /> Todos presentes
          </button>
          <button onClick={() => marcarTodos(false)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition">
            <XCircle size={15} className="text-white" /> Todos ausentes
          </button>
          <button onClick={limpar} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition">
            <RefreshCw size={15} className="text-gray-500" /> Limpar
          </button>
        </div>
        <div className="relative no-print">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar aluno..." value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        {filtrados.length === 0
          ? <div className="text-center py-10 text-gray-400">Nenhum aluno encontrado</div>
          : <PresencaGrid />
        }
        <div className="pt-2 no-print flex flex-col gap-2">
          <BtnSalvar onClick={handleSalvarPresenca} label="Salvar Presença" />
          <button onClick={() => setModo('view')} className="w-full py-2.5 rounded-xl font-semibold text-gray-600 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition">
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  // ── EDIT-PONTUAÇÃO ───────────────────────────────────────────────────────────

  if (modo === 'edit-pontuacao') return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => setModo('view')} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{turma.nome}</h2>
          </div>
          <p className="text-gray-500 capitalize pl-9">{formatDateFull(data)}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-black text-indigo-700">{totalPontos} pts</div>
          <div className="text-xs text-gray-400">total da turma</div>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full text-sm no-print">
        <Pencil size={13} /> Editando Pontuação
      </span>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{presentes}</div>
          <div className="text-xs font-medium text-green-600 mt-1">Presentes</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-500">{ausentes}</div>
          <div className="text-xs font-medium text-red-500 mt-1">Ausentes</div>
        </div>
      </div>
      <PontuacaoLista />
      <div className="pt-2 no-print flex flex-col gap-2">
        <BtnSalvar onClick={handleSalvarPontuacao} label="Salvar Pontuação" />
        <button onClick={() => setModo('view')} className="w-full py-2.5 rounded-xl font-semibold text-gray-600 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition">
          Cancelar
        </button>
      </div>
    </div>
  )

  // ── NOVO — etapa 2 ───────────────────────────────────────────────────────────

  if (etapa === 2) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setEtapa(1); setSaved(false) }} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{turma.nome}</h2>
          </div>
          <p className="text-gray-500 capitalize pl-9">{formatDateFull(data)}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-black text-indigo-700">{totalPontos} pts</div>
          <div className="text-xs text-gray-400">total da turma</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm no-print">
        <span className="flex items-center gap-1.5 text-gray-400">
          <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</span>
          Presença
        </span>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">2</span>
          Pontuações
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{presentes}</div>
          <div className="text-xs font-medium text-green-600 mt-1">Presentes</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-500">{ausentes}</div>
          <div className="text-xs font-medium text-red-500 mt-1">Ausentes</div>
        </div>
      </div>
      <PontuacaoLista />
      <div className="pt-2 no-print">
        <button
          onClick={handleSalvarNovo}
          disabled={saving || saved}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-lg transition shadow-md ${saved ? 'bg-green-500 cursor-default' : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60'}`}
        >
          {saved ? <><CheckCircle size={20} className="text-white" /> Chamada Salva!</> : <><Save size={20} className="text-white" /> {saving ? 'Salvando...' : 'Salvar Chamada'}</>}
        </button>
        {saved && (
          <>
            <p className="text-center text-sm text-gray-500 mt-2">
              Pontuação da turma: <strong className="text-indigo-700">{totalPontos} pontos</strong>
            </p>
            <button onClick={() => navigate('home')} className="w-full mt-2 py-2.5 rounded-xl font-semibold text-indigo-700 border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition">
              Voltar para o início
            </button>
          </>
        )}
      </div>
    </div>
  )

  // ── NOVO — etapa 1 ───────────────────────────────────────────────────────────

  const filtrados = alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()))
  return (
    <div className="space-y-4">
      <TurmaHeader rightContent={
        <div className="flex gap-2 no-print">
          <button onClick={() => navigate('alunos', { turmaId })} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-gray-600">
            <Users size={15} className="text-indigo-600" /> Alunos
          </button>
          <button onClick={() => navigate('historico', { turmaId })} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-gray-600">
            <BarChart2 size={15} className="text-indigo-600" /> Histórico
          </button>
        </div>
      } />
      <div className="flex items-center gap-2 text-sm no-print">
        <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">1</span>
          Presença
        </span>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="flex items-center gap-1.5 text-gray-400">
          <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold">2</span>
          Pontuações
        </span>
      </div>
      <ContadoresPresenca />
      <div className="flex gap-2 flex-wrap no-print">
        <button onClick={() => marcarTodos(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition">
          <CheckCircle size={15} className="text-white" /> Todos presentes
        </button>
        <button onClick={() => marcarTodos(false)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition">
          <XCircle size={15} className="text-white" /> Todos ausentes
        </button>
        <button onClick={limpar} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition">
          <RefreshCw size={15} className="text-gray-500" /> Limpar
        </button>
      </div>
      <div className="relative no-print">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar aluno..." value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      {filtrados.length === 0
        ? <div className="text-center py-10 text-gray-400">Nenhum aluno encontrado</div>
        : <PresencaGrid />
      }
      <div className="pt-2 no-print">
        <button
          onClick={handleProximo}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-lg transition shadow-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
        >
          <Star size={20} className="text-white" />
          {saving ? 'Salvando...' : 'Próximo: Pontuações'}
          <ChevronRight size={20} className="text-white" />
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">
          Marque as presenças e avance para registrar a pontuação da turma
        </p>
      </div>
    </div>
  )
}
