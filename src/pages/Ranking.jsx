import { useState, useEffect } from 'react'
import { Trophy, FileText } from 'lucide-react'
import { getDatasComChamada, getRankingPorData } from '../utils/storage'
import { getCor } from '../utils/colors'
import { formatDateFull } from '../utils/dates'
import MiniCalendario from '../components/MiniCalendario'

function PodioCard({ item, pos }) {
  const cor = getCor(item.turma.cor)
  const platformH = pos === 0 ? 'h-24' : pos === 1 ? 'h-16' : 'h-12'
  const medals = ['🥇', '🥈', '🥉']
  const posLabel = ['1º', '2º', '3º']

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

export default function Ranking({ navigate }) {
  const [datas, setDatas] = useState([])
  const [dataSel, setDataSel] = useState('')
  const [ranking, setRanking] = useState([])

  useEffect(() => {
    const d = getDatasComChamada()
    setDatas(d)
    if (d.length > 0) setDataSel(d[0])
  }, [])

  useEffect(() => {
    if (!dataSel) return
    setRanking(getRankingPorData(dataSel))
  }, [dataSel])

  if (datas.length === 0) {
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
          <button
            onClick={() => navigate('home')}
            className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Ir para o início
          </button>
        </div>
      </div>
    )
  }

  // Pódio: ordem visual é 2º | 1º | 3º
  const top1 = ranking[0]
  const top2 = ranking[1]
  const top3 = ranking[2]
  const resto = ranking.slice(3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ranking</h2>
          <p className="text-gray-500 capitalize">{dataSel ? formatDateFull(dataSel) : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('relatorios')}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-gray-600 no-print"
          >
            <FileText size={15} className="text-indigo-600" />
            Relatórios
          </button>
          <MiniCalendario value={dataSel} onChange={setDataSel} datasDisponiveis={datas} />
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400">Nenhuma chamada registrada nessa data.</p>
        </div>
      ) : (
        <>
          {/* Pódio */}
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

          {/* Classificação completa */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-700">Classificação completa</h3>
              <p className="text-xs text-gray-400 mt-0.5">{ranking.length} turma{ranking.length !== 1 ? 's' : ''} com chamada nesta data</p>
            </div>
            <div className="divide-y divide-gray-100">
              {ranking.map((item, idx) => {
                const cor = getCor(item.turma.cor)
                const pos = idx + 1
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

          {/* Turmas sem chamada nesta data */}
          {resto.length === 0 && ranking.length < 2 && (
            <p className="text-center text-sm text-gray-400">
              Apenas {ranking.length} turma{ranking.length !== 1 ? 's' : ''} registraram chamada nesta data.
            </p>
          )}
        </>
      )}
    </div>
  )
}
