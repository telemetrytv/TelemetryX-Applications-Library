/**
 * TelemetryX Development Harness
 * 
 * This module sets up a mock TelemetryX environment for development and testing.
 * It provides:
 * - Mock SDK APIs for applications running in iframes
 * - Mock data injection system
 * - Communication bridge between harness and iframe apps
 */

class TelemetryXHarness {
  constructor() {
    this.iframe = null;
    this.mockData = new Map();
    this.subscriptions = new Map();
    this.messageQueue = [];
    this.connected = false;
    
    // Initialize mock data
    this.initializeMockData();
    
    // Set up message listener for iframe communication
    window.addEventListener('message', this.handleIframeMessage.bind(this));
  }

  /**
   * Initialize mock data for testing applications
   */
  initializeMockData() {
    // Mock device information
    this.mockData.set('device.info', {
      id: 'dev-device-001',
      name: 'Development Device',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        timezone: 'America/Los_Angeles'
      },
      display: {
        width: 1920,
        height: 1080,
        pixelRatio: 1
      },
      capabilities: ['network', 'location', 'audio', 'video'],
      version: '1.0.0-dev'
    });

    // Mock weather data
    this.mockData.set('weather', {
      current: {
        temperature: 22,
        humidity: 65,
        windSpeed: 12,
        windDirection: 'NW',
        description: 'Partly cloudy',
        icon: 'partly-cloudy-day',
        feelsLike: 24,
        visibility: 16,
        uvIndex: 3,
        pressure: 1013
      },
      forecast: [
        {
          date: '2025-01-15',
          high: 25,
          low: 18,
          description: 'Sunny',
          icon: 'clear-day',
          precipitation: 0
        },
        {
          date: '2025-01-16',
          high: 23,
          low: 16,
          description: 'Cloudy',
          icon: 'cloudy',
          precipitation: 20
        },
        {
          date: '2025-01-17',
          high: 19,
          low: 12,
          description: 'Rain',
          icon: 'rain',
          precipitation: 80
        }
      ],
      alerts: [],
      location: 'San Francisco, CA',
      lastUpdated: new Date().toISOString()
    });

    // Mock RSS feed data
    this.mockData.set('rss', {
      feeds: [
        {
          title: 'TechCrunch',
          url: 'https://techcrunch.com/feed/',
          items: [
            {
              title: 'Latest Tech News',
              description: 'Breaking developments in technology...',
              link: 'https://techcrunch.com/article1',
              pubDate: new Date(Date.now() - 3600000).toISOString()
            }
          ]
        }
      ]
    });

    // Mock social media data
    this.mockData.set('social-media', {
      platforms: {
        twitter: {
          posts: [
            {
              id: '1',
              text: 'Welcome to TelemetryX development!',
              author: '@telemetryx',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              likes: 42,
              retweets: 12
            }
          ]
        }
      }
    });

    // Mock calendar data
    this.mockData.set('calendar', {
      events: [
        {
          id: '1',
          title: 'Team Meeting',
          start: new Date(Date.now() + 3600000).toISOString(),
          end: new Date(Date.now() + 7200000).toISOString(),
          location: 'Conference Room A',
          description: 'Weekly team sync'
        },
        {
          id: '2',
          title: 'Product Demo',
          start: new Date(Date.now() + 86400000).toISOString(),
          end: new Date(Date.now() + 90000000).toISOString(),
          location: 'Main Hall',
          description: 'Quarterly product demonstration'
        }
      ],
      timezone: 'America/Los_Angeles'
    });

    console.log('✅ Mock data initialized for development harness');
  }

  /**
   * Set the iframe reference for communication
   */
  setIframe(iframe) {
    this.iframe = iframe;
    this.connected = false;
    
    // Wait for iframe to load and then establish connection
    iframe.onload = () => {
      setTimeout(() => {
        this.establishConnection();
      }, 500); // Give iframe time to initialize
    };
  }

  /**
   * Establish connection with the iframe application
   */
  establishConnection() {
    if (!this.iframe || !this.iframe.contentWindow) {
      console.warn('No iframe available for connection');
      return;
    }

    console.log('🔗 Establishing connection with iframe application...');

    // Send initialization message
    this.postToIframe({
      type: 'telemetryx.init',
      payload: {
        environment: 'development',
        harness: true,
        deviceInfo: this.mockData.get('device.info')
      }
    });

    // Process any queued messages
    this.processMessageQueue();
    this.connected = true;
  }

  /**
   * Handle messages from iframe applications
   */
  handleIframeMessage(event) {
    // Verify origin for security (in development, allow localhost)
    if (!event.origin.includes('localhost') && !event.origin.includes('127.0.0.1')) {
      return;
    }

    const message = event.data;
    if (!message || typeof message !== 'object') {
      return;
    }

    console.log('📨 Received message from iframe:', message);

    try {
      this.processMessage(message);
    } catch (error) {
      console.error('Error processing iframe message:', error);
      this.sendError(message.id, error.message);
    }
  }

  /**
   * Process a message from the iframe application
   */
  processMessage(message) {
    const { type, payload, id } = message;

    switch (type) {
      case 'telemetryx.ready':
        console.log('✅ Iframe application is ready');
        this.connected = true;
        this.sendResponse(id, { status: 'connected' });
        break;

      case 'telemetryx.data.get':
        this.handleDataGet(payload, id);
        break;

      case 'telemetryx.data.set':
        this.handleDataSet(payload, id);
        break;

      case 'telemetryx.data.subscribe':
        this.handleDataSubscribe(payload, id);
        break;

      case 'telemetryx.device.getInfo':
        this.sendResponse(id, this.mockData.get('device.info'));
        break;

      case 'telemetryx.storage.get':
        this.handleStorageGet(payload, id);
        break;

      case 'telemetryx.storage.set':
        this.handleStorageSet(payload, id);
        break;

      default:
        console.warn('Unknown message type:', type);
        this.sendError(id, `Unknown message type: ${type}`);
    }
  }

  /**
   * Handle data get requests
   */
  handleDataGet(payload, messageId) {
    const { key, options = {} } = payload;
    
    console.log(`🔍 Data request for key: ${key}`);
    
    let data = this.mockData.get(key);
    
    // If no exact match, try partial matches for nested keys
    if (!data && key.includes('.')) {
      const baseKey = key.split('.')[0];
      const fullData = this.mockData.get(baseKey);
      
      if (fullData) {
        // Navigate through the object using the key path
        const keyPath = key.split('.').slice(1);
        data = keyPath.reduce((obj, path) => obj && obj[path], fullData);
      }
    }

    // Apply options like filters, sorting, etc.
    if (data && options.filter) {
      // Simple filter implementation
      if (Array.isArray(data)) {
        data = data.filter(item => 
          Object.entries(options.filter).every(([filterKey, filterValue]) =>
            item[filterKey] === filterValue
          )
        );
      }
    }

    this.sendResponse(messageId, data || null);
  }

  /**
   * Handle data set requests (for mocking purposes)
   */
  handleDataSet(payload, messageId) {
    const { key, value } = payload;
    
    console.log(`💾 Setting data for key: ${key}`, value);
    this.mockData.set(key, value);
    
    // Notify any subscribers
    this.notifySubscribers(key, value);
    
    this.sendResponse(messageId, { success: true });
  }

  /**
   * Handle data subscription requests
   */
  handleDataSubscribe(payload, messageId) {
    const { key, options = {} } = payload;
    
    console.log(`🔔 Subscribing to key: ${key}`);
    
    // Store subscription
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key).add(messageId);
    
    // Send initial data
    const initialData = this.mockData.get(key);
    this.sendResponse(messageId, initialData);
    
    // Set up periodic updates for demo purposes
    if (key === 'weather') {
      this.setupWeatherUpdates(key);
    }
    
    // Return subscription confirmation
    return { subscribed: true, key };
  }

  /**
   * Set up periodic weather updates for demo
   */
  setupWeatherUpdates(key) {
    if (this.weatherUpdateInterval) return; // Already set up
    
    this.weatherUpdateInterval = setInterval(() => {
      const weatherData = this.mockData.get('weather');
      if (weatherData) {
        // Simulate small temperature changes
        const tempVariation = (Math.random() - 0.5) * 2; // ±1°C
        weatherData.current.temperature += tempVariation;
        weatherData.current.temperature = Math.round(weatherData.current.temperature);
        weatherData.lastUpdated = new Date().toISOString();
        
        this.mockData.set('weather', weatherData);
        this.notifySubscribers(key, weatherData);
      }
    }, 30000); // Update every 30 seconds
  }

  /**
   * Handle storage get requests
   */
  handleStorageGet(payload, messageId) {
    const { key, scope = 'application' } = payload;
    const storageKey = `${scope}.${key}`;
    
    const value = localStorage.getItem(storageKey);
    this.sendResponse(messageId, value ? JSON.parse(value) : null);
  }

  /**
   * Handle storage set requests
   */
  handleStorageSet(payload, messageId) {
    const { key, value, scope = 'application' } = payload;
    const storageKey = `${scope}.${key}`;
    
    localStorage.setItem(storageKey, JSON.stringify(value));
    this.sendResponse(messageId, { success: true });
  }

  /**
   * Notify subscribers of data changes
   */
  notifySubscribers(key, data) {
    const subscribers = this.subscriptions.get(key);
    if (subscribers) {
      subscribers.forEach(messageId => {
        this.postToIframe({
          type: 'telemetryx.data.update',
          payload: { key, data },
          subscriptionId: messageId
        });
      });
    }
  }

  /**
   * Send a response to the iframe
   */
  sendResponse(messageId, data) {
    this.postToIframe({
      type: 'telemetryx.response',
      payload: data,
      id: messageId
    });
  }

  /**
   * Send an error response to the iframe
   */
  sendError(messageId, errorMessage) {
    this.postToIframe({
      type: 'telemetryx.error',
      payload: { error: errorMessage },
      id: messageId
    });
  }

  /**
   * Post a message to the iframe
   */
  postToIframe(message) {
    if (!this.iframe || !this.iframe.contentWindow) {
      console.warn('Cannot send message: iframe not available');
      this.messageQueue.push(message);
      return;
    }

    console.log('📤 Sending message to iframe:', message);
    this.iframe.contentWindow.postMessage(message, '*');
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.postToIframe(message);
    }
  }

  /**
   * Update mock data (for testing different scenarios)
   */
  updateMockData(key, data) {
    console.log(`🔄 Updating mock data for ${key}`);
    this.mockData.set(key, data);
    this.notifySubscribers(key, data);
  }

  /**
   * Get current mock data (for debugging)
   */
  getMockData(key) {
    return this.mockData.get(key);
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.weatherUpdateInterval) {
      clearInterval(this.weatherUpdateInterval);
      this.weatherUpdateInterval = null;
    }
    this.subscriptions.clear();
    this.messageQueue = [];
    this.connected = false;
  }
}

// Global harness instance
window.telemetryxHarness = new TelemetryXHarness();

console.log('🚀 TelemetryX Development Harness initialized');