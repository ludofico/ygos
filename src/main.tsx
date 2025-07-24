import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {Analytics} from "@vercel/analytics/next"
import Lightning from './components/Lightning'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Analytics />
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
        }}
      >
        <Lightning
          hue={33}
          xOffset={0}
          speed={1.3}
          intensity={1.3}
          size={2}
        />
      </div>
      <App />
    </ThemeProvider>

  </StrictMode>,
)
