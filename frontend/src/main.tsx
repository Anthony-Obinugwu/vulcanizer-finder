import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import Admin from './Admin.tsx'

const path = window.location.pathname;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/add' ? <Admin /> : <App />}
    <Toaster 
      theme="dark" 
      position="top-center"
      toastOptions={{
        className: 'bg-slate-900 border-slate-800 text-slate-200 shadow-2xl backdrop-blur-xl',
        style: { borderRadius: '1rem' }
      }}
    />
  </StrictMode>,
)
