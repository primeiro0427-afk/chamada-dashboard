import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, Clock, BarChart2, Users } from 'lucide-react'
import { getTurmas, getAlunos, getChamadaByData } from '../utils/storage'
import { getLastSundayOrToday, formatDateFull } from '../utils/dates'
import { getCor } from '../utils/colors'
import MiniCalendario from '../components/MiniCalendario'

export default function Home({ navigate }) {
  const [turmas, setTurmas]     = useState([])
  const [dataAula, setDataAula] = useState(getLastSundayOrToday())
  const [stats, setStats]       = useState({})
  const [loading, setLoading]   = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const t = await getTurmas()
    setTurmas(t)

    const s = {}
    await Promise.all(t.map(async turma => {
      const [alunos, chamada] = await Promise.all([
        getAlunos(turma.id),
        getChamadaByData(turma.id, dataAula),
      ])
      const presentes = chamada ? chamada.registros.filter(r => r.presente).length : 0
      s[turma.id] = { total: alunos.length, presentes, feita: !!chamada }
    }))
    setStats(s)
    setLoading(false)
  }, [dataAula])

  useEffect(() => { loadData() }, [loadData])

  const totalFeitas = Object.values(stats).filter(s => s.feita).length
  const todasFeitas = totalFeitas === turmas.length && turmas.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-gray-500 capitalize mt-1">{formatDateFull(dataAula)}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Data da aula:</label>
          <MiniCalendario value={dataAula} onChange={setDataAula} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
      ) : (
        <>
          {/* Summary Banner */}
          <div className={`rounded-xl p-4 flex items-center gap-3 ${
            todasFeitas ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            {todasFeitas
              ? <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              : <Clock size={20} className="text-amber-500 flex-shrink-0" />
            }
            <span className="font-medium text-gray-700">
              {totalFeitas === 0
                ? 'Nenhuma chamada realizada nesta data'
                : todasFeitas
                ? 'Todas as chamadas foram realizadas!'
                : `${totalFeitas} de ${turmas.length} chamadas realizadas`}
            </span>
          </div>

          {/* Turmas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {turmas.map(turma => {
              const cor  = getCor(turma.cor)
              const info = stats[turma.id] || { total: 0, presentes: 0, feita: false }
              const pct  = info.total > 0 ? Math.round((info.presentes / info.total) * 100) : 0

              return (
                <div key={turma.id} className={`rounded-xl border-2 ${cor.bg} ${cor.border} p-5 flex flex-col gap-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xl font-bold ${cor.text}`}>{turma.nome}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${cor.badge}`}>
                      {info.total} alunos
                    </span>
                  </div>

                  {info.total === 0 ? (
                    <p className="text-sm text-gray-400 italic">Nenhum aluno cadastrado</p>
                  ) : info.feita ? (
                    <div>
                      <div className="flex items-center gap-1.5 text-green-600 mb-2">
                        <CheckCircle size={14} />
                        <p className="text-sm font-medium">Chamada realizada</p>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{info.presentes} presentes</span>
                        <span>{info.total - info.presentes} faltaram</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <Clock size={14} />
                      <p className="text-sm font-medium">Chamada pendente</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => navigate('chamada', { turmaId: turma.id, data: dataAula })}
                      disabled={info.total === 0}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white transition
                        ${info.total === 0 ? 'bg-gray-300 cursor-not-allowed' : cor.btn}`}
                    >
                      {info.feita ? 'Ver / Editar' : 'Fazer Chamada'}
                    </button>
                    <button
                      onClick={() => navigate('historico', { turmaId: turma.id })}
                      title="Histórico de frequência"
                      className="px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition flex items-center"
                    >
                      <BarChart2 size={16} className="text-indigo-600" />
                    </button>
                    <button
                      onClick={() => navigate('alunos', { turmaId: turma.id })}
                      title="Gerenciar alunos"
                      className="px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition flex items-center"
                    >
                      <Users size={16} className="text-indigo-600" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
