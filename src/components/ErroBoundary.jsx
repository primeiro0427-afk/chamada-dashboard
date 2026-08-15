import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

/**
 * Sem isto, qualquer exceção durante a renderização faz o React desmontar a
 * árvore toda e a pessoa vê uma tela branca — sem mensagem, sem pista, e sem
 * nada que ela consiga relatar. Aqui pelo menos aparece o erro e um botão.
 *
 * Precisa ser classe: React não tem equivalente em hook.
 */
export default class ErroBoundary extends Component {
  state = { erro: null }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    // Fica no console para quem souber abrir o F12; a tela mostra o resumo.
    console.error('Erro na tela:', erro, info)
  }

  render() {
    if (!this.state.erro) return this.props.children

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            <h1 className="font-bold text-lg">Algo deu errado nesta tela</h1>
          </div>

          <p className="text-sm text-gray-600">
            Seus dados estão salvos. Recarregue a página para continuar. Se
            acontecer de novo, mande a mensagem abaixo para o suporte.
          </p>

          <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 text-red-700 overflow-x-auto whitespace-pre-wrap">
            {this.state.erro?.message || String(this.state.erro)}
          </pre>

          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Recarregar
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(this.state.erro?.stack || this.state.erro?.message || '')}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Copiar erro
            </button>
          </div>
        </div>
      </div>
    )
  }
}
