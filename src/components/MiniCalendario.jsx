import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { formatDate, formatDateBR } from '../utils/dates'

export default function MiniCalendario({ value, onChange, datasDisponiveis = null, className = '' }) {
  const [aberto, setAberto] = useState(false)
  const [mes, setMes] = useState(() => {
    if (value) return new Date(new Date(value + 'T12:00:00').getFullYear(), new Date(value + 'T12:00:00').getMonth(), 1)
    if (datasDisponiveis?.length > 0) {
      const d = new Date(datasDisponiveis[0] + 'T12:00:00')
      return new Date(d.getFullYear(), d.getMonth(), 1)
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  })
  const ref = useRef(null)

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // When value changes externally, update month view
  useEffect(() => {
    if (value && value !== 'geral') {
      const d = new Date(value + 'T12:00:00')
      setMes(new Date(d.getFullYear(), d.getMonth(), 1))
    }
  }, [value])

  const hoje = new Date()
  hoje.setHours(23, 59, 59, 999)

  const getDias = () => {
    const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1)
    inicio.setDate(inicio.getDate() - inicio.getDay()) // recuar até domingo
    const dias = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(inicio)
      d.setDate(inicio.getDate() + i)
      dias.push(d)
    }
    return dias
  }

  const isDoMes     = (d) => d.getMonth() === mes.getMonth()
  const isDomingo   = (d) => d.getDay() === 0
  const isFuturo    = (d) => d > hoje
  const isSelecionado = (d) => !!value && formatDate(d) === value

  const isDisponivel = (d) => {
    if (!isDomingo(d) || isFuturo(d) || !isDoMes(d)) return false
    if (datasDisponiveis !== null) return datasDisponiveis.includes(formatDate(d))
    return true
  }

  const handleClick = (d) => {
    if (!isDisponivel(d)) return
    onChange(formatDate(d))
    setAberto(false)
  }

  const mesAnterior = () => setMes(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const proximoMes  = () => {
    const next = new Date(mes.getFullYear(), mes.getMonth() + 1, 1)
    if (next <= hoje) setMes(next)
  }

  const proximoDesabilitado = new Date(mes.getFullYear(), mes.getMonth() + 1, 1) > hoje
  const mesLabel = mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const dias = getDias()
  const COLS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setAberto(a => !a)}
        className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <Calendar size={15} className="text-indigo-600 flex-shrink-0" />
        <span className="font-medium text-gray-700">
          {value ? formatDateBR(value) : 'Selecionar data'}
        </span>
        <ChevronRight size={14} className={`text-gray-400 transition-transform ${aberto ? 'rotate-90' : ''}`} />
      </button>

      {/* Popup */}
      {aberto && (
        <div className="absolute z-50 mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64">
          {/* Navegação de mês */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={mesAnterior} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-600">
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-semibold text-gray-700 capitalize">{mesLabel}</span>
            <button
              onClick={proximoMes}
              disabled={proximoDesabilitado}
              className={`p-1.5 rounded-lg transition ${proximoDesabilitado ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-7 mb-1">
            {COLS.map((c, i) => (
              <div key={i} className={`text-center text-xs font-bold py-1 ${i === 0 ? 'text-indigo-500' : 'text-gray-300'}`}>
                {c}
              </div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {dias.map((dia, i) => {
              const doMes     = isDoMes(dia)
              const domingo   = isDomingo(dia)
              const disponivel = isDisponivel(dia)
              const selecionado = isSelecionado(dia)
              const futuro    = isFuturo(dia)

              let cls = 'w-8 h-8 mx-auto rounded-full text-xs flex items-center justify-center transition '

              if (selecionado) {
                cls += 'bg-indigo-600 text-white font-black'
              } else if (disponivel) {
                cls += 'text-indigo-700 font-bold ring-1 ring-indigo-300 hover:bg-indigo-50 cursor-pointer'
              } else if (domingo && doMes && !futuro) {
                // domingo sem chamada (só ranking/relatório)
                cls += 'text-indigo-200 font-semibold cursor-not-allowed'
              } else if (domingo && doMes && futuro) {
                cls += 'text-indigo-200 font-semibold cursor-not-allowed'
              } else if (!doMes) {
                cls += 'text-gray-100 cursor-default'
              } else {
                cls += 'text-gray-300 cursor-not-allowed'
              }

              return (
                <button key={i} onClick={() => handleClick(dia)} disabled={!disponivel} className={cls}>
                  {doMes ? dia.getDate() : ''}
                </button>
              )
            })}
          </div>

          {/* Legenda */}
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full ring-1 ring-indigo-300 inline-block" />
              Disponível
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
              Selecionado
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
