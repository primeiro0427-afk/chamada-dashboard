import { useState } from 'react'
import { Lock, Mail, LogIn, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn }                = useAuth()
  const [email, setEmail]         = useState('')
  const [senha, setSenha]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [erro, setErro]           = useState('')
  const [showSenha, setShowSenha] = useState(false)

  const handleEntrar = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await signIn(email, senha)
    if (error) setErro('E-mail ou senha incorretos.')
    setLoading(false)
  }

  return (
    <div className="login-bg min-h-screen flex flex-col">
      <div className="login-card-wrapper flex flex-1 items-center justify-center" style={{ paddingTop: '8vh' }}>
      <div className="w-full max-w-sm mx-4">
        <div
          className="login-card rounded-2xl p-8 shadow-2xl border border-white/10"
          style={{ background: 'rgba(8,18,55,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
        >
          <div className="text-center mb-6">
            <h2 className="text-white font-bold text-xl">Acesse sua conta</h2>
            <p className="text-blue-300/60 text-sm mt-1">Entre para acessar o sistema</p>
          </div>

          <form onSubmit={handleEntrar} className="space-y-4">
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Usuário" required
                className="w-full rounded-xl pl-11 pr-4 py-3.5 text-white text-sm placeholder-blue-300/40 border border-white/10 focus:outline-none focus:border-[#c8a84b]/60 transition"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            </div>

            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50" />
              <input
                type={showSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="Senha" required
                className="w-full rounded-xl pl-11 pr-11 py-3.5 text-white text-sm placeholder-blue-300/40 border border-white/10 focus:outline-none focus:border-[#c8a84b]/60 transition"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
              <button type="button" onClick={() => setShowSenha(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/40 hover:text-blue-300 transition">
                {showSenha
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            {erro && (
              <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                {erro}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-widest uppercase flex items-center justify-center gap-2 mt-1 transition disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #1a4ac8, #2255e0)', boxShadow: '0 4px 20px rgba(30,80,220,0.45)' }}
            >
              <LogIn size={16} />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-5 text-blue-300/40 text-xs">
            <ShieldCheck size={13} />
            <span>Acesso seguro e restrito</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
