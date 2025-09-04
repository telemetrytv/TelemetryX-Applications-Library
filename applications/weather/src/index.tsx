import React from 'react';
import { createRoot } from 'react-dom/client';
import { configure } from '@telemetryx/sdk';
import { App } from './App';
import './index.css';

// Initialize SDK with application name matching telemetry.config.json
configure('weather');

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);