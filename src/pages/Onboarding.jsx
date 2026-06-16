import { useState } from 'react'
import { ClipboardList, CheckCircle } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Onboarding() {
  const { signOut, reloadProfile } = useAuth()
  const [nome, setNome]       = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro]       = useState('')

  const handleCriar = async (e) => {
    e.preventDefault()
    if (!nome.trim()) return
    setErro('')
    setLoading(true)
    const { error } = await supabase.rpc('setup_igreja', { p_nome: nome.trim() })
    if (error) {
      setErro('Erro ao criar a igreja. Tente novamente.')
      setLoading(false)
      return
    }
    reloadProfile()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-4 shadow-lg">
            <ClipboardList size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bem-vindo!</h1>
          <p className="text-indigo-300 text-sm mt-1">Configure sua igreja para começar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <CheckCircle size={16} className="text-indigo-600" />
              Conta criada com sucesso!
            </div>
            <p className="text-indigo-600">Agora informe o nome da sua igreja para configurar o sistema.</p>
          </div>

          <form onSubmit={handleCriar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Igreja
              </label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Igreja Batista Central"
                required
                autoFocus
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {erro && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
            )}

            <button
              type="submit"
              disabled={loading || !nome.trim()}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar minha igreja'}
            </button>
          </form>

          <button
            onClick={signOut}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Sair e usar outra conta
          </button>
        </div>
      </div>
    </div>
  )
}
