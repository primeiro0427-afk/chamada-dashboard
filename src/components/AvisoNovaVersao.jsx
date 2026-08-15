import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, X } from 'lucide-react'

/**
 * Uma aba aberta continua rodando o JavaScript de quando foi carregada. Como a
 * secretária costuma deixar o sistema aberto a semana toda, ela chega no domingo
 * usando uma versão antiga sem saber — e um bug já corrigido volta a aparecer.
 *
 * O build grava a própria identificação em version.json; aqui comparamos com a
 * que está rodando (__BUILD_ID__, injetado pelo Vite) e avisamos se mudou.
 */
export default function AvisoNovaVersao() {
  const [temNova, setTemNova] = useState(false)
  const [dispensado, setDispensado] = useState(false)

  const verificar = useCallback(async () => {
    try {
      // no-store + query: sem isso o navegador devolveria o version.json antigo,
      // que é justamente o problema que estamos tentando detectar.
      const resp = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
      if (!resp.ok) return
      const { build } = await resp.json()
      if (build && build !== __BUILD_ID__) setTemNova(true)
    } catch {
      // Sem internet ou rodando em dev (não existe version.json): ignora.
    }
  }, [])

  useEffect(() => {
    verificar()

    // Voltar para a aba é o momento mais provável de haver algo novo, e é de
    // graça — bem melhor que ficar consultando o tempo todo.
    const aoFocar = () => verificar()
    window.addEventListener('focus', aoFocar)

    const intervalo = setInterval(verificar, 30 * 60 * 1000)

    return () => {
      window.removeEventListener('focus', aoFocar)
      clearInterval(intervalo)
    }
  }, [verificar])

  if (!temNova || dispensado) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 no-print">
      <div className="flex items-center gap-2 bg-slate-800 text-white rounded-full shadow-lg pl-4 pr-2 py-1.5 text-xs">
        <span className="text-slate-200">Nova versão disponível</span>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 rounded-full px-3 py-1 font-semibold transition"
        >
          <RefreshCw size={12} /> Atualizar
        </button>
        <button
          onClick={() => setDispensado(true)}
          className="p-1 text-slate-400 hover:text-white transition"
          title="Agora não"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
