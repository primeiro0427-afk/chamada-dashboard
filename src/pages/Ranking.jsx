import { useState, useEffect, useMemo } from 'react'
import { Trophy, FileText } from 'lucide-react'
import { getDatasComChamada, getRankingPorData, getRankingPorPeriodo } from '../utils/storage'
import { getCor } from '../utils/colors'
import { formatDateFull, dentroDoPeriodo, descreverPeriodo } from '../utils/dates'
import MiniCalendario from '../components/MiniCalendario'
import SeletorPeriodo from '../components/SeletorPeriodo'

function PodioCard({ item, pos }) {
  const cor       = getCor(item.turma.cor)
  const platformH = pos === 0 ? 'h-24' : pos === 1 ? 'h-16' : 'h-12'
  const medals    = ['🥇', '🥈', '🥉']
  const posLabel  = ['1º', '2º', '3º']

  return (
    <div className="flex flex-col items-center gap-1 flex-1 max-w-36">
      <span className="text-3xl">{medals[pos]}</span>
      <div className="font-bold text-sm text-center text-gray-800 leading-tight px-1">{item.turma.nome}</div>
      <div className="font-black text-indigo-700 text-sm">{item.pontos} pts</div>
      <div className={`w-full ${platformH} ${cor.bg} border-2 ${cor.border} rounded-t-xl flex items-center justify-center`}>
        <span className={`text-2xl font-black ${cor.text}`}>{posLabel[pos]}</span>
      </div>
    </div>
  )
}

export default function Ranking({ navigate, periodo, setPeriodo }) {
  // null enquanto não sabemos quais domingos existem.
  const [datas, setDatas]     = useState(null)
  // null = ainda não escolheu, abre no domingo mais recente. 'geral' soma o
  // período inteiro e só aparece quando a pessoa pede. Resto é um domingo só.
  const [dataSel, setDataSel] = useState(null)
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { getDatasComChamada().then(setDatas) }, [])

  const datasDoPeriodo = useMemo(
    () => (datas ?? []).filter(d => dentroDoPeriodo(d, periodo.inicio, periodo.fim)),
    [datas, periodo],
  )

  // getDatasComChamada devolve em ordem decrescente, então [0] é o último domingo.
  const dataAtiva  = dataSel ?? datasDoPeriodo[0] ?? 'geral'
  const temPeriodo = !!periodo.inicio || !!periodo.fim

  // Domingo que saiu do período volta a seguir o mais recente que sobrou.
  useEffect(() => {
    if (dataSel && dataSel !== 'geral' && !datasDoPeriodo.includes(dataSel)) setDataSel(null)
  }, [datasDoPeriodo, dataSel])

  useEffect(() => {
    // Sem saber os domingos, dataAtiva seria 'geral' e buscaríamos o que não foi pedido.
    if (!datas) return
    setLoading(true)
    const busca = dataAtiva === 'geral'
      ? getRankingPorPeriodo(periodo)
      : getRankingPorData(dataAtiva)
    busca.then(r => { setRanking(r); setLoading(false) })
  }, [datas, dataAtiva, periodo])

  if (!loading && datas?.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ranking</h2>
          <p className="text-gray-500">Classificação das turmas por pontuação.</p>
        </div>
        <div className="text-center py-14 bg-white rounded-xl border border-gray-200">
          <Trophy size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma chamada registrada ainda.</p>
          <p className="text-gray-400 text-sm mt-1">Faça chamadas nas turmas para ver o ranking.</p>
          <button onClick={() => navigate('home')} className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            Ir para o início
          </button>
        </div>
      </div>
    )
  }

  const top1  = ranking[0]
  const top2  = ranking[1]
  const top3  = ranking[2]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ranking</h2>
          <p className="text-gray-500 capitalize">
            {dataAtiva === 'geral' ? descreverPeriodo(periodo) : formatDateFull(dataAtiva)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('relatorios')} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-gray-600 no-print">
            <FileText size={15} className="text-indigo-600" /> Relatórios
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 space-y-3 no-print">
        <SeletorPeriodo periodo={periodo} onChange={setPeriodo} datas={datas ?? []} />
        <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 pt-3">
          <MiniCalendario value={dataAtiva === 'geral' ? null : dataAtiva} onChange={setDataSel} datasDisponiveis={datasDoPeriodo} />
          <span className="text-sm text-gray-400">ou</span>
          <button onClick={() => setDataSel('geral')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${dataAtiva === 'geral' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'}`}
            title="Somar todas as aulas do período"
          >
            {temPeriodo ? 'Período todo' : 'Geral'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400">Nenhuma chamada registrada {dataAtiva === 'geral' ? 'nesse período' : 'nessa data'}.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Trophy size={20} className="text-yellow-500" />
              <h3 className="font-bold text-gray-700 text-lg">Pódio</h3>
            </div>
            <div className="flex items-end justify-center gap-3">
              {top2 && <PodioCard item={top2} pos={1} />}
              {top1 && <PodioCard item={top1} pos={0} />}
              {top3 && <PodioCard item={top3} pos={2} />}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-700">Classificação completa</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {ranking.length} turma{ranking.length !== 1 ? 's' : ''} com chamada {dataAtiva === 'geral' ? 'no período' : 'nesta data'}
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {ranking.map((item, idx) => {
                const cor     = getCor(item.turma.cor)
                const pos     = idx + 1
                const medalhas = { 1: '🥇', 2: '🥈', 3: '🥉' }
                return (
                  <div key={item.turma.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-9 text-center flex-shrink-0">
                      {pos <= 3
                        ? <span className="text-xl">{medalhas[pos]}</span>
                        : <span className="text-sm font-bold text-gray-400">{pos}º</span>
                      }
                    </div>
                    <div className={`w-3 h-3 rounded-full ${cor.dot} flex-shrink-0`} />
                    <span className="flex-1 font-medium text-gray-800">{item.turma.nome}</span>
                    <div className="text-right flex-shrink-0">
                      <span className="font-black text-lg text-indigo-700">{item.pontos}</span>
                      <span className="text-xs text-gray-400 ml-1">pts</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
