import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { TelemetryX } from '@telemetryx/sdk';
import { TelemetryX } from './mocks/telemetryx-sdk';
import { FeedItem } from './components/FeedItem';
import { 
  RSSItem, 
  RSSFeed, 
  AppConfiguration, 
  ItemSize,
  OpenGraphMetadata 
} from './types';
import {
  parseURLParameters,
  getOverrideSource,
  getValidItems,
  getItemKey,
  findLastPlayedIndex,
  cleanSourcefeedParam,
  calculateBaseFontSize,
  isPortraitLayout,
  isWideLayout,
  getOriginalLink,
  CONFIG
} from './utils/rss-parser';
import './styles/app.css';

interface AppProps {
  itemUrl?: string;
  pageDuration?: number;
}

const App: React.FC<AppProps> = ({ itemUrl = '', pageDuration = 0 }) => {
  // State management
  const [loading, setLoading] = useState(true);
  const [hasRendered, setHasRendered] = useState(false);
  const [destroyed, setDestroyed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resources, setResources] = useState<RSSItem[]>([]);
  const [lastPlayFeedID, setLastPlayFeedID] = useState<string | undefined>();
  const [showPrime, setShowPrime] = useState(false);
  const [primeItem, setPrimeItem] = useState<RSSItem | undefined>();
  const [baseItem, setBaseItem] = useState<RSSItem | undefined>();
  const [itemSize, setItemSize] = useState<ItemSize>({ w: 0, h: 0 });

  // Configuration state
  const [config, setConfig] = useState<AppConfiguration>({
    sourcefeed: '',
    playOnlyOne: false,
    transitionInterval: 10,
    refreshInterval: 10,
    zoomEffect: true,
    hAlign: 'left',
    theme: 'default',
  });

  // Refs for cleanup
  const intervalRefs = useRef<{
    getFeedInterval?: NodeJS.Timeout;
    prepareTimer?: NodeJS.Timeout;
    showNextTimer?: NodeJS.Timeout;
    singleItemTimer?: NodeJS.Timeout;
    errorTimer?: NodeJS.Timeout;
    debounceTimer?: NodeJS.Timeout;
  }>({});

  const resizeObserverRef = useRef<ResizeObserver>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Computed values
  const baseFontSize = calculateBaseFontSize(itemSize);
  const isPortrait = isPortraitLayout(itemSize);
  const isWide = isWideLayout(itemSize);
  const validItems = getValidItems(resources);
  const localKey = config.sourcefeed ? `rss-app_${config.sourcefeed}` : undefined;
  const useNoMixedTheme = config.theme === 'nomixed';

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    Object.values(intervalRefs.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    intervalRefs.current = {};
  }, []);

  // Fetch RSS feed
  const fetchRSSFeed = useCallback(async (feedUrl: string): Promise<RSSFeed> => {
    try {
      // Use TelemetryX data fetching capabilities
      const response = await TelemetryX.data.fetch(feedUrl, {
        timeout: CONFIG.FEED_TIMEOUT,
        cache: 'force-cache',
        maxAge: config.refreshInterval * 60000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      
      // Parse RSS/XML using DOMParser
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Invalid XML/RSS format');
      }

      // Extract feed data
      const channel = xmlDoc.querySelector('channel') || xmlDoc.querySelector('feed');
      if (!channel) {
        throw new Error('No RSS channel or Atom feed found');
      }

      // Parse items
      const items: RSSItem[] = [];
      const itemElements = xmlDoc.querySelectorAll('item, entry');
      
      itemElements.forEach(itemEl => {
        const title = itemEl.querySelector('title')?.textContent?.trim() || '';
        const description = itemEl.querySelector('description, summary, content')?.textContent?.trim() || '';
        const link = itemEl.querySelector('link')?.textContent?.trim() || 
                    itemEl.querySelector('link')?.getAttribute('href') || '';
        const guid = itemEl.querySelector('guid')?.textContent?.trim() || '';
        const pubDate = itemEl.querySelector('pubDate, published, updated')?.textContent?.trim() || '';

        if (title && (description || link)) {
          items.push({
            title,
            description,
            link,
            guid: guid || link,
            pubDate,
            publishedParsed: pubDate,
            published: pubDate,
          });
        }
      });

      return {
        title: channel.querySelector('title')?.textContent?.trim() || '',
        description: channel.querySelector('description, subtitle')?.textContent?.trim() || '',
        link: channel.querySelector('link')?.textContent?.trim() || '',
        items,
      };
    } catch (error) {
      console.error('RSS fetch error:', error);
      throw error;
    }
  }, [config.refreshInterval]);

  // Fetch OpenGraph metadata
  const fetchOpenGraphMetadata = useCallback(async (url: string): Promise<OpenGraphMetadata | null> => {
    try {
      const response = await TelemetryX.data.fetch(url, {
        timeout: CONFIG.OPENGRAPH_TIMEOUT,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const metadata: OpenGraphMetadata = {};
      
      // Extract OpenGraph meta tags
      const metaTags = doc.querySelectorAll('meta[property^="og:"], meta[name^="og:"]');
      metaTags.forEach(tag => {
        const property = tag.getAttribute('property') || tag.getAttribute('name') || '';
        const content = tag.getAttribute('content') || '';
        
        if (property.includes('title')) metadata.title = content;
        if (property.includes('description')) metadata.description = content;
        if (property.includes('image')) metadata.image = content;
        if (property.includes('url')) metadata.url = content;
      });

      // Fallback to standard meta tags
      if (!metadata.title) {
        metadata.title = doc.querySelector('title')?.textContent?.trim() || '';
      }
      
      if (!metadata.description) {
        const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
        metadata.description = desc?.trim() || '';
      }

      return Object.keys(metadata).length > 0 ? metadata : null;
    } catch (error) {
      console.error('OpenGraph fetch error:', error);
      return null;
    }
  }, []);

  // Fetch feed data
  const getFeed = useCallback(async (forceRefresh = false) => {
    if (!config.sourcefeed) return;

    try {
      const feedData = await fetchRSSFeed(config.sourcefeed);
      const items = feedData.items || [];

      if (!items.length && forceRefresh) {
        setResources([]);
        setErrorMessage('No valid feed found with this URL');
        setLoading(false);
        return;
      }

      setResources(items);
      
      // Cache feed data
      if (items.length && localKey) {
        await TelemetryX.storage.set(`${localKey}_items`, { items });
      }

      if (forceRefresh) {
        setErrorMessage('');
        prepareNext(true);
      }
    } catch (error) {
      await handleError(error, forceRefresh);
    }
  }, [config.sourcefeed, localKey, fetchRSSFeed]);

  // Error handler
  const handleError = useCallback(async (error: any, isForceRefresh: boolean) => {
    if (!isForceRefresh) return;

    // Try to use stale cached data
    if (localKey) {
      try {
        const staleData = await TelemetryX.storage.get(`${localKey}_items`);
        if (staleData?.items?.length) {
          setResources(staleData.items);
          setErrorMessage('');
          prepareNext(true);
          return;
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
      }
    }

    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    setErrorMessage(errorMessage);
    console.error('RSS Error:', errorMessage, { url: config.sourcefeed, error });
    setLoading(false);

    // Auto-advance after error
    clearTimeout(intervalRefs.current.errorTimer);
    intervalRefs.current.errorTimer = setTimeout(() => {
      console.log('Auto-advancing after RSS error');
    }, 5000);
  }, [localKey, config.sourcefeed]);

  // Prepare next item
  const prepareNext = useCallback(async (isUpdate = false) => {
    clearTimeout(intervalRefs.current.showNextTimer);
    
    if (!validItems.length) {
      setErrorMessage('No valid feed found with this URL');
      setLoading(false);
      return;
    }

    // Update last played item if needed
    if (isUpdate && localKey) {
      try {
        const lastPlayed = await TelemetryX.storage.get(`${localKey}_last-played`);
        setLastPlayFeedID(lastPlayed);
      } catch (error) {
        console.error('Storage get error:', error);
      }
    }

    // Find next item
    let currentIndex = -1;
    if (lastPlayFeedID) {
      currentIndex = findLastPlayedIndex(validItems, lastPlayFeedID);
    }

    const nextIndex = (currentIndex + 1) % validItems.length;
    const nextItem = { ...validItems[nextIndex] };

    // Fetch OpenGraph metadata if multiple items or first render
    if (validItems.length > 1 || !hasRendered) {
      try {
        const originalLink = getOriginalLink(nextItem);
        if (originalLink) {
          const metadata = await fetchOpenGraphMetadata(originalLink);
          if (metadata) {
            nextItem.opengraph = metadata;
          }
        }
      } catch (error) {
        console.error('Metadata fetch error:', error);
      }
    }

    // Set the appropriate item (prime/base switching)
    if (showPrime) {
      setBaseItem(nextItem);
    } else {
      setPrimeItem(nextItem);
    }

    setLoading(false);

    if (destroyed) return;

    // Handle first render or single item
    if (!hasRendered) {
      showNext();
    } else if (validItems.length > 1) {
      intervalRefs.current.showNextTimer = setTimeout(() => {
        showNext();
      }, CONFIG.PREPARE_TIME);
    } else if (validItems.length === 1) {
      triggerSingleItemFinished();
    }
  }, [validItems, lastPlayFeedID, localKey, hasRendered, showPrime, destroyed, fetchOpenGraphMetadata]);

  // Show next item
  const showNext = useCallback(() => {
    clearTimeout(intervalRefs.current.showNextTimer);

    // Store last played item
    const activeItem = showPrime ? baseItem : primeItem;
    if (activeItem && localKey) {
      const itemKey = getItemKey(activeItem);
      setLastPlayFeedID(itemKey);
      TelemetryX.storage.set(`${localKey}_last-played`, itemKey).catch(console.error);
    }

    // Toggle display
    setShowPrime(!showPrime);
    setHasRendered(true);

    if (!validItems.length) return;

    if (validItems.length === 1) {
      triggerSingleItemFinished();
      return;
    }

    // Check if reached end
    const activeIndex = lastPlayFeedID ? findLastPlayedIndex(validItems, lastPlayFeedID) : -1;
    if (validItems.length && activeIndex >= validItems.length - 1) {
      console.log('Reached end of feed items');
    }

    // Prepare next item
    if (!config.playOnlyOne || config.transitionInterval > 0) {
      const prepareDelay = Math.max(
        config.transitionInterval * 1000 - CONFIG.OPENGRAPH_TIMEOUT - CONFIG.PREPARE_TIME,
        CONFIG.OPENGRAPH_TIMEOUT + CONFIG.PREPARE_TIME + 1000
      );
      
      intervalRefs.current.prepareTimer = setTimeout(() => {
        prepareNext();
      }, prepareDelay);
    }
  }, [showPrime, baseItem, primeItem, localKey, validItems, lastPlayFeedID, config, prepareNext]);

  // Handle single item finished
  const triggerSingleItemFinished = useCallback(() => {
    clearTimeout(intervalRefs.current.singleItemTimer);
    intervalRefs.current.singleItemTimer = setTimeout(() => {
      console.log('Single item display finished');
    }, 60000);
  }, []);

  // Set feed update interval
  const setFeedInterval = useCallback(() => {
    clearInterval(intervalRefs.current.getFeedInterval);
    const updateInterval = config.refreshInterval * 60000 || CONFIG.UPDATE_INTERVAL;
    
    intervalRefs.current.getFeedInterval = setInterval(() => {
      getFeed();
    }, updateInterval);
  }, [config.refreshInterval, getFeed]);

  // Parse configuration from URL
  const parseConfiguration = useCallback((url: string) => {
    const options = parseURLParameters(url);
    
    let sourcefeed = decodeURIComponent(options.sourcefeed || '');
    sourcefeed = cleanSourcefeedParam(sourcefeed);
    
    const newConfig: AppConfiguration = {
      sourcefeed: getOverrideSource(sourcefeed, options.appType),
      appType: options.appType,
      playOnlyOne: options.playOnlyOne === 'true',
      transitionInterval: Math.max(4, parseInt(options.transitionInterval || '10', 10)),
      refreshInterval: Math.max(1, parseInt(options.refreshInterval || '10', 10)),
      zoomEffect: options.zoomEffect !== 'false',
      hAlign: (options.hAlign as 'left' | 'center' | 'right') || 'left',
      theme: (options.theme as 'default' | 'nomixed') || 'default',
    };

    // Adjust interval for single play mode
    if (newConfig.playOnlyOne) {
      newConfig.transitionInterval = pageDuration || newConfig.transitionInterval;
    }

    setConfig(newConfig);
  }, [pageDuration]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.offsetWidth || container.clientWidth;
    const height = container.offsetHeight || container.clientHeight;
    
    if (width && height) {
      setItemSize({ w: width, h: height });
    }
  }, []);

  // Debounced resize handler
  const debounceResize = useCallback(() => {
    clearTimeout(intervalRefs.current.debounceTimer);
    intervalRefs.current.debounceTimer = setTimeout(handleResize, 200);
  }, [handleResize]);

  // Initialize component
  useEffect(() => {
    setDestroyed(false);
    setHasRendered(false);
    
    // Load last played item from storage
    if (localKey) {
      TelemetryX.storage.get(`${localKey}_last-played`)
        .then(setLastPlayFeedID)
        .catch(console.error);
    }

    // Parse configuration and start
    if (itemUrl) {
      parseConfiguration(itemUrl);
    }
  }, [itemUrl, localKey, parseConfiguration]);

  // Handle configuration changes
  useEffect(() => {
    if (config.sourcefeed) {
      setHasRendered(false);
      getFeed(true);
      setFeedInterval();
    }
  }, [config.sourcefeed, getFeed, setFeedInterval]);

  // Setup resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(debounceResize);
    resizeObserver.observe(containerRef.current);
    resizeObserverRef.current = resizeObserver;

    // Initial size check
    debounceResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [debounceResize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setDestroyed(true);
      clearAllTimers();
      resizeObserverRef.current?.disconnect();
    };
  }, [clearAllTimers]);

  // Render
  const containerClasses = [
    'rss-page',
    isPortrait ? 'is-portrait' : 'landscape',
    isWide ? 'is-wide' : '',
    useNoMixedTheme ? 'theme-nomixed' : '',
  ].filter(Boolean).join(' ');

  const fontSizeStyle: React.CSSProperties = baseFontSize ? {
    fontSize: `${baseFontSize}px`
  } : {};

  return (
    <section className={containerClasses} style={fontSizeStyle} ref={containerRef}>
      <div className="resize-sensor" />

      {/* Error Message */}
      {!loading && errorMessage && (
        <div className="error-message fade-in">
          <p>RSS Error: {errorMessage}</p>
          <p className="url">{config.sourcefeed}</p>
        </div>
      )}

      {/* Feed Content */}
      {!errorMessage && (
        <>
          {/* Feed Image Layer */}
          <div className={`feed-image-layer ${loading ? 'uninitialized' : ''}`}>
            {primeItem && (
              <FeedItem
                item={primeItem}
                isVisible={showPrime}
                baseFontSize={baseFontSize}
                isPortrait={isPortrait}
                isWide={isWide}
                theme={config.theme}
                hAlign={config.hAlign}
                zoomEffect={config.zoomEffect}
                interval={config.transitionInterval}
              />
            )}
            {baseItem && (
              <FeedItem
                item={baseItem}
                isVisible={!showPrime}
                baseFontSize={baseFontSize}
                isPortrait={isPortrait}
                isWide={isWide}
                theme={config.theme}
                hAlign={config.hAlign}
                zoomEffect={config.zoomEffect}
                interval={config.transitionInterval}
              />
            )}
          </div>

          {/* Feed Context Layer */}
          <div className={`feed-context-layer app-context-block ${
            useNoMixedTheme ? 'hide-box-outline' : 'show-text-shadow'
          } ${!baseFontSize || loading ? 'uninitialized' : ''}`}>
            <div className="main-section app-context-section primary">
              {/* Content is rendered by FeedItem components */}
            </div>

            <div className="secondary-section app-context-section secondary">
              {/* Meta info is rendered by FeedItem components */}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default App;