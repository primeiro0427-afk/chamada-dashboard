import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabase'

export default function Login() {
  const { signIn } = useAuth()
  const [aba, setAba]         = useState('entrar')
  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro]       = useState('')

  const handleEntrar = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await signIn(email, senha)
    if (error) setErro('E-mail ou senha incorretos.')
    setLoading(false)
  }

  const handleCadastrar = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password: senha })
    if (error) {
      setErro(error.message === 'User already registered'
        ? 'Este e-mail já está cadastrado.'
        : 'Erro ao criar conta.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-4 shadow-lg">
            <ClipboardList size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sistema de Chamada</h1>
          <p className="text-indigo-300 text-sm mt-1">Escola Bíblica Dominical</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Abas */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
            {['entrar', 'cadastrar'].map(a => (
              <button
                key={a}
                onClick={() => { setAba(a); setErro('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition
                  ${aba === a ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {a === 'entrar' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={aba === 'entrar' ? handleEntrar : handleCadastrar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {erro && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : aba === 'entrar' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          {aba === 'cadastrar' && (
            <p className="text-xs text-gray-400 text-center mt-4">
              Após criar sua conta, você configurará sua igreja no próximo passo.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
