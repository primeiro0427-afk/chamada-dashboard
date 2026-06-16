import { useState } from 'react'
import { Lock, Mail, LogIn, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn }            = useAuth()
  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro]       = useState('')
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#071022]"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1548625149-720754516597?w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >

      {/* Overlay azul escuro sobre a foto */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(5,14,40,0.82) 0%, rgba(7,16,48,0.88) 60%, rgba(4,10,32,0.96) 100%)' }} />

      {/* Skyline de igrejas no rodapé */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="xMidYMax meet" className="w-full" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" stroke="#4878d0" strokeWidth="1.2" opacity="0.3">
            <rect x="40" y="60" width="60" height="60" /><path d="M 40 60 L 70 25 L 100 60" /><line x1="70" y1="25" x2="70" y2="8" /><line x1="62" y1="13" x2="78" y2="13" /><rect x="58" y="78" width="24" height="42" />
            <rect x="130" y="70" width="45" height="50" /><path d="M 130 70 L 152 42 L 175 70" /><line x1="152" y1="42" x2="152" y2="28" /><line x1="145" y1="33" x2="159" y2="33" /><rect x="144" y="86" width="17" height="34" />
            <rect x="210" y="48" width="80" height="72" /><path d="M 210 48 L 250 8 L 290 48" /><line x1="250" y1="8" x2="250" y2="-8" /><line x1="242" y1="-3" x2="258" y2="-3" /><rect x="238" y="70" width="24" height="50" /><rect x="216" y="62" width="18" height="22" /><rect x="256" y="62" width="18" height="22" />
            <rect x="330" y="65" width="40" height="55" /><path d="M 330 65 L 350 38 L 370 65" /><line x1="350" y1="38" x2="350" y2="22" /><line x1="344" y1="27" x2="356" y2="27" /><rect x="342" y="82" width="16" height="38" />
            <rect x="405" y="72" width="35" height="48" /><path d="M 405 72 L 422 50 L 440 72" /><line x1="422" y1="50" x2="422" y2="37" /><line x1="417" y1="42" x2="427" y2="42" />
            <rect x="580" y="38" width="280" height="82" /><path d="M 580 38 L 720 -8 L 860 38" /><line x1="720" y1="-8" x2="720" y2="-28" /><line x1="708" y1="-22" x2="732" y2="-22" /><rect x="704" y="64" width="32" height="56" /><rect x="590" y="54" width="28" height="30" /><rect x="822" y="54" width="28" height="30" /><rect x="636" y="54" width="22" height="26" /><rect x="782" y="54" width="22" height="26" />
            <rect x="1000" y="68" width="35" height="52" /><path d="M 1000 68 L 1017 46 L 1035 68" /><line x1="1017" y1="46" x2="1017" y2="32" /><line x1="1012" y1="37" x2="1022" y2="37" /><rect x="1009" y="84" width="16" height="36" />
            <rect x="1070" y="55" width="55" height="65" /><path d="M 1070 55 L 1097 22 L 1125 55" /><line x1="1097" y1="22" x2="1097" y2="6" /><line x1="1090" y1="11" x2="1104" y2="11" /><rect x="1087" y="74" width="20" height="46" />
            <rect x="1165" y="48" width="70" height="72" /><path d="M 1165 48 L 1200 10 L 1235 48" /><line x1="1200" y1="10" x2="1200" y2="-6" /><line x1="1193" y1="-1" x2="1207" y2="-1" /><rect x="1190" y="68" width="20" height="52" /><rect x="1172" y="62" width="16" height="20" /><rect x="1213" y="62" width="16" height="20" />
            <rect x="1280" y="62" width="50" height="58" /><path d="M 1280 62 L 1305 36 L 1330 62" /><line x1="1305" y1="36" x2="1305" y2="20" /><line x1="1298" y1="25" x2="1312" y2="25" /><rect x="1296" y="78" width="18" height="42" />
            <rect x="1370" y="70" width="40" height="50" /><path d="M 1370 70 L 1390 48 L 1410 70" /><line x1="1390" y1="48" x2="1390" y2="34" /><line x1="1384" y1="39" x2="1396" y2="39" />
          </g>
          <line x1="0" y1="119" x2="1440" y2="119" stroke="#2a4a9f" strokeWidth="0.8" opacity="0.4" />
        </svg>
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md mx-4 flex flex-col items-center gap-8">

        {/* Logo + Título */}
        <div className="text-center space-y-4">
          {/* Logo SVG: Cruz + Bíblia */}
          <div className="flex justify-center">
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="45" cy="38" r="32" fill="none" stroke="#c8a84b" strokeWidth="1.5" opacity="0.6" />
              {/* Bíblia */}
              <path d="M 22 52 Q 22 62 32 62 L 62 62 Q 68 62 68 56 L 68 38 Q 68 32 62 32 L 32 32 Q 22 32 22 42 Z"
                fill="none" stroke="#c8a84b" strokeWidth="2" />
              <path d="M 38 32 L 38 62" stroke="#c8a84b" strokeWidth="1.5" />
              <path d="M 24 42 Q 31 38 38 42" stroke="#c8a84b" strokeWidth="1.2" fill="none" />
              <path d="M 24 48 Q 31 44 38 48" stroke="#c8a84b" strokeWidth="1.2" fill="none" />
              <path d="M 24 54 Q 31 50 38 54" stroke="#c8a84b" strokeWidth="1.2" fill="none" />
              <path d="M 44 42 Q 52 38 66 40" stroke="#c8a84b" strokeWidth="1.2" fill="none" />
              <path d="M 44 48 Q 52 44 66 46" stroke="#c8a84b" strokeWidth="1.2" fill="none" />
              <path d="M 44 54 Q 52 50 66 52" stroke="#c8a84b" strokeWidth="1.2" fill="none" />
              {/* Cruz */}
              <rect x="43" y="12" width="4" height="26" fill="#c8a84b" />
              <rect x="34" y="19" width="22" height="4" fill="#c8a84b" />
              {/* Brilho da cruz */}
              <rect x="44" y="12" width="1.5" height="26" fill="#f0d080" opacity="0.6" />
              <rect x="34" y="19" width="22" height="1.5" fill="#f0d080" opacity="0.6" />
            </svg>
          </div>

          <div>
            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              className="text-4xl font-bold text-white tracking-wide leading-tight">
              Escola Bíblica
            </h1>
            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              className="text-4xl font-bold text-white tracking-wide">
              Dominical
            </h1>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="h-px w-12 bg-[#c8a84b] opacity-70" />
              <p className="text-[#c8a84b] text-xs font-semibold tracking-[0.25em] uppercase">
                Sistema de Chamada
              </p>
              <div className="h-px w-12 bg-[#c8a84b] opacity-70" />
            </div>
          </div>
        </div>

        {/* Card de login */}
        <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-white font-bold text-xl">Acesse sua conta</h2>
            <p className="text-blue-300/70 text-sm mt-1">Entre para acessar o sistema</p>
          </div>

          <form onSubmit={handleEntrar} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/60" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Usuário"
                required
                className="w-full bg-white/8 border border-white/15 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-blue-300/50 text-sm focus:outline-none focus:border-[#c8a84b]/60 focus:bg-white/12 transition"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
            </div>

            {/* Senha */}
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/60" />
              <input
                type={showSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Senha"
                required
                className="w-full bg-white/8 border border-white/15 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-blue-300/50 text-sm focus:outline-none focus:border-[#c8a84b]/60 focus:bg-white/12 transition"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
              <button type="button" onClick={() => setShowSenha(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-300 transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showSenha
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              </button>
            </div>

            {erro && (
              <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                {erro}
              </p>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-widest uppercase transition flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              style={{ background: loading ? '#1a3a9f' : 'linear-gradient(135deg, #1a4ac8 0%, #2255e0 50%, #1a4ac8 100%)', boxShadow: '0 4px 24px rgba(30,80,220,0.4)' }}
            >
              <LogIn size={16} />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Acesso seguro */}
          <div className="flex items-center justify-center gap-2 mt-5 text-blue-300/50 text-xs">
            <ShieldCheck size={13} />
            <span>Acesso seguro e restrito</span>
          </div>
        </div>

        {/* Versículo */}
        <div className="text-center space-y-1 pb-4">
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none" className="mx-auto mb-2" xmlns="http://www.w3.org/2000/svg">
            <path d="M 2 2 L 2 14 Q 2 18 6 18 L 12 18 Q 14 18 14 16 L 14 4 Q 14 2 12 2 Z" fill="none" stroke="#c8a84b" strokeWidth="1.3" opacity="0.7"/>
            <path d="M 3 6 Q 6 4 9 6" stroke="#c8a84b" strokeWidth="1" fill="none" opacity="0.7"/>
            <path d="M 3 9 Q 6 7 9 9" stroke="#c8a84b" strokeWidth="1" fill="none" opacity="0.7"/>
            <path d="M 16 2 L 16 14 Q 16 18 20 18 L 26 18 Q 28 18 28 16 L 28 4 Q 28 2 26 2 Z" fill="none" stroke="#c8a84b" strokeWidth="1.3" opacity="0.7"/>
            <path d="M 17 6 Q 20 4 23 6" stroke="#c8a84b" strokeWidth="1" fill="none" opacity="0.7"/>
            <path d="M 17 9 Q 20 7 23 9" stroke="#c8a84b" strokeWidth="1" fill="none" opacity="0.7"/>
          </svg>
          <p className="text-white/70 text-sm italic" style={{ fontFamily: 'Georgia, serif' }}>
            "Tudo seja feito com decência e ordem."
          </p>
          <p className="text-[#c8a84b] text-xs tracking-wider">1 Coríntios 14:40</p>
        </div>
      </div>
    </div>
  )
}
