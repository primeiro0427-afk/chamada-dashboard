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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#071022]">

      {/* ── Fundo SVG ─────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
          className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradiente de fundo */}
            <radialGradient id="bg" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#0d2151" />
              <stop offset="100%" stopColor="#071022" />
            </radialGradient>
            {/* Luz central */}
            <radialGradient id="luz" cx="50%" cy="35%" r="40%">
              <stop offset="0%" stopColor="#1a3a8f" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#071022" stopOpacity="0" />
            </radialGradient>
            {/* Luz vitral esquerda */}
            <radialGradient id="luzEsq" cx="15%" cy="30%" r="30%">
              <stop offset="0%" stopColor="#1e4db7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#071022" stopOpacity="0" />
            </radialGradient>
            {/* Luz vitral direita */}
            <radialGradient id="luzDir" cx="85%" cy="30%" r="30%">
              <stop offset="0%" stopColor="#1e4db7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#071022" stopOpacity="0" />
            </radialGradient>
            {/* Brilho dourado */}
            <radialGradient id="ouro" cx="50%" cy="0%" r="50%">
              <stop offset="0%" stopColor="#c8a84b" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#071022" stopOpacity="0" />
            </radialGradient>
            <filter id="blur4">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <filter id="blur8">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="blur2">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>

          {/* Fundo base */}
          <rect width="1440" height="900" fill="url(#bg)" />
          <rect width="1440" height="900" fill="url(#luz)" />
          <rect width="1440" height="900" fill="url(#luzEsq)" />
          <rect width="1440" height="900" fill="url(#luzDir)" />
          <rect width="1440" height="900" fill="url(#ouro)" />

          {/* ── Vitral esquerdo ──────────────────────────────────────────── */}
          <g opacity="0.55" filter="url(#blur2)">
            {/* Arco principal */}
            <path d="M 80 520 L 80 160 Q 80 60 170 60 Q 260 60 260 160 L 260 520 Z"
              fill="none" stroke="#3a6bc4" strokeWidth="2.5" />
            {/* Arco interno */}
            <path d="M 100 510 L 100 170 Q 100 85 170 85 Q 240 85 240 170 L 240 510 Z"
              fill="none" stroke="#2a5ab0" strokeWidth="1.5" />
            {/* Roseta central */}
            <circle cx="170" cy="160" r="45" fill="none" stroke="#4070c8" strokeWidth="1.5" />
            <circle cx="170" cy="160" r="30" fill="none" stroke="#3560b8" strokeWidth="1" />
            <circle cx="170" cy="160" r="15" fill="#1a3a8f" opacity="0.4" />
            {/* Pétalas da roseta */}
            {[0,45,90,135,180,225,270,315].map((a, i) => (
              <ellipse key={i}
                cx={170 + 38 * Math.cos(a * Math.PI / 180)}
                cy={160 + 38 * Math.sin(a * Math.PI / 180)}
                rx="8" ry="14"
                transform={`rotate(${a}, ${170 + 38 * Math.cos(a * Math.PI / 180)}, ${160 + 38 * Math.sin(a * Math.PI / 180)})`}
                fill="none" stroke="#4878d0" strokeWidth="1"
              />
            ))}
            {/* Painéis verticais */}
            <line x1="170" y1="210" x2="170" y2="510" stroke="#2a5ab0" strokeWidth="1.5" />
            <line x1="130" y1="250" x2="130" y2="510" stroke="#2a5ab0" strokeWidth="1" />
            <line x1="210" y1="250" x2="210" y2="510" stroke="#2a5ab0" strokeWidth="1" />
            {/* Arcos dos painéis */}
            {[260, 320, 380, 440].map((y, i) => (
              <path key={i} d={`M 100 ${y} Q 135 ${y - 25} 170 ${y}`} fill="none" stroke="#2a5ab0" strokeWidth="1" />
            ))}
            {[260, 320, 380, 440].map((y, i) => (
              <path key={i} d={`M 170 ${y} Q 205 ${y - 25} 240 ${y}`} fill="none" stroke="#2a5ab0" strokeWidth="1" />
            ))}
            {/* Luz interior */}
            <path d="M 85 520 L 85 165 Q 85 70 170 70 Q 255 70 255 165 L 255 520 Z"
              fill="#1a3fff" opacity="0.04" />
          </g>

          {/* ── Vitral direito ───────────────────────────────────────────── */}
          <g opacity="0.4" filter="url(#blur2)">
            <path d="M 1180 520 L 1180 160 Q 1180 60 1270 60 Q 1360 60 1360 160 L 1360 520 Z"
              fill="none" stroke="#3a6bc4" strokeWidth="2.5" />
            <path d="M 1200 510 L 1200 170 Q 1200 85 1270 85 Q 1340 85 1340 170 L 1340 510 Z"
              fill="none" stroke="#2a5ab0" strokeWidth="1.5" />
            <circle cx="1270" cy="160" r="45" fill="none" stroke="#4070c8" strokeWidth="1.5" />
            <circle cx="1270" cy="160" r="30" fill="none" stroke="#3560b8" strokeWidth="1" />
            <circle cx="1270" cy="160" r="15" fill="#1a3a8f" opacity="0.4" />
            {[0,45,90,135,180,225,270,315].map((a, i) => (
              <ellipse key={i}
                cx={1270 + 38 * Math.cos(a * Math.PI / 180)}
                cy={160 + 38 * Math.sin(a * Math.PI / 180)}
                rx="8" ry="14"
                transform={`rotate(${a}, ${1270 + 38 * Math.cos(a * Math.PI / 180)}, ${160 + 38 * Math.sin(a * Math.PI / 180)})`}
                fill="none" stroke="#4878d0" strokeWidth="1"
              />
            ))}
            <line x1="1270" y1="210" x2="1270" y2="510" stroke="#2a5ab0" strokeWidth="1.5" />
            <line x1="1230" y1="250" x2="1230" y2="510" stroke="#2a5ab0" strokeWidth="1" />
            <line x1="1310" y1="250" x2="1310" y2="510" stroke="#2a5ab0" strokeWidth="1" />
            {[260, 320, 380, 440].map((y, i) => (
              <path key={i} d={`M 1200 ${y} Q 1235 ${y - 25} 1270 ${y}`} fill="none" stroke="#2a5ab0" strokeWidth="1" />
            ))}
            {[260, 320, 380, 440].map((y, i) => (
              <path key={i} d={`M 1270 ${y} Q 1305 ${y - 25} 1340 ${y}`} fill="none" stroke="#2a5ab0" strokeWidth="1" />
            ))}
            <path d="M 1185 520 L 1185 165 Q 1185 70 1270 70 Q 1355 70 1355 165 L 1355 520 Z"
              fill="#1a3fff" opacity="0.04" />
          </g>

          {/* ── Silhueta de pessoa orando (centro, fundo) ─────────────────── */}
          <g opacity="0.12" filter="url(#blur4)">
            <ellipse cx="720" cy="820" rx="120" ry="20" fill="#071022" />
            <path d="M 720 820 L 720 600 Q 720 560 700 545 Q 670 530 660 510 Q 645 480 660 460 Q 680 435 720 435 Q 760 435 780 460 Q 795 480 780 510 Q 770 530 740 545 Q 720 560 720 600"
              fill="#0d2151" />
            <ellipse cx="720" cy="420" rx="35" ry="40" fill="#0d2151" />
            <path d="M 660 510 Q 620 540 600 580 Q 590 600 610 610 Q 630 615 650 590 Q 665 570 680 560"
              fill="#0d2151" />
            <path d="M 780 510 Q 820 540 840 580 Q 850 600 830 610 Q 810 615 790 590 Q 775 570 760 560"
              fill="#0d2151" />
          </g>

          {/* ── Cruz central ao fundo ────────────────────────────────────── */}
          <g opacity="0.06" filter="url(#blur8)">
            <rect x="700" y="100" width="40" height="300" fill="#c8a84b" />
            <rect x="620" y="180" width="200" height="35" fill="#c8a84b" />
          </g>

          {/* ── Linhas de luz (raios) ────────────────────────────────────── */}
          <g opacity="0.06" filter="url(#blur8)">
            {[-40,-20,0,20,40].map((a, i) => (
              <line key={i}
                x1="720" y1="0"
                x2={720 + 800 * Math.sin(a * Math.PI / 180)}
                y2="900"
                stroke="#3060c0" strokeWidth="60"
              />
            ))}
          </g>

          {/* ── Skyline de igrejas ───────────────────────────────────────── */}
          <g opacity="0.25" fill="none" stroke="#4070c8" strokeWidth="1.2">
            {/* Igreja 1 */}
            <rect x="40" y="810" width="60" height="60" />
            <path d="M 40 810 L 70 770 L 100 810" />
            <line x1="70" y1="770" x2="70" y2="750" />
            <line x1="60" y1="755" x2="80" y2="755" />
            <rect x="58" y="830" width="24" height="40" />
            {/* Igreja 2 */}
            <rect x="130" y="820" width="45" height="50" />
            <path d="M 130 820 L 152 790 L 175 820" />
            <line x1="152" y1="790" x2="152" y2="775" />
            <line x1="145" y1="779" x2="159" y2="779" />
            <rect x="144" y="838" width="17" height="32" />
            {/* Igreja 3 - maior */}
            <rect x="210" y="800" width="80" height="70" />
            <path d="M 210 800 L 250 755 L 290 800" />
            <line x1="250" y1="755" x2="250" y2="730" />
            <line x1="240" y1="736" x2="260" y2="736" />
            <rect x="238" y="825" width="24" height="45" />
            <rect x="216" y="815" width="18" height="20" />
            <rect x="256" y="815" width="18" height="20" />
            {/* Igreja 4 */}
            <rect x="330" y="825" width="40" height="45" />
            <path d="M 330 825 L 350 800 L 370 825" />
            <line x1="350" y1="800" x2="350" y2="785" />
            <line x1="344" y1="789" x2="356" y2="789" />
            <rect x="342" y="840" width="16" height="30" />
            {/* Igreja 5 */}
            <rect x="405" y="830" width="35" height="40" />
            <path d="M 405 830 L 422 810 L 440 830" />
            <line x1="422" y1="810" x2="422" y2="798" />
            <line x1="417" y1="802" x2="427" y2="802" />

            {/* Centro - Igreja grande */}
            <rect x="610" y="790" width="220" height="80" />
            <path d="M 610 790 L 720 730 L 830 790" />
            <line x1="720" y1="730" x2="720" y2="700" />
            <line x1="706" y1="707" x2="734" y2="707" />
            <rect x="704" y="820" width="32" height="50" />
            <rect x="618" y="808" width="28" height="28" />
            <rect x="794" y="808" width="28" height="28" />
            <rect x="658" y="808" width="22" height="25" />
            <rect x="760" y="808" width="22" height="25" />

            {/* Direita */}
            <rect x="1000" y="825" width="35" height="45" />
            <path d="M 1000 825 L 1017 805 L 1035 825" />
            <line x1="1017" y1="805" x2="1017" y2="793" />
            <line x1="1012" y1="797" x2="1022" y2="797" />
            <rect x="1009" y="840" width="16" height="30" />

            <rect x="1070" y="815" width="55" height="55" />
            <path d="M 1070 815 L 1097 780 L 1125 815" />
            <line x1="1097" y1="780" x2="1097" y2="762" />
            <line x1="1089" y1="767" x2="1105" y2="767" />
            <rect x="1087" y="835" width="20" height="35" />

            <rect x="1165" y="808" width="70" height="62" />
            <path d="M 1165 808 L 1200 768 L 1235 808" />
            <line x1="1200" y1="768" x2="1200" y2="748" />
            <line x1="1192" y1="753" x2="1208" y2="753" />
            <rect x="1190" y="830" width="20" height="40" />
            <rect x="1171" y="820" width="16" height="18" />
            <rect x="1213" y="820" width="16" height="18" />

            <rect x="1280" y="820" width="50" height="50" />
            <path d="M 1280 820 L 1305 793 L 1330 820" />
            <line x1="1305" y1="793" x2="1305" y2="778" />
            <line x1="1298" y1="782" x2="1312" y2="782" />
            <rect x="1296" y="838" width="18" height="32" />

            <rect x="1370" y="828" width="40" height="42" />
            <path d="M 1370 828 L 1390 806 L 1410 828" />
            <line x1="1390" y1="806" x2="1390" y2="793" />
            <line x1="1384" y1="797" x2="1396" y2="797" />
          </g>

          {/* Linha do horizonte */}
          <line x1="0" y1="870" x2="1440" y2="870" stroke="#1a3a8f" strokeWidth="0.5" opacity="0.3" />
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
