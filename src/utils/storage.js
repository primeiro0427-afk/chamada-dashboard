import { formatDate } from './dates'

const KEYS = {
  TURMAS: 'chamada_turmas',
  ALUNOS: 'chamada_alunos',
  CHAMADAS: 'chamada_registros',
  CATEGORIAS: 'chamada_categorias',
}

export const DEFAULT_CATEGORIAS = [
  { id: 'presenca',        nome: 'Presença',         pontos: 10, tipo: 'boolean',  ativo: true },
  { id: 'ausencia',        nome: 'Ausência',         pontos: 5,  tipo: 'ausencia', ativo: true },
  { id: 'biblia',          nome: 'Bíblia',           pontos: 5,  tipo: 'boolean',  ativo: true },
  { id: 'revista',         nome: 'Revista',          pontos: 5,  tipo: 'boolean',  ativo: true },
  { id: 'licao_lida',     nome: 'Lição Lida',       pontos: 5,  tipo: 'boolean',  ativo: true },
  { id: 'visitante',       nome: 'Visitante',        pontos: 10, tipo: 'numeric',  ativo: true },
  { id: 'jejum',           nome: 'Jejum',            pontos: 5,  tipo: 'boolean',  ativo: true },
  { id: 'culto_domestico', nome: 'Culto Doméstico',  pontos: 5,  tipo: 'boolean',  ativo: true },
  { id: 'oferta',          nome: 'Oferta',           pontos: 10, tipo: 'currency', ativo: true },
]

export const getCategorias = () => {
  const data = localStorage.getItem(KEYS.CATEGORIAS)
  if (!data) return DEFAULT_CATEGORIAS
  return JSON.parse(data)
}

export const saveCategorias = (cats) => {
  localStorage.setItem(KEYS.CATEGORIAS, JSON.stringify(cats))
}

export const calcularPontosRegistro = (registro, categorias) => {
  if (!registro.presente) {
    const ausencia = categorias.find(c => c.id === 'ausencia' && c.ativo)
    return ausencia ? -ausencia.pontos : 0
  }
  let total = 0
  categorias.forEach(cat => {
    if (!cat.ativo || cat.id === 'ausencia') return
    if (cat.id === 'presenca') {
      total += cat.pontos
    } else if (cat.tipo === 'boolean') {
      if (registro.categorias?.[cat.id]) total += cat.pontos
    } else if (cat.tipo === 'numeric') {
      const val = parseInt(registro.categorias?.[cat.id]) || 0
      total += val * cat.pontos
    } else if (cat.tipo === 'currency') {
      const val = parseFloat(registro.categorias?.[cat.id]) || 0
      total += Math.floor(val) * cat.pontos
    }
  })
  return total
}

export const calcularPontosChamada = (chamada, categorias) => {
  if (!chamada) return 0
  return chamada.registros.reduce((sum, r) => sum + calcularPontosRegistro(r, categorias), 0)
}

export const migrarDatasParaDomingo = () => {
  const chamadas = getChamadas()
  const corrigidas = chamadas.map(c => {
    const d = new Date(c.data + 'T12:00:00')
    const dow = d.getDay()
    if (dow !== 0) {
      d.setDate(d.getDate() - dow) // qualquer dia → domingo anterior
      const novaData = formatDate(d)
      return { ...c, id: `${c.turmaId}_${novaData}`, data: novaData }
    }
    return c
  })
  const houveMudanca = chamadas.some((c, i) => c.data !== corrigidas[i].data)
  if (houveMudanca) localStorage.setItem(KEYS.CHAMADAS, JSON.stringify(corrigidas))
}

export const getDatasComChamada = () => {
  const chamadas = getChamadas()
  const datas = [...new Set(chamadas.map(c => c.data))]
  return datas.sort((a, b) => b.localeCompare(a))
}

export const getRankingPorData = (data) => {
  const turmas = getTurmas()
  const categorias = getCategorias()
  return turmas
    .map(turma => {
      const chamada = getChamadaByData(turma.id, data)
      return { turma, pontos: calcularPontosChamada(chamada, categorias), temChamada: !!chamada }
    })
    .filter(r => r.temChamada)
    .sort((a, b) => b.pontos - a.pontos)
}

const DEFAULT_TURMAS = [
  { id: '1', nome: 'Turma A', cor: 'indigo' },
  { id: '2', nome: 'Turma B', cor: 'emerald' },
  { id: '3', nome: 'Turma C', cor: 'amber' },
  { id: '4', nome: 'Turma D', cor: 'rose' },
  { id: '5', nome: 'Turma E', cor: 'violet' },
  { id: '6', nome: 'Turma F', cor: 'cyan' },
]

export const getTurmas = () => {
  const data = localStorage.getItem(KEYS.TURMAS)
  if (!data) {
    localStorage.setItem(KEYS.TURMAS, JSON.stringify(DEFAULT_TURMAS))
    return DEFAULT_TURMAS
  }
  return JSON.parse(data)
}

export const saveTurmas = (turmas) => {
  localStorage.setItem(KEYS.TURMAS, JSON.stringify(turmas))
}

export const updateTurma = (turma) => {
  const turmas = getTurmas()
  const idx = turmas.findIndex(t => t.id === turma.id)
  if (idx >= 0) {
    turmas[idx] = turma
    localStorage.setItem(KEYS.TURMAS, JSON.stringify(turmas))
  }
}

export const getAlunos = (turmaId = null) => {
  const data = localStorage.getItem(KEYS.ALUNOS)
  const alunos = data ? JSON.parse(data) : []
  return turmaId ? alunos.filter(a => a.turmaId === turmaId) : alunos
}

export const saveAluno = (aluno) => {
  const alunos = getAlunos()
  const idx = alunos.findIndex(a => a.id === aluno.id)
  if (idx >= 0) alunos[idx] = aluno
  else alunos.push(aluno)
  localStorage.setItem(KEYS.ALUNOS, JSON.stringify(alunos))
}

export const deleteAluno = (id) => {
  const alunos = getAlunos().filter(a => a.id !== id)
  localStorage.setItem(KEYS.ALUNOS, JSON.stringify(alunos))
}

export const getChamadas = (turmaId = null) => {
  const data = localStorage.getItem(KEYS.CHAMADAS)
  const chamadas = data ? JSON.parse(data) : []
  return turmaId ? chamadas.filter(c => c.turmaId === turmaId) : chamadas
}

export const saveChamada = (chamada) => {
  const chamadas = getChamadas()
  const idx = chamadas.findIndex(c => c.id === chamada.id)
  if (idx >= 0) chamadas[idx] = chamada
  else chamadas.push(chamada)
  localStorage.setItem(KEYS.CHAMADAS, JSON.stringify(chamadas))
}

export const getChamadaByData = (turmaId, data) => {
  return getChamadas(turmaId).find(c => c.data === data) || null
}

export const exportData = () => {
  const data = {
    turmas: getTurmas(),
    alunos: getAlunos(),
    chamadas: getChamadas(),
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup-chamada-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const importData = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.turmas) localStorage.setItem(KEYS.TURMAS, JSON.stringify(data.turmas))
        if (data.alunos) localStorage.setItem(KEYS.ALUNOS, JSON.stringify(data.alunos))
        if (data.chamadas) localStorage.setItem(KEYS.CHAMADAS, JSON.stringify(data.chamadas))
        resolve()
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsText(file)
  })
