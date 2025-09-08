import React from 'react';
import { createRoot } from 'react-dom/client';
// import { TelemetryX } from '@telemetryx/sdk';
import { TelemetryX } from './mocks/telemetryx-sdk';
import App from './App';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RSS App Error:', error, errorInfo);
    
    // Report error to TelemetryX if available
    if (typeof TelemetryX !== 'undefined' && TelemetryX.logging) {
      TelemetryX.logging.error('RSS application error', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '1.2rem'
          }}
        >
          <h1 style={{ marginBottom: '1rem', color: '#ff6b6b' }}>
            RSS Application Error
          </h1>
          <p style={{ marginBottom: '1rem', opacity: 0.8 }}>
            The RSS application encountered an unexpected error.
          </p>
          <details style={{ marginTop: '1rem', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
              Error Details
            </summary>
            <pre style={{ 
              background: '#1a1a1a', 
              padding: '1rem', 
              borderRadius: '4px',
              fontSize: '0.8rem',
              textAlign: 'left',
              overflow: 'auto'
            }}>
              {this.state.error?.stack || 'No error details available'}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#4a9eff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Application initialization
async function initializeApp() {
  try {
    // Wait for TelemetryX SDK to be ready
    if (typeof TelemetryX !== 'undefined' && TelemetryX.device) {
      await TelemetryX.device.ready();
      console.log('TelemetryX SDK initialized successfully');
    }

    // Get application parameters from TelemetryX
    let itemUrl = '';
    let pageDuration = 0;

    if (typeof TelemetryX !== 'undefined' && TelemetryX.app) {
      try {
        const appConfig = await TelemetryX.app.getConfiguration();
        itemUrl = appConfig?.url || '';
        pageDuration = appConfig?.page_duration || 0;
        
        console.log('RSS App Configuration:', { itemUrl, pageDuration });
      } catch (configError) {
        console.warn('Could not get app configuration:', configError);
        
        // Fallback: try to get URL from query parameters
        const urlParams = new URLSearchParams(window.location.search);
        itemUrl = urlParams.get('url') || '';
        pageDuration = parseInt(urlParams.get('duration') || '0', 10);
      }
    } else {
      console.warn('TelemetryX SDK not available, using fallback configuration');
      
      // Development fallback
      const urlParams = new URLSearchParams(window.location.search);
      itemUrl = urlParams.get('url') || 'sourcefeed=https://feeds.npr.org/1001/rss.xml&appType=npr-feed';
      pageDuration = parseInt(urlParams.get('duration') || '10', 10);
    }

    // Render the React application
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root container not found');
    }

    const root = createRoot(container);
    
    root.render(
      <ErrorBoundary>
        <App itemUrl={itemUrl} pageDuration={pageDuration} />
      </ErrorBoundary>
    );

    console.log('RSS application rendered successfully');

  } catch (error) {
    console.error('Failed to initialize RSS application:', error);
    
    // Show basic error UI if React fails to render
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          padding: 2rem;
          text-align: center;
          background-color: #000;
          color: #fff;
          font-family: Arial, sans-serif;
          font-size: 1.2rem;
        ">
          <h1 style="margin-bottom: 1rem; color: #ff6b6b;">
            RSS Application Failed to Start
          </h1>
          <p style="margin-bottom: 1rem; opacity: 0.8;">
            ${error instanceof Error ? error.message : 'Unknown initialization error'}
          </p>
          <button onclick="window.location.reload()" style="
            margin-top: 2rem;
            padding: 0.5rem 1rem;
            background-color: #4a9eff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          ">
            Reload Application
          </button>
        </div>
      `;
    }
  }
}

// Handle different initialization scenarios
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in RSS app:', event.reason);
  
  if (typeof TelemetryX !== 'undefined' && TelemetryX.logging) {
    TelemetryX.logging.error('Unhandled promise rejection', {
      reason: event.reason?.toString?.() || 'Unknown reason',
      stack: event.reason?.stack || 'No stack trace available',
    });
  }
});

// Handle global errors
window.addEventListener('error', (event) => {
  console.error('Global error in RSS app:', event.error);
  
  if (typeof TelemetryX !== 'undefined' && TelemetryX.logging) {
    TelemetryX.logging.error('Global error', {
      message: event.error?.message || event.message,
      stack: event.error?.stack || 'No stack trace available',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }
});

export default App;