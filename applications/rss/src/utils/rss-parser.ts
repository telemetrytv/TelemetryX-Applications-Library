import { RSSFeed, RSSItem, OpenGraphMetadata, URLParams } from '../types';

// Configuration constants
export const CONFIG = {
  // In vmin
  BASE_FONTSIZE: 3,

  // Width / Height ratio. Switch to `wide` layout when threshold reached
  IS_WIDE: 4,

  // In ms. Interval to update from feed source (10 mins)
  UPDATE_INTERVAL: 600000,

  // In ms. Feed fetching timeout
  FEED_TIMEOUT: 10000,

  // In ms. OpenGraph fetching timeout
  OPENGRAPH_TIMEOUT: 6000,

  // In ms. Prepare next item in the background
  PREPARE_TIME: 1000,
};

// Override deprecated source feeds
const OVERRIDE_SOURCES = new Map<string, Array<{ old: string; new: string }>>([
  ['npr-feed', [
    {
      old: 'https://www.npr.org/rss/rss.php',
      new: 'https://feeds.npr.org/1001/rss.xml'
    }
  ]],
  ['seattle-times-feed', [
    {
      old: 'http://www.seattletimes.com/nation-world/world/feed',
      new: 'https://www.seattletimes.com/nation-world/world/feed/'
    }
  ]]
]);

/**
 * Parse URL parameters from TelemetryX item URL
 */
export function parseURLParameters(url: string): URLParams {
  try {
    const decoded = decodeURIComponent(url);
    const params: URLParams = {};
    
    // Simple query string parsing
    if (decoded.includes('?')) {
      const queryString = decoded.split('?')[1];
      const pairs = queryString.split('&');
      
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          params[key as keyof URLParams] = decodeURIComponent(value);
        }
      });
    }
    
    return params;
  } catch (error) {
    console.error('Error parsing URL parameters:', error);
    return {};
  }
}

/**
 * Get override source URL if available
 */
export function getOverrideSource(sourcefeed: string, appType?: string): string {
  if (!sourcefeed?.length || !appType?.length) {
    return sourcefeed;
  }

  const override = OVERRIDE_SOURCES.get(appType);
  if (!override?.length) {
    return sourcefeed;
  }

  for (const item of override) {
    if (item.old === sourcefeed) {
      return item.new;
    }
  }
  
  return sourcefeed;
}

/**
 * Get original link from RSS item, handling FeedBurner redirects
 */
export function getOriginalLink(item: RSSItem): string | undefined {
  let feedLink = item.link || '';

  // iTunes feeds don't support OpenGraph metadata
  if (item.extensions?.itunes) {
    return undefined;
  }

  // Grab original link from FeedBurner
  if (item.extensions?.feedburner?.origLink?.[0]?.value) {
    feedLink = item.extensions.feedburner.origLink[0].value;
  } 
  // Sometimes the original link is in the guid field
  else if (item.guid && item.guid.startsWith('http')) {
    // Filter out cases where guid might be a shortlink
    if (item.guid.length >= feedLink.length && 
        !(item.guid.startsWith('http://') && item.link?.startsWith('https://'))) {
      feedLink = item.guid;
    }
  }

  return feedLink;
}

/**
 * Validate RSS items
 */
export function getValidItems(items: RSSItem[]): RSSItem[] {
  if (!items?.length) return [];
  
  return items.filter(item => {
    // Display resources with valid title and publish time
    const hasTitle = (item.title || '').trim().length > 0;
    const hasPubDate = (item.pubDate || item.publishedParsed || item.published || '').trim().length > 0;
    return hasTitle && hasPubDate;
  });
}

/**
 * Get item title, preferring OpenGraph data
 */
export function getItemTitle(item: RSSItem): string {
  if (item.opengraph?.title) {
    return item.opengraph.title;
  }
  return item.title || '';
}

/**
 * Get formatted description text
 */
export function getFormattedText(item: RSSItem): string {
  let sanitizedText = '';

  if (item.opengraph?.description) {
    sanitizedText = contextualEscaping(item.opengraph.description);
    
    // Check for invalid OpenGraph description
    if (sanitizedText.indexOf('openGraphObjectMap.get') === -1) {
      return sanitizedText;
    }
  }

  // Fallback to item description
  sanitizedText = contextualEscaping(item.description || '');
  return sanitizedText;
}

/**
 * Get formatted publish time
 */
export function getFormattedTime(item: RSSItem): string {
  let pubDate: string | undefined;
  
  if (item.opengraph?.date) {
    pubDate = item.opengraph.date;
  } else {
    pubDate = item.pubDate || item.publishedParsed || item.published;
  }

  if (!pubDate) {
    return '';
  }

  try {
    const date = new Date(pubDate);
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
    const dateString = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${timeString}\n${dateString}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
}

/**
 * Get unique key for RSS item
 */
export function getItemKey(item: RSSItem): string {
  if (item.guid) return item.guid;
  if (item.link) return item.link;
  
  const pubDate = item.pubDate || item.publishedParsed || item.published || '';
  return pubDate.replace(/\s/g, '').trim();
}

/**
 * Basic contextual escaping for HTML content
 */
function contextualEscaping(content: string): string {
  if (!content) return '';
  
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

/**
 * Calculate base font size based on screen dimensions
 */
export function calculateBaseFontSize(itemSize: { w: number; h: number }): number | undefined {
  if (!itemSize.w || !itemSize.h) return undefined;
  
  const minDimension = Math.min(itemSize.w, itemSize.h);
  const fontSize = (minDimension * CONFIG.BASE_FONTSIZE) / 100; // Convert vmin to px
  
  return fontSize;
}

/**
 * Determine if layout is portrait
 */
export function isPortraitLayout(itemSize: { w: number; h: number }): boolean {
  return itemSize.h > itemSize.w;
}

/**
 * Determine if layout is wide
 */
export function isWideLayout(itemSize: { w: number; h: number }): boolean {
  return itemSize.w / itemSize.h > CONFIG.IS_WIDE;
}

/**
 * Find index of last played item
 */
export function findLastPlayedIndex(items: RSSItem[], lastPlayFeedID: string): number {
  return items.findIndex(item => {
    return item.guid === lastPlayFeedID ||
           item.link === lastPlayFeedID ||
           (item.pubDate || item.publishedParsed || item.published || '').replace(/\s/g, '').trim() === lastPlayFeedID;
  });
}

/**
 * Clean sourcefeed URL parameter
 */
export function cleanSourcefeedParam(sourcefeed: string): string {
  // Fix messed up parameter
  if (sourcefeed.startsWith('sourcefeed=')) {
    return sourcefeed.replace('sourcefeed=', '');
  }
  return sourcefeed;
}