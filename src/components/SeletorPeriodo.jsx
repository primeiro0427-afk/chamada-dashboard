import { CalendarRange, X } from 'lucide-react'
import MiniCalendario from './MiniCalendario'
import { descreverPeriodo } from '../utils/dates'

/**
 * Escolhe o intervalo dos relatórios. As duas pontas são domingos que têm
 * chamada (é o que o MiniCalendario deixa clicar), então não dá para montar
 * um período sem aula nenhuma dentro.
 *
 * Sem início e sem fim = todo o histórico, que é o padrão.
 */
export default function SeletorPeriodo({ periodo, onChange, datas }) {
  const { inicio, fim } = periodo
  const temPeriodo = !!inicio || !!fim

  // Escolher um fim antes do início (ou vice-versa) inverte em vez de recusar:
  // é quase sempre o que a pessoa quis dizer.
  const setInicio = (data) =>
    onChange(fim && data > fim ? { inicio: fim, fim: data } : { inicio: data, fim })

  const setFim = (data) =>
    onChange(inicio && data < inicio ? { inicio: data, fim: inicio } : { inicio, fim: data })

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="flex items-center gap-1.5 text-sm text-gray-500">
        <CalendarRange size={15} className="text-indigo-600" /> Período:
      </span>

      <MiniCalendario value={inicio} onChange={setInicio} datasDisponiveis={datas} />
      <span className="text-sm text-gray-400">até</span>
      <MiniCalendario value={fim} onChange={setFim} datasDisponiveis={datas} />

      {temPeriodo && (
        <button
          onClick={() => onChange({ inicio: null, fim: null })}
          className="flex items-center gap-1 px-2.5 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          title="Mostrar todo o histórico"
        >
          <X size={13} /> Limpar
        </button>
      )}

      <span className="text-xs text-gray-400 hidden sm:inline">
        {descreverPeriodo(periodo)}
      </span>
    </div>
  )
}
