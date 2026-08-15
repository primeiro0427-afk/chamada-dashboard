import { Component } from 'react'
import { AlertTriangle, Copy, Check, RefreshCw } from 'lucide-react'

/**
 * Sem isto, qualquer exceção durante a renderização faz o React desmontar a
 * árvore toda e a pessoa vê uma tela branca — sem mensagem, sem pista, e sem
 * nada que ela consiga relatar. O sistema está em produção numa igreja, então
 * quem cai aqui é a secretária, não um dev: a tela precisa dizer, com todas as
 * letras, o que fazer.
 *
 * Precisa ser classe: React não tem equivalente em hook.
 */
export default class ErroBoundary extends Component {
  state = { erro: null, copiado: false, falhouCopiar: false }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('Erro na tela:', erro, info)
  }

  // Só a mensagem não basta para achar a causa; o resto do contexto vai junto.
  montarRelatorio() {
    const { erro } = this.state
    return [
      '--- Erro no Sistema de Chamada ---',
      `Mensagem: ${erro?.message || String(erro)}`,
      `Quando: ${new Date().toLocaleString('pt-BR')}`,
      `Tela: ${window.location.href}`,
      `Navegador: ${navigator.userAgent}`,
      '',
      'Detalhes técnicos:',
      erro?.stack || '(sem detalhes)',
    ].join('\n')
  }

  copiar = async () => {
    try {
      await navigator.clipboard.writeText(this.montarRelatorio())
      this.setState({ copiado: true, falhouCopiar: false })
      setTimeout(() => this.setState({ copiado: false }), 3000)
    } catch {
      // Navegador antigo ou sem permissão: manda selecionar na mão.
      this.setState({ falhouCopiar: true })
    }
  }

  render() {
    if (!this.state.erro) return this.props.children

    const { copiado, falhouCopiar } = this.state

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} className="flex-shrink-0" />
            <h1 className="font-bold text-lg">Algo deu errado nesta tela</h1>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
            <strong>Fique tranquilo:</strong> nada do que você já salvou foi perdido.
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-900">
            <p className="font-semibold mb-2">Ajude a corrigir — leva 30 segundos:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-indigo-800">
              <li>Toque em <strong>Copiar erro</strong> aqui embaixo</li>
              <li>Mande o texto copiado para o <strong>responsável pelo sistema</strong> (pode colar no WhatsApp)</li>
              <li>Conte também <strong>o que você estava fazendo</strong> quando a tela travou</li>
            </ol>
          </div>

          <button
            onClick={this.copiar}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${
              copiado
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {copiado
              ? <><Check size={16} /> Copiado! Agora é só colar e enviar</>
              : <><Copy size={16} /> Copiar erro</>}
          </button>

          {falhouCopiar && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Não consegui copiar sozinho. Selecione o texto da caixa abaixo, copie e envie —
              ou tire um print desta tela.
            </p>
          )}

          <details className="text-xs">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700 select-none">
              Ver o erro
            </summary>
            <pre className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-red-700 overflow-x-auto whitespace-pre-wrap select-all max-h-48">
              {this.montarRelatorio()}
            </pre>
          </details>

          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            <RefreshCw size={15} /> Recarregar a página
          </button>
        </div>
      </div>
    )
  }
}
