export const getToday = () => new Date().toISOString().split('T')[0]

export const formatDate = (date) => {
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const formatDateBR = (dateStr) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export const formatDateFull = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export const getLastSundayOrToday = () => {
  const today = new Date()
  const day = today.getDay()
  if (day === 0) return formatDate(today)
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - day)
  return formatDate(sunday)
}

export const isSunday = (dateStr) => new Date(dateStr + 'T12:00:00').getDay() === 0

/**
 * Período é inclusive nas duas pontas; null em qualquer uma significa "sem
 * limite desse lado". Como as datas são YYYY-MM-DD, comparar como texto já
 * dá a ordem cronológica certa — não precisa converter para Date.
 */
export const dentroDoPeriodo = (dateStr, inicio, fim) =>
  (!inicio || dateStr >= inicio) && (!fim || dateStr <= fim)

export const filtrarPorPeriodo = (chamadas, { inicio, fim } = {}) =>
  (!inicio && !fim) ? chamadas : chamadas.filter(c => dentroDoPeriodo(c.data, inicio, fim))

export const descreverPeriodo = ({ inicio, fim } = {}) => {
  if (!inicio && !fim) return 'Todo o período'
  if (inicio && fim)   return `${formatDateBR(inicio)} a ${formatDateBR(fim)}`
  return inicio ? `A partir de ${formatDateBR(inicio)}` : `Até ${formatDateBR(fim)}`
}

export const getPastSundays = (limit = 52) => {
  const sundays = []
  const today = new Date()
  const current = new Date(today)
  const dow = current.getDay()
  if (dow !== 0) current.setDate(current.getDate() - dow)

  for (let i = 0; i < limit; i++) {
    sundays.push(formatDate(new Date(current)))
    current.setDate(current.getDate() - 7)
  }
  return sundays
}
