// Geração de CSV para abrir no Excel em português.
//
// O Excel usa o separador de lista do Windows, que no Brasil é ";". Com vírgula
// ele não separa nada e joga a linha inteira numa célula só.
const SEPARADOR = ';'

// Escapa só quando precisa. Aspas dentro do texto viram aspas dobradas, que é
// como o CSV escapa aspas.
const celula = (valor) => {
  const texto = valor === null || valor === undefined ? '' : String(valor)
  return /["\n\r;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

/**
 * `meta` são as linhas de referência do relatório (o que é, de quando é),
 * impressas antes da tabela e separadas dela por uma linha em branco — sem
 * isso o arquivo não diz a que período se refere.
 */
export const baixarCSV = (nomeArquivo, header, linhas, meta = []) => {
  const blocos = []

  if (meta.length > 0) {
    blocos.push(...meta.map(linha => linha.map(celula).join(SEPARADOR)), '')
  }

  blocos.push(
    header.map(celula).join(SEPARADOR),
    ...linhas.map(linha => linha.map(celula).join(SEPARADOR)),
  )

  const csv = blocos.join('\r\n')

  // O BOM faz o Excel reconhecer o arquivo como UTF-8 e não quebrar os acentos.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = nomeArquivo
  a.click()
  URL.revokeObjectURL(url)
}
