import { useState, useEffect } from 'react'
import { ClipboardList, Users, Pencil, Trash2, Search } from 'lucide-react'
import { getTurmas, getAlunos, saveAluno, deleteAluno } from '../utils/storage'
import { getCor } from '../utils/colors'

function SeletorTurma({ navigate }) {
  const turmas = getTurmas()
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Alunos</h2>
        <p className="text-gray-500">Selecione a turma para gerenciar os alunos.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {turmas.map(turma => {
          const cor = getCor(turma.cor)
          const total = getAlunos(turma.id).length
          return (
            <button
              key={turma.id}
              onClick={() => navigate('alunos', { turmaId: turma.id })}
              className={`text-left p-4 rounded-xl border-2 ${cor.bg} ${cor.border} hover:shadow-md transition`}
            >
              <p className={`font-bold text-lg ${cor.text}`}>{turma.nome}</p>
              <p className="text-sm text-gray-500 mt-1">{total} aluno{total !== 1 ? 's' : ''}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Alunos({ params, navigate }) {
  const { turmaId } = params
  const [turma, setTurma] = useState(null)
  const [alunos, setAlunos] = useState([])
  const [nome, setNome] = useState('')
  const [matricula, setMatricula] = useState('')
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [busca, setBusca] = useState('')

  const load = () => {
    if (!turmaId) return
    const t = getTurmas().find(t => t.id === turmaId)
    setTurma(t)
    setAlunos(getAlunos(turmaId).sort((a, b) => a.nome.localeCompare(b.nome)))
  }

  useEffect(() => { load() }, [turmaId])

  if (!turmaId) return <SeletorTurma navigate={navigate} />

  const handleAdd = (e) => {
    e.preventDefault()
    if (!nome.trim()) return
    saveAluno({
      id: `aluno_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      nome: nome.trim(),
      matricula: matricula.trim(),
      turmaId,
    })
    setNome('')
    setMatricula('')
    load()
  }

  const handleSaveEdit = () => {
    if (!editando.nome.trim()) return
    saveAluno({ ...editando, nome: editando.nome.trim(), matricula: editando.matricula?.trim() || '' })
    setEditando(null)
    load()
  }

  const handleDelete = (id) => {
    deleteAluno(id)
    setConfirmDelete(null)
    load()
  }

  const filtrados = alunos.filter(a =>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.matricula?.toLowerCase().includes(busca.toLowerCase())
  )

  if (!turma) return null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{turma.nome} — Alunos</h2>
          <p className="text-gray-500">{alunos.length} aluno{alunos.length !== 1 ? 's' : ''} matriculado{alunos.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('chamada', { turmaId, data: new Date().toISOString().split('T')[0] })}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <ClipboardList size={15} className="text-white" />
          Fazer Chamada
        </button>
      </div>

      {/* Formulário de cadastro */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Matricular novo aluno</h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Nome completo *"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="text"
            placeholder="Matrícula (opcional)"
            value={matricula}
            onChange={e => setMatricula(e.target.value)}
            className="w-full sm:w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="submit"
            disabled={!nome.trim()}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Matricular
          </button>
        </form>
      </div>

      {/* Busca */}
      {alunos.length > 5 && (
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar aluno..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      )}

      {/* Lista */}
      {alunos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="flex justify-center mb-3">
            <Users size={48} className="text-indigo-200" />
          </div>
          <p className="text-gray-400">Nenhum aluno matriculado.</p>
          <p className="text-gray-400 text-sm mt-1">Use o formulário acima para adicionar.</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Nenhum aluno encontrado para "{busca}"</div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((aluno, idx) => (
            <div key={aluno.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {idx + 1}
              </div>

              {editando?.id === aluno.id ? (
                <div className="flex-1 flex gap-2 flex-wrap items-center">
                  <input
                    value={editando.nome}
                    onChange={e => setEditando({ ...editando, nome: e.target.value })}
                    className="flex-1 border border-indigo-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    autoFocus
                  />
                  <input
                    value={editando.matricula || ''}
                    onChange={e => setEditando({ ...editando, matricula: e.target.value })}
                    placeholder="Matrícula"
                    className="w-32 border border-indigo-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                  />
                  <button onClick={handleSaveEdit} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium">Salvar</button>
                  <button onClick={() => setEditando(null)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancelar</button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{aluno.nome}</div>
                    {aluno.matricula && <div className="text-xs text-gray-400">Mat: {aluno.matricula}</div>}
                  </div>

                  <button
                    onClick={() => setEditando({ ...aluno })}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>

                  {confirmDelete === aluno.id ? (
                    <div className="flex gap-1 items-center">
                      <span className="text-xs text-red-600 mr-1">Confirmar?</span>
                      <button onClick={() => handleDelete(aluno.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg font-medium">Sim</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">Não</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(aluno.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Remover aluno"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
