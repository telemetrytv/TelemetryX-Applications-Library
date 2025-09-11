import { Bridge } from '@telemetryx/root-sdk/bridge';

/**
 * TelemetryX Bridge Stub Implementation
 * 
 * This creates a Bridge instance from @telemetryx/root-sdk with a comprehensive 
 * onMessage handler that provides mock responses for all SDK client messages.
 */
export class TelemetryXBridgeStub {
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
    this.bridge.onMessage = (m) => this.handleClientMessage(m);
    
    // Bind the bridge to start listening
    this.bridge.bind();
    
    console.log('[TelemetryXBridgeStub] Initialized and listening for client messages');
  }

  initializeSampleData() {
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
    this.stores.get('deviceLocal').set('location', {
      latitude: 37.7749,
      longitude: -122.4194,
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      timezone: 'America/Los_Angeles'
    });

    this.stores.get('deviceLocal').set('info', {
      id: 'dev-device-001',
      name: 'Development Device',
      display: {
        width: 1920,
        height: 1080,
        pixelRatio: 1
      },
      capabilities: ['network', 'location', 'audio', 'video'],
      version: '1.0.0-dev'
    });

    console.log('[TelemetryXBridgeStub] Sample data initialized');
  }

  handleClientMessage(message) {
    console.log('[TelemetryXBridgeStub] Received message:', {
      name: message.name,
      applicationName: message.applicationName,
      data: message.data,
      responseName: message.responseName,
      subscriptionName: message.subscriptionName,
      unsubscribeName: message.unsubscribeName,
    });

    // Route message to appropriate handler based on message name
    switch (message.name) {
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

  sendResponse(responseName, data) {
    const response = {
      name: responseName,
      data,
    };
    this.bridge.send(response);
  }

  // Store operation handlers
  handleStoreSet(message) {
    const { namespace, key, value } = message.data;
    
    // Ensure the namespace exists
    if (!this.stores.has(namespace)) {
      this.stores.set(namespace, new Map());
    }
    
    const store = this.stores.get(namespace);
    store.set(key, value);
    
    console.log(`[TelemetryXBridgeStub] Store set: ${namespace}.${key} =`, value);

    // Send success response
    if (message.responseName) {
      this.sendResponse(message.responseName, { success: true });
    }

    // Notify all active subscriptions for this key
    this.notifyStoreSubscribers(namespace, key, value);
  }

  handleStoreGet(message) {
    const { namespace, key } = message.data;
    
    const store = this.stores.get(namespace);
    const value = store?.get(key) ?? undefined;
    
    console.log(`[TelemetryXBridgeStub] Store get: ${namespace}.${key} =`, value);

    if (message.responseName) {
      this.sendResponse(message.responseName, { value });
    }
  }

  handleStoreDelete(message) {
    const { namespace, key } = message.data;
    
    const store = this.stores.get(namespace);
    const success = store?.delete(key) ?? false;
    
    console.log(`[TelemetryXBridgeStub] Store delete: ${namespace}.${key}, success:`, success);

    if (message.responseName) {
      this.sendResponse(message.responseName, { success });
    }

    // Notify subscribers that the value was deleted
    if (success) {
      this.notifyStoreSubscribers(namespace, key, undefined);
    }
  }

  handleStoreSubscribe(message) {
    const { namespace, key } = message.data;
    
    if (message.subscriptionName) {
      // Store the subscription
      this.subscriptions.set(message.subscriptionName, {
        namespace,
        key,
        applicationName: message.applicationName,
      });
      
      console.log(`[TelemetryXBridgeStub] Store subscribe: ${namespace}.${key}, subscription:`, message.subscriptionName);
    }

    // Send success response
    if (message.responseName) {
      this.sendResponse(message.responseName, { success: true });
    }

    // Send initial value to subscriber
    if (message.subscriptionName) {
      const store = this.stores.get(namespace);
      const value = store?.get(key) ?? undefined;
      this.sendResponse(message.subscriptionName, value);
    }
  }

  handleStoreUnsubscribe(message) {
    if (message.unsubscribeName) {
      const subscription = this.subscriptions.get(message.unsubscribeName);
      if (subscription) {
        this.subscriptions.delete(message.unsubscribeName);
        console.log(`[TelemetryXBridgeStub] Store unsubscribe: ${subscription.namespace}.${subscription.key}`);
      }
    }

    if (message.responseName) {
      this.sendResponse(message.responseName, { success: true });
    }
  }

  notifyStoreSubscribers(namespace, key, value) {
    // Notify all subscribers interested in this key
    this.subscriptions.forEach((subscription, subscriptionName) => {
      if (subscription.namespace === namespace && subscription.key === key) {
        console.log(`[TelemetryXBridgeStub] Notifying subscriber ${subscriptionName} of change to ${namespace}.${key}`);
        this.sendResponse(subscriptionName, value);
      }
    });
  }

  // Media operation handlers
  handleMediaQueryFolders(message) {
    const { query } = message.data;
    
    let results = [...this.mediaFolders];
    if (query) {
      results = results.filter(f => 
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.path.toLowerCase().includes(query.toLowerCase())
      );
    }

    console.log(`[TelemetryXBridgeStub] Media query folders: "${query}", found:`, results.length);

    if (message.responseName) {
      this.sendResponse(message.responseName, { folders: results });
    }
  }

  handleMediaGetFoldersByTag(message) {
    const { tag } = message.data;
    
    const results = this.mediaFolders.filter(f => 
      f.tags && f.tags.includes(tag)
    );

    console.log(`[TelemetryXBridgeStub] Media get folders by tag: "${tag}", found:`, results.length);

    if (message.responseName) {
      this.sendResponse(message.responseName, { folders: results });
    }
  }

  handleMediaGetFolderById(message) {
    const { id } = message.data;
    
    const folder = this.mediaFolders.find(f => f.id === id);

    console.log(`[TelemetryXBridgeStub] Media get folder by ID: "${id}", found:`, !!folder);

    if (message.responseName) {
      this.sendResponse(message.responseName, { folder: folder || null });
    }
  }

  handleMediaGetContentByFolderId(message) {
    const { folderId } = message.data;
    
    const content = this.mediaContent.filter(c => c.folderId === folderId);

    console.log(`[TelemetryXBridgeStub] Media get content by folder ID: "${folderId}", found:`, content.length);

    if (message.responseName) {
      this.sendResponse(message.responseName, { content });
    }
  }

  handleMediaGetContentById(message) {
    const { id } = message.data;
    
    const content = this.mediaContent.find(c => c.id === id);

    console.log(`[TelemetryXBridgeStub] Media get content by ID: "${id}", found:`, !!content);

    if (message.responseName) {
      this.sendResponse(message.responseName, { content: content || null });
    }
  }

  // Application operation handlers
  handleApplicationsGetByMountPoint(message) {
    const { mountPoint } = message.data;
    
    const apps = this.applications.filter(app => 
      app.mountPoints && app.mountPoints[mountPoint] !== undefined
    );

    console.log(`[TelemetryXBridgeStub] Applications get by mount point: "${mountPoint}", found:`, apps.length);

    if (message.responseName) {
      this.sendResponse(message.responseName, { applications: apps });
    }
  }

  handleApplicationsGetByName(message) {
    const { name } = message.data;
    
    const app = this.applications.find(a => a.name === name);

    console.log(`[TelemetryXBridgeStub] Applications get by name: "${name}", found:`, !!app);

    if (message.responseName) {
      this.sendResponse(message.responseName, { application: app || null });
    }
  }

  handleApplicationsGetUrl(message) {
    const { name, mountPoint } = message.data;
    
    const app = this.applications.find(a => a.name === name);
    let url = null;
    
    if (app && app.mountPoints && app.mountPoints[mountPoint]) {
      // Generate a mock URL that points to the local development app
      const appId = name.replace(/-app$/, ''); // Remove -app suffix if present
      url = `/apps/${appId}${app.mountPoints[mountPoint].path}?applicationId=stub-${Date.now()}`;
    }

    console.log(`[TelemetryXBridgeStub] Applications get URL: "${name}/${mountPoint}", URL:`, url);

    if (message.responseName) {
      this.sendResponse(message.responseName, { url });
    }
  }

  // User operation handlers
  handleUserGetCurrentUser(message) {
    console.log('[TelemetryXBridgeStub] User get current user');

    if (message.responseName) {
      this.sendResponse(message.responseName, { user: this.currentUser });
    }
  }

  handleUserGetCurrentAccount(message) {
    console.log('[TelemetryXBridgeStub] User get current account');

    if (message.responseName) {
      this.sendResponse(message.responseName, { account: this.currentAccount });
    }
  }

  // Environment operation handlers
  handleEnvironmentGetColorScheme(message) {
    console.log('[TelemetryXBridgeStub] Environment get color scheme:', this.colorScheme);

    if (message.responseName) {
      this.sendResponse(message.responseName, { colorScheme: this.colorScheme });
    }
  }

  // Public methods for testing and configuration
  setColorScheme(scheme) {
    this.colorScheme = scheme;
    console.log('[TelemetryXBridgeStub] Color scheme set to:', scheme);
    
    // Notify any subscribers of the color scheme change
    this.notifyStoreSubscribers('environment', 'colorScheme', scheme);
  }

  addMediaFolder(folder) {
    this.mediaFolders.push(folder);
    console.log('[TelemetryXBridgeStub] Added media folder:', folder.name);
  }

  addMediaContent(content) {
    this.mediaContent.push(content);
    console.log('[TelemetryXBridgeStub] Added media content:', content.name);
  }

  addApplication(app) {
    this.applications.push(app);
    console.log('[TelemetryXBridgeStub] Added application:', app.name);
  }

  setCurrentUser(user) {
    this.currentUser = user;
    console.log('[TelemetryXBridgeStub] Set current user:', user.name);
  }

  setCurrentAccount(account) {
    this.currentAccount = account;
    console.log('[TelemetryXBridgeStub] Set current account:', account.name);
  }

  getStore(namespace) {
    return this.stores.get(namespace);
  }

  clearStore(namespace) {
    if (namespace) {
      this.stores.get(namespace)?.clear();
      console.log(`[TelemetryXBridgeStub] Cleared store namespace: ${namespace}`);
    } else {
      this.stores.forEach(store => store.clear());
      console.log('[TelemetryXBridgeStub] Cleared all stores');
    }
  }

  getSubscriptions() {
    return new Map(this.subscriptions);
  }

  destroy() {
    this.bridge.unbind();
    this.subscriptions.clear();
    this.stores.clear();
    console.log('[TelemetryXBridgeStub] Bridge stub destroyed');
  }
}

// Export for use in applications
export default TelemetryXBridgeStub;