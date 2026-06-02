import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ExamProvider } from './context/ExamContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExamProvider>
      <App />
    </ExamProvider>
  </StrictMode>,
)
