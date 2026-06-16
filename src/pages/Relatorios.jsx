import { useState, useEffect, useMemo } from 'react'
import { Download, Archive, Printer, ChevronRight, Check, X, Trophy } from 'lucide-react'
import { getTurmas, getAlunos, getChamadas, exportData, getCategorias, getDatasComChamada, calcularPontosRegistro } from '../utils/storage'
import { getCor } from '../utils/colors'
import { formatDateFull, formatDateBR } from '../utils/dates'
import MiniCalendario from '../components/MiniCalendario'

const FREQ_MIN = 50

// ─── Relatório de Pontuação ───────────────────────────────────────────────────

function TabelaPorData({ turmas, categorias, dataSel }) {
  const catsSemPresenca = categorias.filter(c => c.id !== 'presenca' && c.ativo)

  return (
    <>
      {turmas.map(turma => {
        const cor = getCor(turma.cor)
        const chamada = getChamadas(turma.id).find(c => c.data === dataSel)
        if (!chamada) return null

        const alunos = getAlunos(turma.id).sort((a, b) => a.nome.localeCompare(b.nome))
        const totalPontos = chamada.registros.reduce((sum, r) => sum + calcularPontosRegistro(r, categorias), 0)

        return (
          <div key={turma.id} className={`bg-white border-l-4 ${cor.border} rounded-xl overflow-hidden shadow-sm`}>
            <div className={`${cor.bg} px-5 py-3 flex items-center justify-between`}>
              <h3 className={`font-bold text-lg ${cor.text}`}>{turma.nome}</h3>
              <span className="font-black text-indigo-700 text-lg">{totalPontos} pts</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Aluno</th>
                    <th className="text-center px-2 py-2 text-xs font-semibold text-gray-500">Pres.</th>
                    {catsSemPresenca.map(c => (
                      <th key={c.id} className="text-center px-2 py-2 text-xs font-semibold text-gray-500 whitespace-nowrap">{c.nome}</th>
                    ))}
                    <th className="text-right px-4 py-2 text-xs font-semibold text-indigo-600">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {alunos.map(aluno => {
                    const reg = chamada.registros.find(r => r.alunoId === aluno.id)
                    if (!reg) return null
                    const pts = calcularPontosRegistro(reg, categorias)
                    return (
                      <tr key={aluno.id} className={!reg.presente ? 'opacity-40' : ''}>
                        <td className="px-4 py-2.5 font-medium text-gray-700">{aluno.nome}</td>
                        <td className="text-center px-2 py-2.5">
                          {reg.presente ? <Check size={14} className="text-green-500 mx-auto" /> : <X size={14} className="text-red-400 mx-auto" />}
                        </td>
                        {catsSemPresenca.map(c => (
                          <td key={c.id} className="text-center px-2 py-2.5">
                            {(c.tipo === 'currency' || c.tipo === 'numeric')
                              ? reg.categorias?.[c.id] && parseFloat(reg.categorias[c.id]) > 0
                                ? <span className="text-xs font-medium text-indigo-600">
                                    {c.tipo === 'currency' ? `R$${parseFloat(reg.categorias[c.id]).toFixed(0)}` : `${parseInt(reg.categorias[c.id])}x`}
                                  </span>
                                : <span className="text-gray-300 text-xs">—</span>
                              : reg.categorias?.[c.id]
                              ? <Check size={14} className="text-indigo-500 mx-auto" />
                              : <span className="text-gray-300 text-xs">—</span>
                            }
                          </td>
                        ))}
                        <td className="text-right px-4 py-2.5 font-bold text-indigo-700">{pts}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </>
  )
}

function TabelaGeral({ turmas, categorias }) {
  const todasCats = categorias.filter(c => c.ativo)
  const catsSemPresenca = todasCats.filter(c => c.id !== 'presenca')

  return (
    <>
      {turmas.map(turma => {
        const cor = getCor(turma.cor)
        const alunos = getAlunos(turma.id).sort((a, b) => a.nome.localeCompare(b.nome))
        const chamadas = getChamadas(turma.id)

        const acumulado = alunos.map(aluno => {
          const contagem = {}
          todasCats.forEach(c => { contagem[c.id] = 0 })
          let totalPts = 0

          chamadas.forEach(chamada => {
            const reg = chamada.registros.find(r => r.alunoId === aluno.id)
            if (!reg) return
            if (reg.presente) contagem['presenca']++
            catsSemPresenca.forEach(c => {
              if (c.tipo === 'boolean' && reg.categorias?.[c.id]) contagem[c.id]++
              if ((c.tipo === 'numeric' || c.tipo === 'currency') && parseFloat(reg.categorias?.[c.id]) > 0) contagem[c.id]++
            })
            totalPts += calcularPontosRegistro(reg, categorias)
          })

          return { aluno, contagem, totalPts }
        })

        const totalTurma = acumulado.reduce((s, a) => s + a.totalPts, 0)

        return (
          <div key={turma.id} className={`bg-white border-l-4 ${cor.border} rounded-xl overflow-hidden shadow-sm`}>
            <div className={`${cor.bg} px-5 py-3 flex items-center justify-between`}>
              <div>
                <h3 className={`font-bold text-lg ${cor.text}`}>{turma.nome}</h3>
                <p className="text-xs text-gray-500">{chamadas.length} aula{chamadas.length !== 1 ? 's' : ''} registradas</p>
              </div>
              <span className="font-black text-indigo-700 text-lg">{totalTurma} pts total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Aluno</th>
                    <th className="text-center px-2 py-2 text-xs font-semibold text-gray-500">Pres.</th>
                    {catsSemPresenca.map(c => (
                      <th key={c.id} className="text-center px-2 py-2 text-xs font-semibold text-gray-500 whitespace-nowrap">{c.nome}</th>
                    ))}
                    <th className="text-right px-4 py-2 text-xs font-semibold text-indigo-600">Total pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {acumulado.map(({ aluno, contagem, totalPts }) => (
                    <tr key={aluno.id}>
                      <td className="px-4 py-2.5 font-medium text-gray-700">{aluno.nome}</td>
                      <td className="text-center px-2 py-2.5">
                        <span className={`text-sm font-bold ${contagem['presenca'] > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                          {contagem['presenca']}x
                        </span>
                      </td>
                      {catsSemPresenca.map(c => (
                        <td key={c.id} className="text-center px-2 py-2.5">
                          <span className={`text-sm font-bold ${contagem[c.id] > 0 ? 'text-indigo-600' : 'text-gray-300'}`}>
                            {contagem[c.id]}x
                          </span>
                        </td>
                      ))}
                      <td className="text-right px-4 py-2.5 font-bold text-indigo-700">{totalPts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </>
  )
}

function RelatorioPontuacao() {
  const [datas, setDatas] = useState([])
  const [dataSel, setDataSel] = useState('geral')
  const [turmas, setTurmas] = useState([])
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    const d = getDatasComChamada()
    setDatas(d)
    setTurmas(getTurmas())
    setCategorias(getCategorias())
  }, [])

  if (datas.length === 0) {
    return <div className="text-center py-10 text-gray-400">Nenhuma chamada registrada ainda.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setDataSel('geral')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition
            ${dataSel === 'geral'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
            }`}
        >
          Geral
        </button>
        <MiniCalendario
          value={dataSel === 'geral' ? null : dataSel}
          onChange={setDataSel}
          datasDisponiveis={datas}
        />
        {dataSel !== 'geral' && (
          <span className="text-sm text-gray-500 capitalize hidden sm:inline">{formatDateFull(dataSel)}</span>
        )}
      </div>

      {dataSel === 'geral'
        ? <TabelaGeral turmas={turmas} categorias={categorias} />
        : <TabelaPorData turmas={turmas} categorias={categorias} dataSel={dataSel} />
      }
    </div>
  )
}

// ─── Relatório Geral EBD ─────────────────────────────────────────────────────

function RelatorioGeralEBD({ navigate }) {
  const [datas, setDatas]       = useState([])
  const [dataSel, setDataSel]   = useState(null)
  const [turmas, setTurmas]     = useState([])
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    const d = getDatasComChamada()
    setDatas(d)
    if (d.length > 0) setDataSel(d[0])
    setTurmas(getTurmas())
    setCategorias(getCategorias().filter(c => c.ativo && c.id !== 'presenca' && c.id !== 'ausencia'))
  }, [])

  const dadosDoDia = useMemo(() => {
    if (!dataSel || turmas.length === 0) return []
    return turmas.map(turma => {
      const chamada = getChamadas(turma.id).find(c => c.data === dataSel)
      if (!chamada) return null
      const presentes = chamada.registros.filter(r => r.presente).length
      const ausentes  = chamada.registros.filter(r => !r.presente).length
      const totalAlunos = getAlunos(turma.id).length
      const totaisCats = {}
      categorias.forEach(cat => {
        if (cat.tipo === 'boolean') {
          totaisCats[cat.id] = chamada.registros.filter(r => r.presente && r.categorias?.[cat.id]).length
        } else if (cat.tipo === 'numeric') {
          totaisCats[cat.id] = chamada.registros.reduce((s, r) => s + (r.presente ? (parseInt(r.categorias?.[cat.id]) || 0) : 0), 0)
        } else if (cat.tipo === 'currency') {
          totaisCats[cat.id] = chamada.registros.reduce((s, r) => s + (r.presente ? (parseFloat(r.categorias?.[cat.id]) || 0) : 0), 0)
        }
      })
      return { turma, presentes, ausentes, totalAlunos, totaisCats }
    }).filter(Boolean)
  }, [dataSel, turmas, categorias])

  const totalGeral = useMemo(() => {
    const t = { presentes: 0, ausentes: 0, totalAlunos: 0 }
    categorias.forEach(cat => { t[cat.id] = 0 })
    dadosDoDia.forEach(({ presentes, ausentes, totalAlunos, totaisCats }) => {
      t.presentes += presentes
      t.ausentes  += ausentes
      t.totalAlunos += totalAlunos
      Object.entries(totaisCats).forEach(([id, val]) => { t[id] += val })
    })
    return t
  }, [dadosDoDia, categorias])

  const fmtVal = (cat, val) =>
    cat.tipo === 'currency' ? `R$ ${val.toFixed(2).replace('.', ',')}` : `${val}`

  if (datas.length === 0) {
    return (
      <div className="text-center py-14 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-400">Nenhuma chamada registrada ainda.</p>
        <button onClick={() => navigate('home')} className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          Ir para o início
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Seletor de data */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Data:</span>
        <MiniCalendario value={dataSel} onChange={setDataSel} datasDisponiveis={datas} />
        {dataSel && <span className="text-sm text-gray-500 capitalize hidden sm:inline">{formatDateFull(dataSel)}</span>}
      </div>

      {dadosDoDia.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400">Nenhuma turma com chamada nesta data.</p>
        </div>
      ) : (
        <>
          {/* Card total geral */}
          <div className="bg-indigo-600 rounded-xl p-5 text-white">
            <p className="font-black text-lg mb-1">Total Geral da EBD</p>
            <p className="text-indigo-200 text-sm mb-4">{dadosDoDia.length} turma{dadosDoDia.length !== 1 ? 's' : ''} com chamada</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl font-black">{totalGeral.presentes}<span className="text-sm font-normal text-indigo-200">/{totalGeral.totalAlunos}</span></div>
                <div className="text-indigo-100 text-xs mt-0.5">Presentes</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl font-black">{totalGeral.ausentes}</div>
                <div className="text-indigo-100 text-xs mt-0.5">Ausentes</div>
              </div>
              {categorias.map(cat => (
                <div key={cat.id} className="bg-white/20 rounded-lg p-3">
                  <div className="text-2xl font-black">{fmtVal(cat, totalGeral[cat.id])}</div>
                  <div className="text-indigo-100 text-xs mt-0.5">{cat.nome}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Por turma */}
          <div className="space-y-3">
            {dadosDoDia.map(({ turma, presentes, ausentes, totalAlunos, totaisCats }) => {
              const cor = getCor(turma.cor)
              return (
                <div key={turma.id} className={`bg-white border-l-4 ${cor.border} rounded-xl overflow-hidden`}>
                  <div className={`${cor.bg} px-4 py-3 flex items-center justify-between`}>
                    <h3 className={`font-bold ${cor.text}`}>{turma.nome}</h3>
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <span className="text-green-600">{presentes} pres.</span>
                      <span className="text-red-500">{ausentes} aus.</span>
                      <span className="text-gray-400 font-normal">/{totalAlunos}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex flex-wrap gap-x-5 gap-y-1.5">
                    {categorias.map(cat => (
                      <div key={cat.id} className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">{cat.nome}:</span>
                        <span className={`text-sm font-bold ${totaisCats[cat.id] > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                          {fmtVal(cat, totaisCats[cat.id])}
                        </span>
                      </div>
                    ))}
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

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Relatorios({ navigate }) {
  const [turmas, setTurmas] = useState([])
  const [dados, setDados] = useState([])
  const [aba, setAba] = useState('frequencia')

  useEffect(() => {
    const t = getTurmas()
    setTurmas(t)

    const d = t.map(turma => {
      const alunos = getAlunos(turma.id)
      const chamadas = getChamadas(turma.id)
      const totalAulas = chamadas.length

      const frequencias = alunos.map(aluno => {
        const presencas = chamadas.filter(c =>
          c.registros.some(r => r.alunoId === aluno.id && r.presente)
        ).length
        const pct = totalAulas > 0 ? Math.round((presencas / totalAulas) * 100) : null
        return { aluno, presencas, totalAulas, pct }
      })

      const mediaFreq = frequencias.length > 0 && totalAulas > 0
        ? Math.round(frequencias.reduce((s, f) => s + (f.pct ?? 0), 0) / frequencias.length)
        : null

      const irregulares = frequencias.filter(f => f.pct !== null && f.pct < FREQ_MIN).length
      const ultimaChamada = chamadas.length > 0
        ? chamadas.sort((a, b) => b.data.localeCompare(a.data))[0].data
        : null

      return { turma, alunos, totalAulas, mediaFreq, irregulares, frequencias, ultimaChamada }
    })

    setDados(d)
  }, [])

  const totais = useMemo(() => ({
    alunos:      dados.reduce((s, d) => s + d.alunos.length, 0),
    aulas:       dados.reduce((s, d) => s + d.totalAulas, 0),
    irregulares: dados.reduce((s, d) => s + d.irregulares, 0),
  }), [dados])

  const exportarCSVGeral = () => {
    const header = ['Turma', 'Aluno', 'Matricula', 'Presencas', 'Total Aulas', 'Frequencia (%)']
    const rows = dados.flatMap(({ turma, frequencias }) =>
      frequencias.map(f => [
        `"${turma.nome}"`,
        `"${f.aluno.nome}"`,
        f.aluno.matricula || '',
        f.presencas,
        f.totalAulas,
        f.pct !== null ? f.pct : 'N/A',
      ])
    )
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-geral-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Relatórios</h2>
          <p className="text-gray-500">Visão consolidada de todas as turmas.</p>
        </div>
        <div className="flex gap-2 flex-wrap no-print">
          <button
            onClick={() => navigate('ranking')}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition text-gray-600"
          >
            <Trophy size={15} className="text-amber-500" />
            Ranking
          </button>
          {aba === 'frequencia' && (
            <>
              <button
                onClick={exportarCSVGeral}
                disabled={totais.aulas === 0}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download size={15} className="text-white" />
                Exportar CSV
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition text-gray-600"
              >
                <Archive size={15} className="text-indigo-600" />
                Backup JSON
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition text-gray-600"
              >
                <Printer size={15} className="text-indigo-600" />
                Imprimir
              </button>
            </>
          )}
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit no-print">
        <button
          onClick={() => setAba('frequencia')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition
            ${aba === 'frequencia' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Frequência
        </button>
        <button
          onClick={() => setAba('pontuacao')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition
            ${aba === 'pontuacao' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Pontuação
        </button>
        <button
          onClick={() => setAba('geral')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition
            ${aba === 'geral' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Geral EBD
        </button>
      </div>

      {/* ── Aba: Frequência ─────────────────────────────────────────────────── */}
      {aba === 'frequencia' && (
        <>
          {/* Cards de totais */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600">{turmas.length}</div>
              <div className="text-xs text-gray-500 mt-1">Turmas</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{totais.alunos}</div>
              <div className="text-xs text-gray-500 mt-1">Alunos no total</div>
            </div>
            <div className={`rounded-xl p-4 text-center border ${totais.irregulares > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className={`text-3xl font-bold ${totais.irregulares > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {totais.irregulares}
              </div>
              <div className={`text-xs mt-1 ${totais.irregulares > 0 ? 'text-red-500' : 'text-green-500'}`}>
                Irregulares (&lt;{FREQ_MIN}%)
              </div>
            </div>
          </div>

          {totais.aulas === 0 ? (
            <div className="text-center py-14 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400">Nenhuma chamada registrada ainda.</p>
              <p className="text-gray-400 text-sm mt-1">Faça chamadas nas turmas para gerar relatórios.</p>
              <button
                onClick={() => navigate('home')}
                className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Ir para o início
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {dados.map(({ turma, alunos, totalAulas, mediaFreq, irregulares, frequencias, ultimaChamada }) => {
                const cor = getCor(turma.cor)
                return (
                  <div key={turma.id} className={`bg-white border-l-4 ${cor.border} rounded-xl overflow-hidden shadow-sm`}>
                    <div className={`${cor.bg} px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2`}>
                      <div>
                        <h3 className={`font-bold text-lg ${cor.text}`}>{turma.nome}</h3>
                        <p className="text-xs text-gray-500">
                          {alunos.length} aluno{alunos.length !== 1 ? 's' : ''} · {totalAulas} aula{totalAulas !== 1 ? 's' : ''}
                          {ultimaChamada && ` · Última: ${formatDateBR(ultimaChamada)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className={`font-bold text-lg ${
                            mediaFreq === null ? 'text-gray-400'
                            : mediaFreq >= 70 ? 'text-green-600'
                            : mediaFreq >= FREQ_MIN ? 'text-amber-600'
                            : 'text-red-600'
                          }`}>
                            {mediaFreq !== null ? `${mediaFreq}%` : '—'}
                          </div>
                          <div className="text-xs text-gray-500">Freq. média</div>
                        </div>
                        {irregulares > 0 && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                            {irregulares} irregular{irregulares !== 1 ? 'es' : ''}
                          </span>
                        )}
                        <button
                          onClick={() => navigate('historico', { turmaId: turma.id })}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition no-print text-gray-600"
                        >
                          Ver detalhes
                          <ChevronRight size={13} className="text-indigo-600" />
                        </button>
                      </div>
                    </div>

                    {irregulares > 0 && (
                      <div className="px-5 py-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-red-600 mb-2">Alunos com frequência abaixo de {FREQ_MIN}%:</p>
                        <div className="flex flex-wrap gap-2">
                          {frequencias
                            .filter(f => f.pct !== null && f.pct < FREQ_MIN)
                            .map(f => (
                              <span key={f.aluno.id} className="bg-red-50 border border-red-200 text-red-700 text-xs px-2 py-1 rounded-lg">
                                {f.aluno.nome} — {f.pct}%
                              </span>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Aba: Pontuação ──────────────────────────────────────────────────── */}
      {aba === 'pontuacao' && <RelatorioPontuacao />}

      {/* ── Aba: Geral EBD ──────────────────────────────────────────────────── */}
      {aba === 'geral' && <RelatorioGeralEBD navigate={navigate} />}
    </div>
  )
}
