import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as sdk from '@telemetryx/sdk'
import './index.css'
import { Settings } from './components/Settings'

sdk.configure('calendar');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Settings />
  </StrictMode>,
)