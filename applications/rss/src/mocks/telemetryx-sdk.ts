// Mock TelemetryX SDK for development
export const TelemetryX = {
  device: {
    getInfo: () => Promise.resolve({
      id: 'mock-device',
      name: 'Mock Device',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        country: 'USA'
      },
      display: {
        width: 1920,
        height: 1080,
        dpi: 96
      }
    })
  },
  
  data: {
    fetch: async (url: string, options?: any) => {
      // For development, we'll use a CORS proxy or return mock data
      console.log('Mock fetch:', url, options);
      
      // Return mock RSS data for testing
      if (url.includes('rss') || url.includes('feed')) {
        return {
          items: [
            {
              title: 'Sample News Item 1',
              description: 'This is a sample news description for testing the RSS app.',
              link: 'https://example.com/news1',
              pubDate: new Date().toISOString(),
              guid: 'mock-guid-1'
            },
            {
              title: 'Sample News Item 2', 
              description: 'Another sample news item with a longer description to test text wrapping and display.',
              link: 'https://example.com/news2',
              pubDate: new Date(Date.now() - 3600000).toISOString(),
              guid: 'mock-guid-2'
            }
          ],
          title: 'Mock RSS Feed',
          description: 'Mock RSS feed for development'
        };
      }
      
      // For OpenGraph fetching
      return {
        title: 'Mock Article Title',
        description: 'Mock article description',
        image: 'https://via.placeholder.com/1200x630',
        date: new Date().toISOString()
      };
    }
  },
  
  storage: {
    get: async (key: string, scope = 'app') => {
      const storageKey = `telemetryx_${scope}_${key}`;
      const value = localStorage.getItem(storageKey);
      return value ? JSON.parse(value) : null;
    },
    
    set: async (key: string, value: any, scope = 'app') => {
      const storageKey = `telemetryx_${scope}_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(value));
      return true;
    },
    
    delete: async (key: string, scope = 'app') => {
      const storageKey = `telemetryx_${scope}_${key}`;
      localStorage.removeItem(storageKey);
      return true;
    }
  },
  
  app: {
    getConfig: () => ({
      sourcefeed: 'https://feeds.npr.org/1001/rss.xml',
      appType: 'npr-feed',
      transitionInterval: 10,
      refreshInterval: 10,
      theme: 'default',
      hAlign: 'left',
      zoomEffect: true
    }),
    
    onConfigChange: (callback: (config: any) => void) => {
      // Mock config change listener
      window.addEventListener('telemetryx-config-change', (e: any) => {
        callback(e.detail);
      });
    }
  }
};

export default TelemetryX;