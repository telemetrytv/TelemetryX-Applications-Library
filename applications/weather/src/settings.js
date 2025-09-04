import { configure, store } from '@telemetryx/sdk';

// Initialize SDK
configure('weather');

const form = document.getElementById('settingsForm');
const input = document.getElementById('cityInput');
const status = document.getElementById('status');

// Load current city when settings page loads
async function loadCurrentSettings() {
  try {
    const currentCity = await store().local.get('selectedCity');
    if (currentCity) {
      input.value = currentCity;
    }
  } catch (error) {
    console.error('Failed to load current settings:', error);
  }
}

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const city = input.value.trim();
  if (!city) {
    showStatus('Please enter a city name', 'error');
    return;
  }
  
  try {
    // Save city to local storage (synced across devices for this app instance)
    await store().local.set('selectedCity', city);
    
    showStatus('City saved successfully!', 'success');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      hideStatus();
    }, 3000);
    
  } catch (error) {
    console.error('Failed to save city:', error);
    showStatus(`Failed to save: ${error.message}`, 'error');
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

// Load settings when page loads
loadCurrentSettings();