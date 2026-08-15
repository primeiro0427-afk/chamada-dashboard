import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErroBoundary from './components/ErroBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErroBoundary>
      <App />
    </ErroBoundary>
  </StrictMode>,
)
