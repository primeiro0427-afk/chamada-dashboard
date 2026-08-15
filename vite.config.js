import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Identificador do build. O mesmo valor é embutido no bundle e escrito em
// version.json, para o app conseguir comparar a versão que está rodando com a
// que está publicada — é assim que ele percebe que a aba está desatualizada.
const BUILD_ID = new Date().toISOString()

function emitirVersao() {
  return {
    name: 'emitir-versao',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ build: BUILD_ID }),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), emitirVersao()],
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
})
