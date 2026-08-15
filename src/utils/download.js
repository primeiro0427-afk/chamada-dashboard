/** Dispara o download de um arquivo gerado no navegador. */
export const baixarArquivo = (nomeArquivo, conteudo, tipo) => {
  const blob = new Blob([conteudo], { type: tipo })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = nomeArquivo
  a.click()
  URL.revokeObjectURL(url)
}
