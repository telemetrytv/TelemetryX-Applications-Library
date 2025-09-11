import TelemetryXBridgeStub from './bridge-stub';

// Initialize the bridge stub globally
(window as any).bridgeStub = new TelemetryXBridgeStub();
console.log('🚀 TelemetryX Bridge Stub initialized');

// Make it available for debugging
(window as any).TelemetryXBridgeStub = TelemetryXBridgeStub;

// Application state
let currentAppUrl: string | null = null;

// DOM elements
const appUrlInput = document.getElementById('app-url') as HTMLInputElement;
const loadBtn = document.getElementById('load-btn') as HTMLButtonElement;
const reloadBtn = document.getElementById('reload-btn') as HTMLButtonElement;
const renderIframe = document.getElementById('render-iframe') as HTMLIFrameElement;
const settingsIframe = document.getElementById('settings-iframe') as HTMLIFrameElement;
const loadingOverlay = document.getElementById('loading-overlay') as HTMLDivElement;
const errorMessage = document.getElementById('error-message') as HTMLDivElement;
const errorText = document.getElementById('error-text') as HTMLParagraphElement;
const placeholder = document.getElementById('placeholder') as HTMLDivElement;
const settingsPlaceholder = document.getElementById('settings-placeholder') as HTMLDivElement;
const statusIndicator = document.getElementById('status-indicator') as HTMLDivElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;

// WebSocket for hot reload
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('Connected to development server');
  updateStatus('Connected', 'success');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'reload' && currentAppUrl) {
    console.log('Reloading due to file change:', message.path);
    reloadApp();
  }
};

ws.onerror = () => {
  updateStatus('Connection error', 'error');
};

ws.onclose = () => {
  updateStatus('Disconnected', 'error');
};

// Normalize URL to ensure it's absolute
function normalizeUrl(url: string): string | null {
  if (!url) return null;
  
  // If it starts with http:// or https://, it's already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it starts with /, make it relative to current origin
  if (url.startsWith('/')) {
    return window.location.origin + url;
  }
  
  // Otherwise, assume it's a relative path from current location
  return new URL(url, window.location.href).href;
}

// Derive settings URL from render URL
function deriveSettingsUrl(renderUrl: string): string {
  try {
    const url = new URL(renderUrl);
    
    // If it's pointing to index.html, try settings.html in same directory
    if (url.pathname.endsWith('/index.html')) {
      return renderUrl.replace('/index.html', '/settings.html');
    }
    
    // If it's a directory path, append settings.html
    if (url.pathname.endsWith('/')) {
      return renderUrl + 'settings.html';
    }
    
    // Otherwise, append /settings.html to the base path
    return url.origin + url.pathname + '/settings.html';
  } catch (e) {
    // If URL parsing fails, try simple string replacement
    if (renderUrl.includes('/index.html')) {
      return renderUrl.replace('/index.html', '/settings.html');
    }
    return renderUrl + '/settings.html';
  }
}

// Load application from URL
function loadApp() {
  const urlInput = appUrlInput.value.trim();
  
  if (!urlInput) {
    showError('Please enter an application URL');
    return;
  }
  
  const appUrl = normalizeUrl(urlInput);
  if (!appUrl) {
    showError('Invalid URL format');
    return;
  }
  
  // Save URL to local storage
  localStorage.setItem('telemetryx-dev-harness-url', urlInput);
  
  currentAppUrl = appUrl;
  placeholder.style.display = 'none';
  settingsPlaceholder.style.display = 'none';
  errorMessage.style.display = 'none';
  loadingOverlay.style.display = 'flex';
  
  let renderLoaded = false;
  let settingsLoaded = false;
  
  function checkBothLoaded() {
    if (renderLoaded && settingsLoaded) {
      loadingOverlay.style.display = 'none';
      updateStatus(`Loaded: ${urlInput}`, 'success');
    }
  }
  
  // Load the render iframe
  renderIframe.src = appUrl;
  renderIframe.style.display = 'block';
  
  renderIframe.onload = () => {
    renderLoaded = true;
    checkBothLoaded();
    console.log('🔗 Bridge stub ready for render iframe communication');
  };
  
  renderIframe.onerror = () => {
    loadingOverlay.style.display = 'none';
    showError(`Failed to load render view from: ${appUrl}`);
  };
  
  // Try to load settings (optional, don't block if it fails)
  const settingsUrl = deriveSettingsUrl(appUrl);
  settingsIframe.src = settingsUrl;
  settingsIframe.style.display = 'block';
  
  settingsIframe.onload = () => {
    settingsLoaded = true;
    checkBothLoaded();
    console.log('📝 Settings iframe loaded');
  };
  
  settingsIframe.onerror = () => {
    console.warn(`Settings not available at ${settingsUrl}`);
    settingsLoaded = true; // Don't block loading if settings fail
    checkBothLoaded();
  };
  
  // Also handle the case where settings iframe doesn't trigger load/error
  setTimeout(() => {
    if (!settingsLoaded) {
      console.warn('Settings load timeout, continuing without settings');
      settingsLoaded = true;
      checkBothLoaded();
    }
  }, 3000);
}

// Reload current application
function reloadApp() {
  if (!currentAppUrl) return;
  
  loadingOverlay.style.display = 'flex';
  renderIframe.src = '';
  settingsIframe.src = '';
  
  setTimeout(() => {
    if (currentAppUrl) {
      renderIframe.src = currentAppUrl;
      const settingsUrl = deriveSettingsUrl(currentAppUrl);
      settingsIframe.src = settingsUrl;
    }
    
    loadingOverlay.style.display = 'none';
  }, 100);
}

// Show error message
function showError(message: string) {
  errorText.textContent = message;
  errorMessage.style.display = 'block';
  renderIframe.style.display = 'none';
  settingsIframe.style.display = 'none';
  loadingOverlay.style.display = 'none';
  updateStatus('Error', 'error');
}

// Update status
function updateStatus(text: string, type: 'success' | 'error' | 'loading') {
  statusText.textContent = text;
  statusIndicator.className = 'status-indicator';
  
  if (type === 'error') {
    statusIndicator.classList.add('error');
  } else if (type === 'loading') {
    statusIndicator.classList.add('loading');
  }
}

// Event listeners
loadBtn.addEventListener('click', loadApp);
reloadBtn.addEventListener('click', reloadApp);

// Allow Enter key to load app
appUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    loadApp();
  }
});

// Clear local storage when input is manually cleared
appUrlInput.addEventListener('input', (e) => {
  const value = (e.target as HTMLInputElement).value.trim();
  if (!value) {
    // User cleared the input, remove from storage
    localStorage.removeItem('telemetryx-dev-harness-url');
  }
});

// Restore URL from local storage on page load and auto-load
const savedUrl = localStorage.getItem('telemetryx-dev-harness-url');
if (savedUrl) {
  appUrlInput.value = savedUrl;
  // Auto-load the saved URL
  loadApp();
} else {
  // Initialize
  updateStatus('Ready', 'success');
}