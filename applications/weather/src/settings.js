import { configure, store } from '@telemetryx/sdk';

// Initialize SDK
configure('weather');

// Get form elements
const form = document.getElementById('settingsForm');
const status = document.getElementById('status');

// Default configuration matching legacy settings
const DEFAULT_CONFIG = {
  locations: [],
  locationDisplayNames: [],
  useDeviceLocation: false,
  theme: 'default',
  temperatureUnit: 'auto',
  show24hr: false,
  useMDYFormat: false,
  showHourlyForecast: false,
  showDailyForecast: false,
  interval: 10,
  refreshInterval: 3600,
  fontScale: 1.0,
  titleFontScale: 1.0,
  transition: '',
  whiteText: false,
  showTextShadow: false,
  hideBox: false,
  hideBoxOutline: false
};

// Load current settings when page loads
async function loadCurrentSettings() {
  try {
    const config = await store().local.get('weatherConfig') || DEFAULT_CONFIG;
    
    // Populate form with current settings
    document.getElementById('locationsInput').value = config.locations.join('|');
    document.getElementById('locationDisplayNames').value = (config.locationDisplayNames || []).join('|');
    document.getElementById('useDeviceLocation').checked = config.useDeviceLocation;
    document.getElementById('theme').value = config.theme;
    document.getElementById('temperatureUnit').value = config.temperatureUnit;
    document.getElementById('show24hr').checked = config.show24hr;
    document.getElementById('useMDYFormat').checked = config.useMDYFormat;
    document.getElementById('showHourlyForecast').checked = config.showHourlyForecast;
    document.getElementById('showDailyForecast').checked = config.showDailyForecast;
    document.getElementById('interval').value = config.interval;
    document.getElementById('refreshInterval').value = config.refreshInterval;
    document.getElementById('fontScale').value = config.fontScale;
    document.getElementById('titleFontScale').value = config.titleFontScale;
    document.getElementById('transition').value = config.transition;
    document.getElementById('whiteText').checked = config.whiteText;
    document.getElementById('showTextShadow').checked = config.showTextShadow;
    document.getElementById('hideBox').checked = config.hideBox;
    document.getElementById('hideBoxOutline').checked = config.hideBoxOutline;
    
  } catch (error) {
    console.error('Failed to load current settings:', error);
    showStatus('Failed to load settings. Using defaults.', 'error');
  }
}

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    // Build configuration object from form data
    const config = {
      locations: document.getElementById('locationsInput').value
        .split('|')
        .map(loc => loc.trim())
        .filter(loc => loc.length > 0),
      locationDisplayNames: document.getElementById('locationDisplayNames').value
        .split('|')
        .map(name => name.trim())
        .filter(name => name.length > 0),
      useDeviceLocation: document.getElementById('useDeviceLocation').checked,
      theme: document.getElementById('theme').value,
      temperatureUnit: document.getElementById('temperatureUnit').value,
      show24hr: document.getElementById('show24hr').checked,
      useMDYFormat: document.getElementById('useMDYFormat').checked,
      showHourlyForecast: document.getElementById('showHourlyForecast').checked,
      showDailyForecast: document.getElementById('showDailyForecast').checked,
      interval: parseInt(document.getElementById('interval').value),
      refreshInterval: parseInt(document.getElementById('refreshInterval').value),
      fontScale: parseFloat(document.getElementById('fontScale').value),
      titleFontScale: parseFloat(document.getElementById('titleFontScale').value),
      transition: document.getElementById('transition').value,
      whiteText: document.getElementById('whiteText').checked,
      showTextShadow: document.getElementById('showTextShadow').checked,
      hideBox: document.getElementById('hideBox').checked,
      hideBoxOutline: document.getElementById('hideBoxOutline').checked
    };
    
    // Validate configuration
    if (!config.useDeviceLocation && config.locations.length === 0) {
      showStatus('Please enter at least one location or enable device location', 'error');
      return;
    }
    
    if (config.interval < 4) {
      showStatus('Location rotation interval must be at least 4 seconds', 'error');
      return;
    }
    
    if (config.refreshInterval < 300) {
      showStatus('Refresh interval must be at least 5 minutes (300 seconds)', 'error');
      return;
    }
    
    // Save configuration to storage
    await store().local.set('weatherConfig', config);
    
    showStatus('Settings saved successfully!', 'success');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      hideStatus();
    }, 3000);
    
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus(`Failed to save: ${error.message}`, 'error');
  }
});

// Handle device location toggle
document.getElementById('useDeviceLocation').addEventListener('change', (e) => {
  const locationsSection = document.getElementById('locationsSection');
  if (e.target.checked) {
    locationsSection.style.opacity = '0.5';
    locationsSection.style.pointerEvents = 'none';
  } else {
    locationsSection.style.opacity = '1';
    locationsSection.style.pointerEvents = 'auto';
  }
});

// Show status message
function showStatus(message, type) {
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
}

// Hide status message
function hideStatus() {
  status.style.display = 'none';
  status.textContent = '';
  status.className = 'status';
}

// Add location helper
function addLocationExample() {
  const input = document.getElementById('locationsInput');
  const examples = ['New York, NY', 'London, UK', 'Tokyo, JP', 'Sydney, AU'];
  const randomExample = examples[Math.floor(Math.random() * examples.length)];
  
  const currentValue = input.value.trim();
  if (currentValue) {
    input.value = currentValue + '|' + randomExample;
  } else {
    input.value = randomExample;
  }
}

// Make helper function available globally
window.addLocationExample = addLocationExample;

// Load settings when page loads
loadCurrentSettings();