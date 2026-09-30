import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { completeEmailRedirect } from './cloud/redirect'
import './index.css'

completeEmailRedirect().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
