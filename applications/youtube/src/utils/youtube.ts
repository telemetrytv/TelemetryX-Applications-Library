// YouTube URL parsing and validation utilities
// Keeping it simple and focused on our Settings → Render flow

export interface YouTubeVideoInfo {
  isValid: boolean
  videoId: string | null
  embedUrl: string | null
  urlType: 'video' | 'playlist' | 'channel' | 'invalid'
  error?: string
}

export class YouTubeUtils {
  /**
   * Parse YouTube URL and extract video information
   * Based on the Vue.js implementation logic
   */
  static parseURL(url: string): YouTubeVideoInfo {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        videoId: null,
        embedUrl: null,
        urlType: 'invalid',
        error: 'Invalid URL provided'
      }
    }

    const cleanUrl = decodeURIComponent(url.trim())

    // Check if it's a YouTube URL
    if (!this.isYouTubeURL(cleanUrl)) {
      return {
        isValid: false,
        videoId: null,
        embedUrl: null,
        urlType: 'invalid',
        error: 'Not a valid YouTube URL'
      }
    }

    // Extract video ID (for now, focusing on single videos)
    const videoId = this.extractVideoId(cleanUrl)

    if (!videoId) {
      // Could be playlist or channel - for now mark as invalid
      return {
        isValid: false,
        videoId: null,
        embedUrl: null,
        urlType: this.getUrlType(cleanUrl),
        error: 'Could not extract video ID. Playlists and channels not yet supported.'
      }
    }

    // Create embed URL for the video
    const embedUrl = this.createEmbedUrl(videoId, cleanUrl)

    return {
      isValid: true,
      videoId,
      embedUrl,
      urlType: 'video'
    }
  }

  /**
   * Check if URL is a YouTube URL
   */
  static isYouTubeURL(url: string): boolean {
    const regex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i
    return regex.test(url)
  }

  /**
   * Extract video ID from various YouTube URL formats
   * Based on the Vue.js regex pattern
   */
  static extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    if (match && match[2] && match[2].length === 11) {
      return match[2]
    }

    return null
  }

  /**
   * Determine URL type (video, playlist, channel)
   */
  static getUrlType(url: string): 'video' | 'playlist' | 'channel' | 'invalid' {
    const regexChannel = /(https?:\/\/)?(www\.)?youtube\.com\/(user|channel)\//i
    const regexPlaylist = /(https?:\/\/)?(www\.)?youtube\.com\/.*[?&]list=/i

    if (regexChannel.test(url)) {
      return 'channel'
    } else if (regexPlaylist.test(url)) {
      return 'playlist'
    } else if (this.extractVideoId(url)) {
      return 'video'
    }

    return 'invalid'
  }

  /**
   * Create embed URL with autoplay and other parameters
   */
  static createEmbedUrl(videoId: string, originalUrl?: string): string {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`
    const params = new URLSearchParams()

    // Core parameters for our player
    params.set('autoplay', '1')
    params.set('mute', '1') // Required for autoplay in most browsers
    params.set('controls', '0') // Hide controls for clean display
    params.set('modestbranding', '1') // Minimal branding
    params.set('rel', '0') // Don't show related videos
    params.set('showinfo', '0') // Hide video info
    params.set('iv_load_policy', '3') // Hide annotations
    params.set('disablekb', '1') // Disable keyboard controls
    params.set('playsinline', '1') // Mobile inline playback

    // Extract start time if present in original URL
    if (originalUrl) {
      const startTime = this.extractStartTime(originalUrl)
      if (startTime > 0) {
        params.set('start', startTime.toString())
      }

      const endTime = this.extractEndTime(originalUrl)
      if (endTime > 0) {
        params.set('end', endTime.toString())
      }
    }

    return `${baseUrl}?${params.toString()}`
  }

  /**
   * Extract start time from URL (t=30s or start=30)
   */
  static extractStartTime(url: string): number {
    const regExp = /[?&](start|t)=(\d+)(s)?/
    const match = url.match(regExp)
    return match && match[2] ? parseInt(match[2], 10) : 0
  }

  /**
   * Extract end time from URL (end=120)
   */
  static extractEndTime(url: string): number {
    const regExp = /[?&]end=(\d+)/
    const match = url.match(regExp)
    return match && match[1] ? parseInt(match[1], 10) : 0
  }

  /**
   * Validate URL and return user-friendly error messages
   */
  static validateURL(url: string): { isValid: boolean; error?: string } {
    if (!url || !url.trim()) {
      return { isValid: false, error: 'Please enter a YouTube URL' }
    }

    const info = this.parseURL(url)
    return {
      isValid: info.isValid,
      error: info.error
    }
  }

  /**
   * Load YouTube IFrame API script
   * Returns a promise that resolves when the API is ready
   */
  static loadYouTubeAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        resolve()
        return
      }

      // Check if script is already in the DOM
      const existingScript = document.getElementById('youtube-iframe-api')
      if (existingScript) {
        // Script is loading, wait for it
        window.onYouTubeIframeAPIReady = () => resolve()
        return
      }

      // Load the script
      const script = document.createElement('script')
      script.id = 'youtube-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true

      script.onload = () => {
        // The API will call onYouTubeIframeAPIReady when ready
        window.onYouTubeIframeAPIReady = () => resolve()
      }

      script.onerror = () => {
        reject(new Error('Failed to load YouTube IFrame API'))
      }

      document.head.appendChild(script)

      // Fallback timeout
      setTimeout(() => {
        if (!window.YT || !window.YT.Player) {
          reject(new Error('YouTube IFrame API failed to load within timeout'))
        }
      }, 10000) // 10 second timeout
    })
  }
}