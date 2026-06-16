import { useState, useEffect, useMemo } from 'react'
import { Download, Printer, CheckCircle, XCircle, AlertTriangle, BarChart2, Calendar, Pencil, ClipboardList } from 'lucide-react'
import { getTurmas, getAlunos, getChamadas } from '../utils/storage'
import { formatDateBR, formatDateFull } from '../utils/dates'
import { getCor } from '../utils/colors'

const FREQ_MIN = 50

function SeletorTurma({ navigate }) {
  const turmas = getTurmas()
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Frequência</h2>
        <p className="text-gray-500">Selecione a turma para ver o histórico de frequência.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {turmas.map(turma => {
          const cor = getCor(turma.cor)
          const chamadas = getChamadas(turma.id)
          return (
            <button
              key={turma.id}
              onClick={() => navigate('historico', { turmaId: turma.id })}
              className={`text-left p-4 rounded-xl border-2 ${cor.bg} ${cor.border} hover:shadow-md transition`}
            >
              <p className={`font-bold text-lg ${cor.text}`}>{turma.nome}</p>
              <p className="text-sm text-gray-500 mt-1">{chamadas.length} aula{chamadas.length !== 1 ? 's' : ''} registrada{chamadas.length !== 1 ? 's' : ''}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Historico({ params, navigate }) {
  const { turmaId } = params
  const [turma, setTurma] = useState(null)
  const [alunos, setAlunos] = useState([])
  const [chamadas, setChamadas] = useState([])
  const [selectedData, setSelectedData] = useState(null)
  const [view, setView] = useState('frequencia')

  useEffect(() => {
    if (!turmaId) return
    const t = getTurmas().find(t => t.id === turmaId)
    setTurma(t)
    const a = getAlunos(turmaId).sort((a, b) => a.nome.localeCompare(b.nome))
    setAlunos(a)
    const c = getChamadas(turmaId).sort((a, b) => b.data.localeCompare(a.data))
    setChamadas(c)
    if (c.length > 0) setSelectedData(c[0].data)
  }, [turmaId])

  const frequencias = useMemo(() => {
    return alunos
      .map(aluno => {
        const total = chamadas.length
        const presencas = chamadas.filter(c =>
          c.registros.some(r => r.alunoId === aluno.id && r.presente)
        ).length
        const pct = total > 0 ? Math.round((presencas / total) * 100) : null
        return { aluno, presencas, total, pct }
      })
      .sort((a, b) => {
        if (a.pct === null && b.pct === null) return 0
        if (a.pct === null) return 1
        if (b.pct === null) return -1
        return a.pct - b.pct
      })
  }, [alunos, chamadas])

  if (!turmaId) return <SeletorTurma navigate={navigate} />

  const exportCSV = () => {
    if (!turma) return
    const header = ['Nome', 'Matricula', 'Presencas', 'Total Aulas', 'Frequencia (%)']
    const rows = frequencias.map(f => [
      `"${f.aluno.nome}"`,
      f.aluno.matricula || '',
      f.presencas,
      f.total,
      f.pct !== null ? f.pct : 'N/A',
    ])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `frequencia-${turma.nome}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!turma) return null

  const totalAulas = chamadas.length
  const abaixoMin = frequencias.filter(f => f.pct !== null && f.pct < FREQ_MIN).length
  const mediaFreq = frequencias.length > 0 && totalAulas > 0
    ? Math.round(frequencias.reduce((s, f) => s + (f.pct ?? 0), 0) / frequencias.length)
    : null

  const selectedChamada = chamadas.find(c => c.data === selectedData)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Histórico — {turma.nome}</h2>
          <p className="text-gray-500">{totalAulas} aula{totalAulas !== 1 ? 's' : ''} registrada{totalAulas !== 1 ? 's' : ''} · {alunos.length} alunos</p>
        </div>
        <div className="flex gap-2 no-print">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-gray-600"
          >
            <Download size={15} className="text-indigo-600" />
            Exportar CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-gray-600"
          >
            <Printer size={15} className="text-indigo-600" />
            Imprimir
          </button>
        </div>
      </div>

      {totalAulas === 0 ? (
        <div className="text-center py-14 bg-white rounded-xl border border-gray-200">
          <div className="flex justify-center mb-3">
            <ClipboardList size={48} className="text-indigo-200" />
          </div>
          <p className="text-gray-400">Nenhuma chamada registrada ainda.</p>
          <button
            onClick={() => navigate('chamada', { turmaId, data: new Date().toISOString().split('T')[0] })}
            className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Fazer primeira chamada
          </button>
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-indigo-600">{totalAulas}</div>
              <div className="text-xs text-gray-500 mt-1">Total de aulas</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{alunos.length}</div>
              <div className="text-xs text-gray-500 mt-1">Alunos</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${
                mediaFreq === null ? 'text-gray-400'
                : mediaFreq >= 70 ? 'text-green-600'
                : mediaFreq >= FREQ_MIN ? 'text-amber-600'
                : 'text-red-600'
              }`}>
                {mediaFreq !== null ? `${mediaFreq}%` : '—'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Freq. média</div>
            </div>
            <div className={`rounded-xl p-3 text-center border ${
              abaixoMin > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}>
              <div className={`text-2xl font-bold ${abaixoMin > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {abaixoMin}
              </div>
              <div className={`text-xs mt-1 ${abaixoMin > 0 ? 'text-red-500' : 'text-green-500'}`}>
                Abaixo de {FREQ_MIN}%
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 no-print">
            <button
              onClick={() => setView('frequencia')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'frequencia' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart2 size={15} className={view === 'frequencia' ? 'text-white' : 'text-indigo-600'} />
              Frequência Geral
            </button>
            <button
              onClick={() => setView('detalhe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'detalhe' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar size={15} className={view === 'detalhe' ? 'text-white' : 'text-indigo-600'} />
              Por Data
            </button>
          </div>

          {/* Tabela de frequência */}
          {view === 'frequencia' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Nome</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Presenças</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Frequência</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {frequencias.map((f, idx) => {
                    const irregular = f.pct !== null && f.pct < FREQ_MIN
                    return (
                      <tr key={f.aluno.id} className={`border-b border-gray-100 last:border-0 ${irregular ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-3 text-gray-400 text-sm">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{f.aluno.nome}</div>
                          {f.aluno.matricula && <div className="text-xs text-gray-400">Mat: {f.aluno.matricula}</div>}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {f.presencas}/{f.total}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${f.pct !== null && f.pct >= FREQ_MIN ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${f.pct ?? 0}%` }}
                              />
                            </div>
                            <span className={`font-bold text-sm ${f.pct !== null && f.pct >= FREQ_MIN ? 'text-green-600' : f.pct !== null ? 'text-red-600' : 'text-gray-400'}`}>
                              {f.pct !== null ? `${f.pct}%` : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {f.pct === null ? (
                            <span className="text-gray-400 text-xs">—</span>
                          ) : irregular ? (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                              <AlertTriangle size={11} /> Irregular
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                              <CheckCircle size={11} /> Regular
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Detalhe por data */}
          {view === 'detalhe' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-sm font-medium text-gray-600">Data:</label>
                <select
                  value={selectedData || ''}
                  onChange={e => setSelectedData(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {chamadas.map(c => {
                    const pres = c.registros.filter(r => r.presente).length
                    return (
                      <option key={c.data} value={c.data}>
                        {formatDateBR(c.data)} — {pres}/{alunos.length} presentes
                      </option>
                    )
                  })}
                </select>
                {selectedData && (
                  <button
                    onClick={() => navigate('chamada', { turmaId, data: selectedData })}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition no-print"
                  >
                    <Pencil size={14} className="text-indigo-600" />
                    Editar esta chamada
                  </button>
                )}
              </div>

              {selectedChamada && selectedData && (
                <>
                  <h3 className="font-semibold text-gray-700 capitalize">{formatDateFull(selectedData)}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {alunos.map(aluno => {
                      const reg = selectedChamada.registros.find(r => r.alunoId === aluno.id)
                      const presente = reg?.presente
                      return (
                        <div
                          key={aluno.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${
                            presente ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                          }`}
                        >
                          {presente
                            ? <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                            : <XCircle size={20} className="text-red-400 flex-shrink-0" />
                          }
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 truncate">{aluno.nome}</div>
                            {aluno.matricula && <div className="text-xs text-gray-400">Mat: {aluno.matricula}</div>}
                          </div>
                          <span className={`text-sm font-semibold ${presente ? 'text-green-600' : 'text-red-500'}`}>
                            {presente ? 'Presente' : 'Ausente'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
