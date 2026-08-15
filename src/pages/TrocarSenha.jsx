import { useState } from 'react'
import { KeyRound, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../contexts/AuthContext'

const MIN_SENHA = 6

/**
 * Troca de senha do próprio usuário.
 *
 * `obrigatoria` = senha provisória entregue pelo gestor. Nesse modo a tela
 * ocupa o app inteiro e só libera depois da troca — por isso ela precisa do
 * "Entrar com outra conta": sem essa saída, quem entra com a conta errada
 * fica preso (foi o que aconteceu nos outros sistemas).
 */
export default function TrocarSenha({ obrigatoria = false, navigate }) {
  const { signOut, reloadProfile, session } = useAuth()
  const [senha, setSenha]         = useState('')
  const [confirma, setConfirma]   = useState('')
  const [mostrar, setMostrar]     = useState(false)
  const [salvando, setSalvando]   = useState(false)
  const [erro, setErro]           = useState('')
  const [ok, setOk]               = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    if (senha.length < MIN_SENHA) {
      setErro(`A senha precisa ter pelo menos ${MIN_SENHA} caracteres.`)
      return
    }
    if (senha !== confirma) {
      setErro('As senhas não conferem.')
      return
    }

    setSalvando(true)

    const { error: errSenha } = await supabase.auth.updateUser({ password: senha })
    if (errSenha) {
      setErro(errSenha.message || 'Não foi possível trocar a senha.')
      setSalvando(false)
      return
    }

    // Só depois que a senha mudou de fato é que tiramos a marca de provisória,
    // senão uma falha aqui deixaria a pessoa com a senha antiga e sem o aviso.
    const { error: errPerfil } = await supabase
      .from('profiles')
      .update({ senha_provisoria: false })
      .eq('id', session.user.id)

    if (errPerfil) {
      setErro('A senha foi alterada, mas houve um erro ao concluir. Recarregue a página.')
      setSalvando(false)
      return
    }

    setOk(true)
    setSalvando(false)
    setSenha('')
    setConfirma('')
    reloadProfile()
  }

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
        <div className="relative">
          <input
            type={mostrar ? 'text' : 'password'}
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder={`mínimo ${MIN_SENHA} caracteres`}
            required
            autoFocus={obrigatoria}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 pr-10"
          />
          <button
            type="button"
            onClick={() => setMostrar(m => !m)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Repita a nova senha</label>
        <input
          type={mostrar ? 'text' : 'password'}
          value={confirma}
          onChange={e => setConfirma(e.target.value)}
          placeholder="digite de novo"
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {erro && (
        <p className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" /> {erro}
        </p>
      )}

      {ok && (
        <p className="flex items-start gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle size={15} className="flex-shrink-0 mt-0.5" /> Senha alterada com sucesso!
        </p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {salvando ? 'Salvando...' : 'Salvar nova senha'}
      </button>
    </form>
  )

  // Modo obrigatório: tela cheia, sem menu, com saída de emergência.
  if (obrigatoria) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-4 shadow-lg">
              <KeyRound size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Crie sua senha</h1>
            <p className="text-indigo-300 text-sm mt-1">A senha que você recebeu é provisória</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            {form}

            <button
              onClick={signOut}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition"
            >
              Entrar com outra conta
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Modo voluntário: dentro do app, pelo menu ou pelas configurações.
  return (
    <div className="max-w-sm space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <KeyRound size={20} className="text-indigo-600" /> Trocar senha
        </h2>
        <p className="text-sm text-gray-500 mt-1">Escolha uma nova senha para a sua conta.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        {form}
      </div>

      {navigate && (
        <button
          onClick={() => navigate('home')}
          className="text-sm text-gray-500 hover:text-gray-700 transition"
        >
          ← Voltar para o início
        </button>
      )}
    </div>
  )
}
