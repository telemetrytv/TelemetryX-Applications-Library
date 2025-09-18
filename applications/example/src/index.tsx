/// <reference types="vite/client" />

import './index.css'

import { createRoot } from 'react-dom/client'
import { App } from './App'
import { configure } from '@telemetryx/sdk'

configure('example')

createRoot(document.querySelector('#app')!).render(<App />)
