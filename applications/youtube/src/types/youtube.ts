// YouTube IFrame API TypeScript definitions
// Based on: https://developers.google.com/youtube/iframe_api_reference

declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
  }
}

export namespace YT {
  export enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
  }

  export interface PlayerVars {
    autoplay?: 0 | 1
    cc_load_policy?: 0 | 1
    color?: 'red' | 'white'
    controls?: 0 | 1 | 2
    disablekb?: 0 | 1
    enablejsapi?: 0 | 1
    end?: number
    fs?: 0 | 1
    hl?: string
    iv_load_policy?: 1 | 3
    list?: string
    listType?: 'playlist' | 'user_uploads'
    loop?: 0 | 1
    modestbranding?: 0 | 1
    origin?: string
    playlist?: string
    playsinline?: 0 | 1
    rel?: 0 | 1
    showinfo?: 0 | 1
    start?: number
    widget_referrer?: string
  }

  export interface PlayerOptions {
    width?: string | number
    height?: string | number
    videoId?: string
    playerVars?: PlayerVars
    events?: {
      onReady?: (event: PlayerEvent) => void
      onStateChange?: (event: PlayerEvent) => void
      onError?: (event: ErrorEvent) => void
      onPlaybackQualityChange?: (event: PlayerEvent) => void
      onPlaybackRateChange?: (event: PlayerEvent) => void
      onApiChange?: (event: PlayerEvent) => void
    }
  }

  export interface PlayerEvent {
    target: Player
    data: any
  }

  export interface ErrorEvent {
    target: Player
    data: number
  }

  export class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions)

    // Playback controls
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    seekTo(seconds: number, allowSeekAhead?: boolean): void
    clearVideo(): void

    // Changing the player volume
    mute(): void
    unMute(): void
    isMuted(): boolean
    setVolume(volume: number): void
    getVolume(): number

    // Setting the player size
    setSize(width: number, height: number): object

    // Setting playback rate
    getPlaybackRate(): number
    setPlaybackRate(suggestedRate: number): void
    getAvailablePlaybackRates(): number[]

    // Setting playback quality
    getPlaybackQuality(): string
    setPlaybackQuality(suggestedQuality: string): void
    getAvailableQualityLevels(): string[]

    // Retrieving video information
    getDuration(): number
    getCurrentTime(): number
    getVideoLoadedFraction(): number
    getPlayerState(): PlayerState
    getVideoUrl(): string
    getVideoEmbedCode(): string

    // Retrieving playlist information
    getPlaylist(): string[]
    getPlaylistIndex(): number

    // Loading/cueing functions
    loadVideoById(videoId: string | { videoId: string; startSeconds?: number; endSeconds?: number }): void
    loadVideoByUrl(mediaContentUrl: string, startSeconds?: number, endSeconds?: number): void
    cueVideoById(videoId: string | { videoId: string; startSeconds?: number; endSeconds?: number }): void
    cueVideoByUrl(mediaContentUrl: string, startSeconds?: number, endSeconds?: number): void

    // Loading playlists
    loadPlaylist(playlist: string | string[], index?: number, startSeconds?: number): void
    cuePlaylist(playlist: string | string[], index?: number, startSeconds?: number): void

    // Controlling playback of 360° videos
    getSphericalProperties(): object
    setSphericalProperties(properties: object): void

    // Adding or removing an event listener
    addEventListener(event: string, listener: (event: PlayerEvent | ErrorEvent) => void): void
    removeEventListener(event: string, listener: (event: PlayerEvent | ErrorEvent) => void): void

    // Accessing and modifying DOM nodes
    getIframe(): HTMLIFrameElement
    destroy(): void
  }

  export const loaded: number
}

export interface YouTubeURLType {
  type: 'video' | 'playlist' | 'channel'
  videoId?: string
  playlistId?: string
  channelId?: string
  startTime?: number
  endTime?: number
}

export interface YouTubePlayerConfig {
  videoId?: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  loop?: boolean
  startTime?: number
  endTime?: number
  playlistId?: string
}