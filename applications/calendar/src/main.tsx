import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as sdk from '@telemetryx/sdk'
import './index.css'
import App from './App.tsx'

sdk.configure('calendar');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
