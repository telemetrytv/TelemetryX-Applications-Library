import React, { useState, useEffect } from 'react';
import { RSSItem, ImageOptions } from '../types';
import { 
  getItemTitle, 
  getFormattedText, 
  getFormattedTime, 
  getOriginalLink 
} from '../utils/rss-parser';

interface FeedItemProps {
  item: RSSItem;
  isVisible: boolean;
  baseFontSize?: number;
  isPortrait: boolean;
  isWide: boolean;
  theme: string;
  hAlign: string;
  zoomEffect: boolean;
  interval: number;
  onImageLoad?: () => void;
  onImageError?: () => void;
}

interface ImageItemProps {
  src: string;
  alt: string;
  zoomEffect: boolean;
  duration: number;
  noMixedMode: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageItem: React.FC<ImageItemProps> = ({ 
  src, 
  alt, 
  zoomEffect, 
  duration,
  noMixedMode,
  onLoad,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: imageLoaded ? 1 : 0,
    transition: 'opacity 0.5s ease',
    ...(zoomEffect && {
      animation: `rssZoom ${duration}s ease-in-out infinite alternate`,
    }),
    ...(noMixedMode && {
      filter: 'brightness(0.8)',
    }),
  };

  return (
    <div className="image-container">
      <img
        src={src}
        alt={alt}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

const ResponsiveText: React.FC<{
  text: string;
  baseFontSize?: number;
  hAlign: string;
  className?: string;
}> = ({ text, baseFontSize, hAlign, className = '' }) => {
  const textStyle: React.CSSProperties = {
    fontSize: baseFontSize ? `${baseFontSize * 0.8}px` : '1em',
    textAlign: hAlign as 'left' | 'center' | 'right',
    lineHeight: '1.4',
  };

  // Convert HTML entities and clean text
  const cleanText = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags

  return (
    <div 
      className={`responsive-text ${className}`}
      style={textStyle}
      dangerouslySetInnerHTML={{ __html: cleanText }}
    />
  );
};

export const FeedItem: React.FC<FeedItemProps> = ({
  item,
  isVisible,
  baseFontSize,
  isPortrait,
  isWide,
  theme,
  hAlign,
  zoomEffect,
  interval,
  onImageLoad,
  onImageError,
}) => {
  const [hasImageError, setHasImageError] = useState(false);
  
  const title = getItemTitle(item);
  const description = getFormattedText(item);
  const timeString = getFormattedTime(item);
  const imageUrl = item.opengraph?.image;
  
  const useNoMixedTheme = theme === 'nomixed';
  const horzClass = `horz-${hAlign}`;

  const handleImageError = () => {
    setHasImageError(true);
    onImageError?.();
  };

  const handleImageLoad = () => {
    setHasImageError(false);
    onImageLoad?.();
  };

  const contextItemStyle: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 1s ease',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    zIndex: isVisible ? 2 : 1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: baseFontSize ? `${baseFontSize * 1.7}px` : '1.7em',
    fontWeight: 600,
    lineHeight: '120%',
    paddingBottom: '0.5em',
    textTransform: 'capitalize',
    textAlign: hAlign as 'left' | 'center' | 'right',
    color: useNoMixedTheme ? 'black' : 'white',
  };

  const dateTimeStyle: React.CSSProperties = {
    lineHeight: '120%',
    textAlign: 'right',
    whiteSpace: 'pre-wrap',
    opacity: 0.7,
    color: useNoMixedTheme ? 'black' : 'white',
  };

  return (
    <>
      {/* Image Layer */}
      {imageUrl && !hasImageError && (
        <div 
          className="feed-image-layer"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          <ImageItem
            src={imageUrl}
            alt={title}
            zoomEffect={zoomEffect}
            duration={interval}
            noMixedMode={useNoMixedTheme}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      )}

      {/* Content Layer */}
      <div className="context-item-wrapper" style={contextItemStyle}>
        <div className={`feed-title ${horzClass}`} style={titleStyle}>
          {title}
        </div>
        
        <div className="feed-description" style={{ flex: '1 1 0.00001px', position: 'relative' }}>
          <ResponsiveText
            text={description}
            baseFontSize={baseFontSize}
            hAlign={hAlign}
            className={horzClass}
          />
        </div>
      </div>

      {/* Meta Info Layer */}
      <div 
        className="datetime-inner"
        style={{
          ...dateTimeStyle,
          opacity: isVisible ? 0.7 : 0,
          transition: 'opacity 1s ease',
          position: 'absolute',
          bottom: '1em',
          right: '1em',
          zIndex: isVisible ? 2 : 1,
        }}
      >
        <span>{timeString}</span>
      </div>
    </>
  );
};

export default FeedItem;