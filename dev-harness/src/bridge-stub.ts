import { Bridge } from '@telemetryx/root-sdk/bridge';

// Type definitions
interface MediaFolder {
  id: string;
  name: string;
  tags: string[];
  path: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaContent {
  id: string;
  folderId: string;
  name: string;
  type: string;
  publicUrl: string;
  thumbnailUrl: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface Application {
  name: string;
  displayName: string;
  description: string;
  version: string;
  mountPoints: {
    render?: { path: string };
    settings?: { path: string };
    admin?: { path: string };
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  createdAt: string;
}

interface Account {
  id: string;
  name: string;
  slug: string;
  plan: string;
  features: string[];
  createdAt: string;
}

interface BridgeMessage {
  name: string;
  data?: any;
  responseName?: string;
}

interface SubscriptionInfo {
  namespace: string;
  key: string;
  responseName: string;
}

/**
 * TelemetryX Bridge Stub Implementation
 * 
 * This creates a Bridge instance from @telemetryx/root-sdk with a comprehensive 
 * onMessage handler that provides mock responses for all SDK client messages.
 */
export class TelemetryXBridgeStub {
  private bridge: Bridge;
  private subscriptions: Map<string, SubscriptionInfo>;
  private stores: Map<string, Map<string, any>>;
  private mediaFolders: MediaFolder[];
  private mediaContent: MediaContent[];
  private applications: Application[];
  private currentUser: User | null;
  private currentAccount: Account | null;
  private colorScheme: 'light' | 'dark';

  constructor() {
    this.bridge = new Bridge();
    this.subscriptions = new Map();
    this.stores = new Map();
    this.mediaFolders = [];
    this.mediaContent = [];
    this.applications = [];
    this.currentUser = null;
    this.currentAccount = null;
    this.colorScheme = 'light';
    
    // Initialize sample data
    this.initializeSampleData();
    
    // Set up the onMessage handler
    this.bridge.onMessage = (m: BridgeMessage) => this.handleClientMessage(m);
    
    // Bind the bridge to start listening
    this.bridge.bind();
    
    console.log('[TelemetryXBridgeStub] Initialized and listening for client messages');
  }

  private initializeSampleData(): void {
    // Sample media folders
    this.mediaFolders = [
      {
        id: 'folder-1',
        name: 'Marketing Assets',
        tags: ['marketing', 'images'],
        path: '/media/marketing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'folder-2', 
        name: 'Videos',
        tags: ['videos', 'content'],
        path: '/media/videos',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'folder-3',
        name: 'Product Images',
        tags: ['products', 'images'],
        path: '/media/products',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Sample media content
    this.mediaContent = [
      {
        id: 'content-1',
        folderId: 'folder-1',
        name: 'Banner.jpg',
        type: 'image',
        publicUrl: 'https://example.com/media/banner.jpg',
        thumbnailUrl: 'https://example.com/media/banner-thumb.jpg',
        size: 1024000,
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
      },
      {
        id: 'content-2',
        folderId: 'folder-2',
        name: 'Promo.mp4',
        type: 'video',
        publicUrl: 'https://example.com/media/promo.mp4',
        thumbnailUrl: 'https://example.com/media/promo-thumb.jpg',
        size: 10240000,
        mimeType: 'video/mp4',
        duration: 30,
      },
      {
        id: 'content-3',
        folderId: 'folder-3',
        name: 'Product-1.png',
        type: 'image',
        publicUrl: 'https://example.com/media/product1.png',
        thumbnailUrl: 'https://example.com/media/product1-thumb.png',
        size: 512000,
        mimeType: 'image/png',
        width: 800,
        height: 600,
      },
    ];

    // Sample applications
    this.applications = [
      {
        name: 'weather-app',
        displayName: 'Weather Widget',
        description: 'Display weather information',
        version: '1.0.0',
        mountPoints: {
          render: { path: '/index.html' },
          settings: { path: '/settings.html' },
        },
      },
      {
        name: 'clock-app',
        displayName: 'Clock Display',
        description: 'Show current time',
        version: '2.1.0',
        mountPoints: {
          render: { path: '/index.html' },
        },
      },
      {
        name: 'news-feed',
        displayName: 'News Feed',
        description: 'Display latest news',
        version: '1.5.0',
        mountPoints: {
          render: { path: '/index.html' },
          settings: { path: '/settings.html' },
          admin: { path: '/admin.html' },
        },
      },
    ];

    // Sample user
    this.currentUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin',
      permissions: ['read', 'write', 'admin'],
      createdAt: new Date().toISOString(),
    };

    // Sample account
    this.currentAccount = {
      id: 'account-456',
      name: 'Test Organization',
      slug: 'test-org',
      plan: 'enterprise',
      features: ['unlimited-devices', 'api-access', 'custom-apps'],
      createdAt: new Date().toISOString(),
    };

    // Initialize store namespaces with proper scope names
    this.stores.set('global', new Map());
    this.stores.set('local', new Map());
    this.stores.set('deviceLocal', new Map());
    this.stores.set('shared', new Map());

    // Add some sample device data
    const deviceLocalStore = this.stores.get('deviceLocal');
    if (deviceLocalStore) {
      deviceLocalStore.set('location', {
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
      });
    }
  }

  private handleClientMessage(message: BridgeMessage): void {
    console.log('[TelemetryXBridgeStub] Received message:', message.name, message.data);

    switch (message.name) {
      // Device Info
      case 'device.getInfo':
        this.handleDeviceGetInfo(message);
        break;

      // Data operations
      case 'data.fetch':
        this.handleDataFetch(message);
        break;
      case 'data.subscribe':
        this.handleDataSubscribe(message);
        break;
      case 'data.unsubscribe':
        this.handleDataUnsubscribe(message);
        break;

      // Store operations
      case 'store.set':
        this.handleStoreSet(message);
        break;
      case 'store.get':
        this.handleStoreGet(message);
        break;
      case 'store.delete':
        this.handleStoreDelete(message);
        break;
      case 'store.subscribe':
        this.handleStoreSubscribe(message);
        break;
      case 'store.unsubscribe':
        this.handleStoreUnsubscribe(message);
        break;

      // Media operations
      case 'media.queryMediaFolders':
        this.handleMediaQueryFolders(message);
        break;
      case 'media.getMediaFoldersByTag':
        this.handleMediaGetFoldersByTag(message);
        break;
      case 'media.getMediaFolderById':
        this.handleMediaGetFolderById(message);
        break;
      case 'media.getMediaContentByFolderId':
        this.handleMediaGetContentByFolderId(message);
        break;
      case 'media.getMediaContentById':
        this.handleMediaGetContentById(message);
        break;

      // Application operations
      case 'applications.getByMountPoint':
        this.handleApplicationsGetByMountPoint(message);
        break;
      case 'applications.getByName':
        this.handleApplicationsGetByName(message);
        break;
      case 'applications.getUrl':
        this.handleApplicationsGetUrl(message);
        break;

      // User operations
      case 'user.getCurrentUser':
        this.handleUserGetCurrentUser(message);
        break;
      case 'user.getCurrentAccount':
        this.handleUserGetCurrentAccount(message);
        break;

      // Environment operations
      case 'environment.getColorScheme':
        this.handleEnvironmentGetColorScheme(message);
        break;

      default:
        console.warn('[TelemetryXBridgeStub] Unknown message type:', message.name);
        // Send error response if a response is expected
        if (message.responseName) {
          this.sendResponse(message.responseName, { 
            error: `Unknown message type: ${message.name}` 
          });
        }
    }
  }

  private sendResponse(responseName: string, data: any): void {
    const response = {
      name: responseName,
      data,
    };
    this.bridge.send(response);
  }

  // Store operation handlers
  private handleStoreSet(message: BridgeMessage): void {
    const { namespace, key, value } = message.data;
    
    // Ensure the namespace exists
    if (!this.stores.has(namespace)) {
      this.stores.set(namespace, new Map());
    }
    
    const store = this.stores.get(namespace);
    if (store) {
      store.set(key, value);
    }
    
    console.log(`[TelemetryXBridgeStub] Store set: ${namespace}.${key} =`, value);

    // Send success response
    if (message.responseName) {
      this.sendResponse(message.responseName, { success: true });
    }

    // Notify all active subscriptions for this key
    this.notifyStoreSubscribers(namespace, key, value);
  }

  private handleStoreGet(message: BridgeMessage): void {
    const { namespace, key } = message.data;
    const store = this.stores.get(namespace);
    const value = store ? store.get(key) : undefined;
    
    console.log(`[TelemetryXBridgeStub] Store get: ${namespace}.${key} =`, value);
    
    if (message.responseName) {
      this.sendResponse(message.responseName, { value });
    }
  }

  private handleStoreDelete(message: BridgeMessage): void {
    const { namespace, key } = message.data;
    const store = this.stores.get(namespace);
    
    if (store) {
      store.delete(key);
    }
    
    console.log(`[TelemetryXBridgeStub] Store delete: ${namespace}.${key}`);
    
    if (message.responseName) {
      this.sendResponse(message.responseName, { success: true });
    }
    
    // Notify subscribers that the key was deleted
    this.notifyStoreSubscribers(namespace, key, undefined);
  }

  private handleStoreSubscribe(message: BridgeMessage): void {
    const { namespace, key } = message.data;
    const subscriptionId = `${namespace}:${key}:${Date.now()}`;
    
    this.subscriptions.set(subscriptionId, {
      namespace,
      key,
      responseName: message.responseName || '',
    });
    
    console.log(`[TelemetryXBridgeStub] Store subscribe: ${namespace}.${key} (${subscriptionId})`);
    
    // Send initial value
    const store = this.stores.get(namespace);
    const value = store ? store.get(key) : undefined;
    
    if (message.responseName) {
      this.sendResponse(message.responseName, { 
        subscriptionId,
        value 
      });
    }
  }

  private handleStoreUnsubscribe(message: BridgeMessage): void {
    const { subscriptionId } = message.data;
    
    if (this.subscriptions.has(subscriptionId)) {
      this.subscriptions.delete(subscriptionId);
      console.log(`[TelemetryXBridgeStub] Store unsubscribe: ${subscriptionId}`);
    }
    
    if (message.responseName) {
      this.sendResponse(message.responseName, { success: true });
    }
  }

  private notifyStoreSubscribers(namespace: string, key: string, value: any): void {
    this.subscriptions.forEach((sub, id) => {
      if (sub.namespace === namespace && sub.key === key) {
        this.sendResponse(sub.responseName, {
          subscriptionId: id,
          value,
        });
      }
    });
  }

  // Device handlers
  private handleDeviceGetInfo(message: BridgeMessage): void {
    const deviceInfo = {
      id: 'dev-harness-001',
      name: 'Development Harness',
      type: 'browser',
      platform: (navigator as any).platform || 'Unknown',
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio,
      },
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
      },
      capabilities: {
        audio: true,
        video: true,
        touch: 'ontouchstart' in window,
        geolocation: 'geolocation' in navigator,
        notifications: 'Notification' in window,
      },
      isOnline: navigator.onLine,
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (message.responseName) {
      this.sendResponse(message.responseName, deviceInfo);
    }
  }

  // Data handlers
  private handleDataFetch(message: BridgeMessage): void {
    const { type, params } = message.data;
    
    let responseData: any = null;
    
    switch (type) {
      case 'weather':
        responseData = this.getMockWeatherData(params);
        break;
      case 'calendar':
        responseData = this.getMockCalendarData(params);
        break;
      case 'rss':
        responseData = this.getMockRSSData(params);
        break;
      case 'social':
        responseData = this.getMockSocialData(params);
        break;
      default:
        responseData = { error: `Unknown data type: ${type}` };
    }
    
    if (message.responseName) {
      this.sendResponse(message.responseName, responseData);
    }
  }

  private handleDataSubscribe(message: BridgeMessage): void {
    const { type, interval = 30000 } = message.data;
    const subscriptionId = `data:${type}:${Date.now()}`;
    
    console.log(`[TelemetryXBridgeStub] Data subscribe: ${type} (${subscriptionId})`);
    
    // Send initial data
    this.handleDataFetch(message);
    
    // Set up interval to send updates
    setInterval(() => {
      this.handleDataFetch({
        ...message,
        data: { ...message.data, subscriptionId }
      });
    }, interval);
    
    // Store interval ID for cleanup (in real implementation)
    // For now, just respond with subscription ID
    if (message.responseName) {
      this.sendResponse(message.responseName, { subscriptionId });
    }
  }

  private handleDataUnsubscribe(message: BridgeMessage): void {
    const { subscriptionId } = message.data;
    
    console.log(`[TelemetryXBridgeStub] Data unsubscribe: ${subscriptionId}`);
    
    // In real implementation, would clear the interval here
    
    if (message.responseName) {
      this.sendResponse(message.responseName, { success: true });
    }
  }

  // Media handlers
  private handleMediaQueryFolders(message: BridgeMessage): void {
    const { query = '' } = message.data || {};
    
    const results = this.mediaFolders.filter(folder => 
      !query || folder.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (message.responseName) {
      this.sendResponse(message.responseName, { folders: results });
    }
  }

  private handleMediaGetFoldersByTag(message: BridgeMessage): void {
    const { tag } = message.data;
    
    const results = this.mediaFolders.filter(folder => 
      folder.tags.includes(tag)
    );
    
    if (message.responseName) {
      this.sendResponse(message.responseName, { folders: results });
    }
  }

  private handleMediaGetFolderById(message: BridgeMessage): void {
    const { id } = message.data;
    
    const folder = this.mediaFolders.find(f => f.id === id);
    
    if (message.responseName) {
      this.sendResponse(message.responseName, folder || { error: 'Folder not found' });
    }
  }

  private handleMediaGetContentByFolderId(message: BridgeMessage): void {
    const { folderId } = message.data;
    
    const content = this.mediaContent.filter(c => c.folderId === folderId);
    
    if (message.responseName) {
      this.sendResponse(message.responseName, { content });
    }
  }

  private handleMediaGetContentById(message: BridgeMessage): void {
    const { id } = message.data;
    
    const content = this.mediaContent.find(c => c.id === id);
    
    if (message.responseName) {
      this.sendResponse(message.responseName, content || { error: 'Content not found' });
    }
  }

  // Application handlers
  private handleApplicationsGetByMountPoint(message: BridgeMessage): void {
    const { mountPoint } = message.data;
    
    const app = this.applications.find(a => 
      a.mountPoints[mountPoint as keyof typeof a.mountPoints]
    );
    
    if (message.responseName) {
      this.sendResponse(message.responseName, app || { error: 'Application not found' });
    }
  }

  private handleApplicationsGetByName(message: BridgeMessage): void {
    const { name } = message.data;
    
    const app = this.applications.find(a => a.name === name);
    
    if (message.responseName) {
      this.sendResponse(message.responseName, app || { error: 'Application not found' });
    }
  }

  private handleApplicationsGetUrl(message: BridgeMessage): void {
    const { name, mountPoint } = message.data;
    
    const app = this.applications.find(a => a.name === name);
    
    if (app && app.mountPoints[mountPoint as keyof typeof app.mountPoints]) {
      const mount = app.mountPoints[mountPoint as keyof typeof app.mountPoints];
      const url = `/apps/${name}${mount?.path}`;
      
      if (message.responseName) {
        this.sendResponse(message.responseName, { url });
      }
    } else {
      if (message.responseName) {
        this.sendResponse(message.responseName, { error: 'Application or mount point not found' });
      }
    }
  }

  // User handlers
  private handleUserGetCurrentUser(message: BridgeMessage): void {
    if (message.responseName) {
      this.sendResponse(message.responseName, this.currentUser);
    }
  }

  private handleUserGetCurrentAccount(message: BridgeMessage): void {
    if (message.responseName) {
      this.sendResponse(message.responseName, this.currentAccount);
    }
  }

  // Environment handlers
  private handleEnvironmentGetColorScheme(message: BridgeMessage): void {
    if (message.responseName) {
      this.sendResponse(message.responseName, { scheme: this.colorScheme });
    }
  }

  // Mock data generators
  private getMockWeatherData(_params: any): any {
    return {
      current: {
        temperature: 72,
        feelsLike: 75,
        humidity: 65,
        windSpeed: 12,
        windDirection: 'NW',
        condition: 'Partly Cloudy',
        icon: '⛅',
        uvIndex: 5,
        visibility: 10,
        pressure: 30.12,
      },
      forecast: [
        {
          date: new Date().toISOString(),
          high: 78,
          low: 62,
          condition: 'Sunny',
          icon: '☀️',
          precipitation: 0,
        },
        {
          date: new Date(Date.now() + 86400000).toISOString(),
          high: 75,
          low: 60,
          condition: 'Partly Cloudy',
          icon: '⛅',
          precipitation: 10,
        },
        {
          date: new Date(Date.now() + 172800000).toISOString(),
          high: 73,
          low: 58,
          condition: 'Rainy',
          icon: '🌧️',
          precipitation: 80,
        },
      ],
      alerts: [],
      location: {
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
      },
    };
  }

  private getMockCalendarData(_params: any): any {
    const now = new Date();
    return {
      events: [
        {
          id: 'event-1',
          title: 'Team Meeting',
          start: new Date(now.getTime() + 3600000).toISOString(),
          end: new Date(now.getTime() + 7200000).toISOString(),
          location: 'Conference Room A',
          description: 'Weekly team sync',
        },
        {
          id: 'event-2',
          title: 'Lunch Break',
          start: new Date(now.getTime() + 14400000).toISOString(),
          end: new Date(now.getTime() + 18000000).toISOString(),
          location: 'Cafeteria',
          description: 'Team lunch',
        },
        {
          id: 'event-3',
          title: 'Project Review',
          start: new Date(now.getTime() + 25200000).toISOString(),
          end: new Date(now.getTime() + 28800000).toISOString(),
          location: 'Virtual',
          description: 'Q4 project review',
        },
      ],
    };
  }

  private getMockRSSData(_params: any): any {
    return {
      feed: {
        title: 'Tech News',
        description: 'Latest technology news',
        link: 'https://example.com/news',
        lastBuildDate: new Date().toISOString(),
      },
      items: [
        {
          title: 'New Framework Released',
          description: 'A revolutionary new framework has been released...',
          link: 'https://example.com/news/1',
          pubDate: new Date().toISOString(),
          author: 'Tech Reporter',
          categories: ['Technology', 'Development'],
        },
        {
          title: 'AI Breakthrough Announced',
          description: 'Researchers announce major AI breakthrough...',
          link: 'https://example.com/news/2',
          pubDate: new Date(Date.now() - 3600000).toISOString(),
          author: 'Science Editor',
          categories: ['AI', 'Research'],
        },
        {
          title: 'Market Update',
          description: 'Tech stocks see significant movement...',
          link: 'https://example.com/news/3',
          pubDate: new Date(Date.now() - 7200000).toISOString(),
          author: 'Market Analyst',
          categories: ['Business', 'Markets'],
        },
      ],
    };
  }

  private getMockSocialData(_params: any): any {
    return {
      platform: 'twitter',
      posts: [
        {
          id: 'post-1',
          author: {
            name: 'TechGuru',
            handle: '@techguru',
            avatar: 'https://example.com/avatar1.jpg',
          },
          content: 'Excited about the new features in our latest release! 🚀',
          timestamp: new Date().toISOString(),
          likes: 42,
          retweets: 12,
          replies: 5,
        },
        {
          id: 'post-2',
          author: {
            name: 'DevNews',
            handle: '@devnews',
            avatar: 'https://example.com/avatar2.jpg',
          },
          content: 'Breaking: Major update to popular framework increases performance by 50%',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          likes: 128,
          retweets: 45,
          replies: 23,
        },
        {
          id: 'post-3',
          author: {
            name: 'CodeMaster',
            handle: '@codemaster',
            avatar: 'https://example.com/avatar3.jpg',
          },
          content: 'Pro tip: Always test your code in production... just kidding! 😅',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          likes: 256,
          retweets: 89,
          replies: 34,
        },
      ],
    };
  }
}

export default TelemetryXBridgeStub;