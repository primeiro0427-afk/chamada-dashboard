import { useState, useEffect } from 'react'
import { GraduationCap, ChevronUp, ChevronDown, Trash2, AlertTriangle, CheckCircle, Save, Star } from 'lucide-react'
import { getTurmas, saveTurmas, getAlunos, getChamadas, getCategorias, saveCategorias, DEFAULT_CATEGORIAS } from '../utils/storage'
import { getCor, CORES_LISTA } from '../utils/colors'

// ─── Seção: Turmas ────────────────────────────────────────────────────────────

function SecaoTurmas() {
  const [turmas, setTurmas] = useState([])
  const [deletando, setDeletando] = useState(null)
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { setTurmas(getTurmas()) }, [])

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
    const usadas = new Set(turmas.map(t => t.cor))
    const corLivre = CORES_LISTA.find(c => !usadas.has(c.key))?.key || CORES_LISTA[turmas.length % CORES_LISTA.length].key
    setTurmas(prev => [
      ...prev,
      {
        id: `turma_${Date.now()}`,
        nome: `Turma ${String.fromCharCode(65 + prev.length)}`,
        cor: corLivre,
      },
    ])
  }

  const pedirDelete = (id) => {
    const temAlunos = getAlunos(id).length > 0
    const temChamadas = getChamadas(id).length > 0
    setDeletando({ id, temAlunos, temChamadas })
  }

  const confirmarDelete = () => {
    setSaved(false)
    setTurmas(prev => prev.filter(t => t.id !== deletando.id))
    setDeletando(null)
  }

  const salvar = () => {
    const vazio = turmas.find(t => !t.nome.trim())
    if (vazio) { setErro('Todas as turmas precisam ter um nome.'); return }
    saveTurmas(turmas.map(t => ({ ...t, nome: t.nome.trim() })))
    setSaved(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Turmas</h3>
          <p className="text-sm text-gray-500">Defina nomes, cores e a quantidade de turmas do sistema.</p>
        </div>
        <button
          onClick={adicionarTurma}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition flex-shrink-0"
        >
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

                  {/* Reordenar */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => mover(idx, -1)}
                      disabled={idx === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded transition"
                      title="Mover para cima"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => mover(idx, 1)}
                      disabled={idx === turmas.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded transition"
                      title="Mover para baixo"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Número */}
                  <span className="text-sm font-bold text-gray-400 w-5 text-center flex-shrink-0">{idx + 1}</span>

                  {/* Nome */}
                  <input
                    type="text"
                    value={turma.nome}
                    onChange={e => setField(turma.id, 'nome', e.target.value)}
                    placeholder="Nome da turma"
                    className={`flex-1 min-w-32 border rounded-lg px-3 py-1.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300
                      ${!turma.nome.trim() ? 'border-red-400' : 'border-gray-300'}`}
                  />

                  {/* Paleta de cores */}
                  <div className="flex gap-1.5 flex-wrap">
                    {CORES_LISTA.map(c => (
                      <button
                        key={c.key}
                        onClick={() => setField(turma.id, 'cor', c.key)}
                        title={c.label}
                        className={`w-5 h-5 rounded-full ${c.dot} transition-transform
                          ${turma.cor === c.key
                            ? 'ring-2 ring-offset-1 ring-gray-600 scale-125'
                            : 'hover:scale-110 opacity-70 hover:opacity-100'
                          }`}
                      />
                    ))}
                  </div>

                  {/* Deletar */}
                  <button
                    onClick={() => pedirDelete(turma.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                    title="Remover turma"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Salvar */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
        <button
          onClick={salvar}
          disabled={turmas.some(t => !t.nome.trim())}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition
            ${saved
              ? 'bg-green-500 cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
        >
          {saved
            ? <><CheckCircle size={16} className="text-white" /> Salvo!</>
            : <><Save size={16} className="text-white" /> Salvar alterações</>
          }
        </button>
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        {saved && <p className="text-green-600 text-sm">As turmas foram atualizadas.</p>}
      </div>

      {/* Modal de confirmação de exclusão */}
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
                  <p className="mt-1 text-amber-700">
                    Os dados ficam armazenados, mas a turma não aparecerá mais na tela inicial. Salve o backup antes de continuar.
                  </p>
                </div>
              </div>
            )}

            <p className="text-gray-500 text-sm mb-5">
              A remoção só é aplicada ao clicar em "Salvar alterações".
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeletando(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Seção: Pontuação ─────────────────────────────────────────────────────────

function SecaoPontuacao() {
  const [cats, setCats] = useState([])
  const [saved, setSaved] = useState(false)

  useEffect(() => { setCats(getCategorias()) }, [])

  const setField = (id, field, value) => {
    setSaved(false)
    setCats(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const restaurar = () => {
    setCats(DEFAULT_CATEGORIAS)
    setSaved(false)
  }

  const salvar = () => {
    saveCategorias(cats)
    setSaved(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Pontuação</h3>
          <p className="text-sm text-gray-500">Configure os critérios e pontos de cada categoria da EBD.</p>
        </div>
        <button
          onClick={restaurar}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition flex-shrink-0"
        >
          Restaurar padrão
        </button>
      </div>

      <div className="space-y-2">
        {cats.map(cat => (
          <div key={cat.id} className={`flex items-center gap-3 rounded-xl border p-3 transition
            ${cat.ativo ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}
          >
            {/* Toggle ativo — presença sempre ativa */}
            <button
              onClick={() => cat.id !== 'presenca' && setField(cat.id, 'ativo', !cat.ativo)}
              disabled={cat.id === 'presenca'}
              className={`w-10 h-6 rounded-full flex-shrink-0 transition relative
                ${cat.ativo ? 'bg-indigo-600' : 'bg-gray-300'}
                ${cat.id === 'presenca' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              title={cat.id === 'presenca' ? 'Presença sempre ativa' : cat.ativo ? 'Desativar' : 'Ativar'}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all
                ${cat.ativo ? 'left-5' : 'left-1'}`} />
            </button>

            {/* Nome */}
            <span className="flex-1 text-sm font-medium text-gray-700">{cat.nome}</span>

            {/* Pontos */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <input
                type="number"
                min="0"
                value={cat.pontos}
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
        <button
          onClick={salvar}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition
            ${saved ? 'bg-green-500 cursor-default' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {saved
            ? <><CheckCircle size={16} className="text-white" /> Salvo!</>
            : <><Save size={16} className="text-white" /> Salvar pontuação</>
          }
        </button>
        {saved && <p className="text-green-600 text-sm">Pontuação atualizada.</p>}
      </div>
    </div>
  )
}

// ─── Seções disponíveis ───────────────────────────────────────────────────────
// Para adicionar uma nova seção: inclua um objeto aqui e o componente correspondente em CONTEUDO.
// Use ícones do lucide-react no campo Icon.

const SECOES = [
  {
    id: 'turmas',
    label: 'Turmas',
    Icon: GraduationCap,
    desc: 'Nomes, cores e quantidade',
  },
  {
    id: 'pontuacao',
    label: 'Pontuação',
    Icon: Star,
    desc: 'Critérios e pontos da EBD',
  },
]

const CONTEUDO = {
  turmas:    <SecaoTurmas />,
  pontuacao: <SecaoPontuacao />,
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Configuracoes() {
  const [secao, setSecao] = useState('turmas')

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
        <p className="text-gray-500">Personalize o sistema de acordo com sua necessidade.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Sidebar de navegação */}
        <nav className="w-full sm:w-52 flex-shrink-0">
          <ul className="space-y-1">
            {SECOES.map(s => {
              const ativo = secao === s.id
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSecao(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition
                      ${ativo
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                      }`}
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

        {/* Conteúdo da seção selecionada */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 w-full">
          {CONTEUDO[secao] ?? <p className="text-gray-400">Seção não encontrada.</p>}
        </div>
      </div>
    </div>
  )
}
