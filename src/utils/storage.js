import { supabase } from './supabase'

// ─── Mappers (Supabase snake_case → App camelCase) ───────────────────────────

const mapTurma     = t => ({ id: t.id, nome: t.nome, cor: t.cor })
const mapAluno     = a => ({ id: a.id, nome: a.nome, matricula: a.matricula || '', turmaId: a.turma_id })
const mapCategoria = c => ({ id: c.cat_id, nome: c.nome, pontos: c.pontos, tipo: c.tipo, ativo: c.ativo })
const mapRegistro  = r => ({ alunoId: r.aluno_id, presente: r.presente, categorias: r.categorias || {} })
const mapChamada   = c => ({
  id:        c.id,
  turmaId:   c.turma_id,
  data:      c.data,
  registros: (c.registros_chamada || []).map(mapRegistro),
})

// ─── Categorias padrão ────────────────────────────────────────────────────────

export const DEFAULT_CATEGORIAS = [
  { id: 'presenca',        nome: 'Presença',        pontos: 10, tipo: 'boolean',  ativo: true },
  { id: 'ausencia',        nome: 'Ausência',         pontos: 5,  tipo: 'ausencia', ativo: true },
  { id: 'biblia',          nome: 'Bíblia',           pontos: 5,  tipo: 'boolean',  ativo: true },
  { id: 'revista',         nome: 'Revista',          pontos: 5,  tipo: 'boolean',  ativo: true },
  { id: 'licao_lida',      nome: 'Lição Lida',       pontos: 5,  tipo: 'boolean',  ativo: true },
  { id: 'visitante',       nome: 'Visitante',        pontos: 10, tipo: 'numeric',  ativo: true },
  { id: 'jejum',           nome: 'Jejum',            pontos: 5,  tipo: 'boolean',  ativo: true },
  { id: 'culto_domestico', nome: 'Culto Doméstico',  pontos: 5,  tipo: 'boolean',  ativo: true },
  { id: 'oferta',          nome: 'Oferta',           pontos: 10, tipo: 'currency', ativo: true },
]

// ─── Cálculo de pontos (funções puras, sem I/O) ───────────────────────────────

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

// ─── Turmas ───────────────────────────────────────────────────────────────────

export const getTurmas = async () => {
  const { data, error } = await supabase
    .from('turmas')
    .select('*')
    .eq('ativo', true)
    .order('ordem')
  if (error) throw error
  return data.map(mapTurma)
}

export const saveTurmas = async (turmas, igrejaId) => {
  const { data: existing } = await supabase
    .from('turmas')
    .select('id')
    .eq('igreja_id', igrejaId)

  const existingIds = new Set((existing || []).map(t => t.id))
  const newIds      = new Set(turmas.map(t => t.id))
  const toDelete    = [...existingIds].filter(id => !newIds.has(id))

  if (toDelete.length > 0) {
    await supabase.from('turmas').delete().in('id', toDelete)
  }

  if (turmas.length > 0) {
    const { error } = await supabase.from('turmas').upsert(
      turmas.map((t, idx) => ({
        id:        t.id,
        nome:      t.nome,
        cor:       t.cor,
        ordem:     idx,
        ativo:     true,
        igreja_id: igrejaId,
      }))
    )
    if (error) throw error
  }
}

// ─── Alunos ───────────────────────────────────────────────────────────────────

export const getAlunos = async (turmaId = null) => {
  let query = supabase.from('alunos').select('*').eq('ativo', true).order('nome')
  if (turmaId) query = query.eq('turma_id', turmaId)
  const { data, error } = await query
  if (error) throw error
  return data.map(mapAluno)
}

export const saveAluno = async (aluno, igrejaId) => {
  const { error } = await supabase.from('alunos').upsert({
    id:        aluno.id,
    nome:      aluno.nome,
    matricula: aluno.matricula || '',
    turma_id:  aluno.turmaId,
    ativo:     true,
    igreja_id: igrejaId,
  })
  if (error) throw error
}

export const deleteAluno = async (id) => {
  const { error } = await supabase.from('alunos').update({ ativo: false }).eq('id', id)
  if (error) throw error
}

// ─── Categorias ───────────────────────────────────────────────────────────────

export const getCategorias = async () => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('ordem')
  if (error) throw error
  return data.map(mapCategoria)
}

export const saveCategorias = async (cats, igrejaId) => {
  const { error } = await supabase.from('categorias').upsert(
    cats.map((c, idx) => ({
      cat_id:    c.id,
      nome:      c.nome,
      pontos:    c.pontos,
      tipo:      c.tipo,
      ativo:     c.ativo,
      ordem:     idx,
      igreja_id: igrejaId,
    })),
    { onConflict: 'igreja_id,cat_id' }
  )
  if (error) throw error
}

// ─── Chamadas ─────────────────────────────────────────────────────────────────

export const getChamadas = async (turmaId = null) => {
  let query = supabase
    .from('chamadas')
    .select('*, registros_chamada(*)')
    .order('data', { ascending: false })
  if (turmaId) query = query.eq('turma_id', turmaId)
  const { data, error } = await query
  if (error) throw error
  return data.map(mapChamada)
}

export const getChamadaByData = async (turmaId, data) => {
  const { data: chamada, error } = await supabase
    .from('chamadas')
    .select('*, registros_chamada(*)')
    .eq('turma_id', turmaId)
    .eq('data', data)
    .maybeSingle()
  if (error) throw error
  return chamada ? mapChamada(chamada) : null
}

export const saveChamada = async (chamadaData, igrejaId) => {
  const { data: chamada, error: errChamada } = await supabase
    .from('chamadas')
    .upsert(
      { turma_id: chamadaData.turmaId, data: chamadaData.data, igreja_id: igrejaId },
      { onConflict: 'turma_id,data' }
    )
    .select()
    .single()
  if (errChamada) throw errChamada

  const registros = chamadaData.registros.map(r => ({
    chamada_id: chamada.id,
    aluno_id:   r.alunoId,
    presente:   r.presente,
    categorias: r.categorias || {},
    igreja_id:  igrejaId,
  }))

  const { error: errReg } = await supabase
    .from('registros_chamada')
    .upsert(registros, { onConflict: 'chamada_id,aluno_id' })
  if (errReg) throw errReg
}

// ─── Ranking e datas ──────────────────────────────────────────────────────────

export const getDatasComChamada = async () => {
  const { data, error } = await supabase
    .from('chamadas')
    .select('data')
    .order('data', { ascending: false })
  if (error) throw error
  return [...new Set(data.map(c => c.data))]
}

export const getRankingPorData = async (data) => {
  const [turmas, categorias] = await Promise.all([getTurmas(), getCategorias()])
  const chamadas = await Promise.all(turmas.map(t => getChamadaByData(t.id, data)))
  return turmas
    .map((turma, i) => ({
      turma,
      pontos:     calcularPontosChamada(chamadas[i], categorias),
      temChamada: !!chamadas[i],
    }))
    .filter(r => r.temChamada)
    .sort((a, b) => b.pontos - a.pontos)
}

// migrarDatasParaDomingo não é necessária com Supabase (datas já são corretas)
export const migrarDatasParaDomingo = () => {}

// ─── Importar backup do localStorage ─────────────────────────────────────────

const corrigirParaDomingo = (dataStr) => {
  const d = new Date(dataStr + 'T12:00:00')
  const dow = d.getDay()
  if (dow === 0) return dataStr
  d.setDate(d.getDate() - dow)
  return d.toISOString().split('T')[0]
}

export const importarBackup = async (dados, igrejaId) => {
  const { turmas = [], alunos = [], chamadas = [] } = dados

  const turmaIdMap = {}
  const alunoIdMap = {}

  // 1. Turmas
  if (turmas.length > 0) {
    const turmasNovas = turmas.map((t, idx) => {
      const novoId = crypto.randomUUID()
      turmaIdMap[t.id] = novoId
      return { id: novoId, nome: t.nome, cor: t.cor || 'indigo', ordem: idx, ativo: true, igreja_id: igrejaId }
    })
    const { error } = await supabase.from('turmas').upsert(turmasNovas)
    if (error) throw error
  }

  // 2. Alunos
  if (alunos.length > 0) {
    const alunosNovos = alunos
      .map(a => {
        const novoId = crypto.randomUUID()
        alunoIdMap[a.id] = novoId
        return {
          id:        novoId,
          nome:      a.nome,
          matricula: a.matricula || '',
          turma_id:  turmaIdMap[a.turmaId],
          ativo:     true,
          igreja_id: igrejaId,
        }
      })
      .filter(a => a.turma_id)
    if (alunosNovos.length > 0) {
      const { error } = await supabase.from('alunos').upsert(alunosNovos)
      if (error) throw error
    }
  }

  // 3. Chamadas + registros
  for (const chamada of chamadas) {
    const novaTurmaId = turmaIdMap[chamada.turmaId]
    if (!novaTurmaId) continue

    const dataCorrigida = corrigirParaDomingo(chamada.data)
    const { data: novaChamada, error: errChamada } = await supabase
      .from('chamadas')
      .upsert(
        { turma_id: novaTurmaId, data: dataCorrigida, igreja_id: igrejaId },
        { onConflict: 'turma_id,data' }
      )
      .select()
      .single()
    if (errChamada) continue

    const registros = (chamada.registros || [])
      .map(r => {
        const novoAlunoId = alunoIdMap[r.alunoId]
        if (!novoAlunoId) return null
        return {
          chamada_id: novaChamada.id,
          aluno_id:   novoAlunoId,
          presente:   r.presente,
          categorias: r.categorias || {},
          igreja_id:  igrejaId,
        }
      })
      .filter(Boolean)

    if (registros.length > 0) {
      await supabase
        .from('registros_chamada')
        .upsert(registros, { onConflict: 'chamada_id,aluno_id' })
    }
  }
}
