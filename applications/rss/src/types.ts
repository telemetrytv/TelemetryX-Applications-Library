// RSS Application Types
export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid?: string;
  pubDate?: string;
  publishedParsed?: string;
  published?: string;
  opengraph?: OpenGraphMetadata;
  extensions?: {
    feedburner?: {
      origLink: Array<{ value: string }>;
    };
    itunes?: any;
  };
}

export interface OpenGraphMetadata {
  title?: string;
  description?: string;
  image?: string;
  date?: string;
  url?: string;
}

export interface RSSFeed {
  title?: string;
  description?: string;
  link?: string;
  items: RSSItem[];
}

export interface AppConfiguration {
  sourcefeed: string;
  appType?: string;
  noOlderThan?: string;
  playOnlyOne: boolean;
  transitionInterval: number;
  refreshInterval: number;
  zoomEffect: boolean;
  hAlign: 'left' | 'center' | 'right';
  theme: 'default' | 'nomixed';
}

export interface ItemSize {
  w: number;
  h: number;
}

export interface FeedItemProps {
  item: RSSItem;
  isVisible: boolean;
  fontSize?: number;
  baseFontSize?: number;
  isPortrait: boolean;
  isWide: boolean;
  theme: string;
  hAlign: string;
  zoomEffect: boolean;
  interval: number;
}

export interface ImageOptions {
  url: string;
  animated_zoom_effect: boolean;
  duration: number;
}

// Storage keys
export type StorageKey = `rss-app_${string}_items` | `rss-app_${string}_last-played`;

// Error types
export interface RSSError {
  message: string;
  code?: string;
  url?: string;
}

// Configuration parsing types
export interface URLParams {
  sourcefeed?: string;
  appType?: string;
  noOlderThan?: string;
  playOnlyOne?: string;
  transitionInterval?: string;
  refreshInterval?: string;
  zoomEffect?: string;
  hAlign?: string;
  theme?: string;
}