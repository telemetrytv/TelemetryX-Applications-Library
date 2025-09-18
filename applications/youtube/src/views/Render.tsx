import './Render.css'
import { useEffect, useState, useRef } from 'react'
import { store } from '@telemetryx/sdk'
import { YouTubeUtils } from '../utils/youtube'
import { YOUTUBE_CONFIG, DELAYED_ERROR_CODES, PERMANENT_ERROR_CODES, ERROR_MESSAGES } from '../config/youtube.config'

export function Render() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [player, setPlayer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isApiReady, setIsApiReady] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [stallCount, setStallCount] = useState(0)
  const [delayingError, setDelayingError] = useState(false)
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)

  const playerRef = useRef<HTMLDivElement>(null)
  const playerIdRef = useRef(`youtube-player-${Math.random().toString(36).substring(2, 11)}`)

  // Timer refs for cleanup
  const bufferingTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const retryTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const endTimeTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const forceAdvanceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const maxLengthTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const delayErrorTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const apiCheckTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Helper function to clear all timers
  const clearAllTimers = () => {
    if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current)
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    if (endTimeTimerRef.current) clearInterval(endTimeTimerRef.current)
    if (forceAdvanceTimerRef.current) clearTimeout(forceAdvanceTimerRef.current)
    if (maxLengthTimerRef.current) clearTimeout(maxLengthTimerRef.current)
    if (delayErrorTimerRef.current) clearTimeout(delayErrorTimerRef.current)
    if (apiCheckTimerRef.current) clearInterval(apiCheckTimerRef.current)
  }

  const subscribeYoutubeUrlEffect = () => {
    store().application.subscribe('youtubeUrl', (value) => {
      setYoutubeUrl(value || '')
      // Reset retry counts when URL changes
      setStallCount(0)
      setRetryCount(0)
      clearAllTimers()
    }).catch(console.error)
  }
  useEffect(subscribeYoutubeUrlEffect, [])

  // Load YouTube API on component mount
  useEffect(() => {
    YouTubeUtils.loadYouTubeAPI()
      .then(() => {
        setIsApiReady(true)
      })
      .catch((err) => {
        setError(`Failed to load YouTube API: ${err.message}`)
      })
  }, [])

  // Create/update player when URL changes and API is ready
  useEffect(() => {
    if (!isApiReady || !youtubeUrl) {
      return
    }

    const videoInfo = YouTubeUtils.parseURL(youtubeUrl)
    if (!videoInfo.isValid || !videoInfo.videoId) {
      setError(videoInfo.error || 'Invalid YouTube URL')
      return
    }

    setError('')
    setIsLoading(true)
    createPlayer(videoInfo.videoId)
  }, [youtubeUrl, isApiReady])

  // Buffering timeout detection
  const checkBuffering = (ytPlayer: any, timeout: number = YOUTUBE_CONFIG.BUFFERING_TIMEOUT) => {
    if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current)

    bufferingTimerRef.current = setTimeout(() => {
      if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return

      const state = ytPlayer.getPlayerState()
      if (state === window.YT.PlayerState.BUFFERING || state === window.YT.PlayerState.UNSTARTED) {
        // Check if video hasn't started at all
        if (ytPlayer.getCurrentTime() === 0 && ytPlayer.getDuration() === 0) {
          handleNetworkError('Unable to start', `Unable to start playing video (${currentVideoId})`)
        } else {
          handleNetworkError('Buffering Timeout', `Video buffering timeout (${currentVideoId})`)
        }
      }
    }, timeout)
  }

  // Handle network errors with retry logic
  const handleNetworkError = (errorType: string, message: string) => {
    console.error(`Network error: ${errorType} - ${message}`)

    if (retryCount < YOUTUBE_CONFIG.MAX_NETWORK_RETRIES) {
      setRetryCount(prev => prev + 1)
      setTimeout(() => {
        if (currentVideoId) {
          createPlayer(currentVideoId)
        }
      }, YOUTUBE_CONFIG.NETWORK_RETRY_DELAY)
    } else {
      setError(message)
      setIsLoading(false)
    }
  }

  const createPlayer = (videoId: string) => {
    // Parse URL to get start/end times if present
    setCurrentVideoId(videoId)
    const startTime = YouTubeUtils.extractStartTime(youtubeUrl)
    const endTime = YouTubeUtils.extractEndTime(youtubeUrl)

    // If player exists, use loadVideoById instead of recreating
    if (player && typeof player.loadVideoById === 'function') {
      try {
        setIsLoading(true)
        setError('')

        // Use loadVideoById for better performance
        const loadParams: any = {
          videoId: videoId,
          startSeconds: startTime || 0,
          suggestedQuality: 'highres'
        }

        if (endTime > 0) {
          loadParams.endSeconds = endTime
        }

        player.loadVideoById(loadParams)

        // Ensure it's muted and playing
        if (player.isMuted && !player.isMuted()) {
          player.mute()
        }
        player.playVideo()
        return
      } catch (err) {
        console.error('Error loading video:', err)
      }
    }

    // Cleanup existing player if loadVideoById failed
    if (player && typeof player.destroy === 'function') {
      player.destroy()
      setPlayer(null)
    }

    if (!playerRef.current) return

    try {
      const playerVars: any = {
        autoplay: 1,
        // mute: 1, // Will be handled via player.mute() after creation
        controls: 0, // Hide controls for clean, non-interactive display
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        disablekb: 1, // Disable keyboard controls
        playsinline: 1,
        enablejsapi: 1,
        loop: 1, // Enable looping
        playlist: videoId // Required for loop to work with single video
      }

      // Add start/end times if present
      if (startTime > 0) {
        playerVars.start = startTime
      }
      if (endTime > 0) {
        playerVars.end = endTime
      }

      const newPlayer = new window.YT.Player(playerIdRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: playerVars,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        }
      })

      setPlayer(newPlayer)
    } catch (err) {
      setError(`Failed to create YouTube player: ${err}`)
      setIsLoading(false)
    }
  }

  const onPlayerReady = (event: any) => {
    setIsLoading(false)
    const ytPlayer = event.target

    // Store player reference with proper typing
    setPlayer(ytPlayer)

    // Mute for autoplay compliance
    if (ytPlayer && typeof ytPlayer.mute === 'function') {
      ytPlayer.mute()
      ytPlayer.setVolume(0) // Also set volume to 0 for extra safety
    }

    // Start playback
    if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
      ytPlayer.playVideo()
    }

    // Set playback quality to highest available
    const availableQualityLevels = ytPlayer.getAvailableQualityLevels()
    if (availableQualityLevels && availableQualityLevels.length > 0) {
      ytPlayer.setPlaybackQuality(availableQualityLevels[0])
    }

    // Start buffering check
    checkBuffering(ytPlayer, YOUTUBE_CONFIG.INITIAL_BUFFERING_TIMEOUT)

    // Set up end time monitoring if needed
    const endTime = YouTubeUtils.extractEndTime(youtubeUrl)
    if (endTime > 0) {
      if (endTimeTimerRef.current) clearInterval(endTimeTimerRef.current)
      endTimeTimerRef.current = setInterval(() => {
        const currentTime = ytPlayer.getCurrentTime()
        if (currentTime >= endTime) {
          console.log(`Video reached end time: ${endTime}s`)
          if (endTimeTimerRef.current) clearInterval(endTimeTimerRef.current)
          // Loop back to start
          ytPlayer.seekTo(0)
          ytPlayer.playVideo()
        }
      }, YOUTUBE_CONFIG.END_TIME_CHECK_INTERVAL)
    }

    // Set up force advance timer (safety mechanism)
    const duration = ytPlayer.getDuration()
    if (duration > 0) {
      // Clear existing timers
      if (forceAdvanceTimerRef.current) clearTimeout(forceAdvanceTimerRef.current)
      if (maxLengthTimerRef.current) clearTimeout(maxLengthTimerRef.current)

      // Force restart after video duration + delta
      const forceAdvanceTime = Math.min(
        YOUTUBE_CONFIG.MAX_VIDEO_LENGTH,
        duration + YOUTUBE_CONFIG.FORCE_ADVANCE_DELTA
      ) * 1000

      forceAdvanceTimerRef.current = setTimeout(() => {
        console.log('Force advancing video (duration exceeded)')
        ytPlayer.seekTo(0)
        ytPlayer.playVideo()
      }, forceAdvanceTime)

      // Also set absolute max length timer
      maxLengthTimerRef.current = setTimeout(() => {
        console.log('Force advancing video (max length exceeded)')
        ytPlayer.seekTo(0)
        ytPlayer.playVideo()
      }, YOUTUBE_CONFIG.MAX_VIDEO_LENGTH * 1000)
    }
  }

  const onPlayerStateChange = (event: any) => {
    // Handle player state changes according to YouTube IFrame API
    const state = event.data
    const ytPlayer = event.target

    switch (state) {
      case window.YT.PlayerState.UNSTARTED:
        console.log('Video unstarted')
        break

      case window.YT.PlayerState.ENDED:
        console.log('Video ended')
        // Video will automatically loop due to loop parameter
        break

      case window.YT.PlayerState.PLAYING:
        console.log('Video playing')
        setIsLoading(false)
        setError('')

        // Get video information
        if (ytPlayer) {
          const duration = ytPlayer.getDuration()
          const videoUrl = ytPlayer.getVideoUrl()
          console.log(`Playing video: ${videoUrl}, Duration: ${duration}s`)
        }
        break

      case window.YT.PlayerState.PAUSED:
        console.log('Video paused')
        // Implement retry logic with stall counting
        if (stallCount >= YOUTUBE_CONFIG.SKIP_RECHECK_AFTER) {
          handleNetworkError('Playback stalled', `Video playback stalled after ${stallCount} attempts`)
          return
        }

        setStallCount(prev => prev + 1)

        // Auto-resume with proper interval
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
        retryTimerRef.current = setTimeout(() => {
          if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
            console.log(`Retrying playback (attempt ${stallCount + 1})`)
            ytPlayer.playVideo()
          }
        }, YOUTUBE_CONFIG.PAUSE_RECHECK_INTERVAL)
        break

      case window.YT.PlayerState.BUFFERING:
        console.log('Video buffering')
        setIsLoading(true)
        // Start buffering timeout check
        checkBuffering(ytPlayer, YOUTUBE_CONFIG.BUFFERING_TIMEOUT)
        break

      case window.YT.PlayerState.CUED:
        console.log('Video cued')
        // Video is ready to play
        if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
          ytPlayer.playVideo()
        }
        break
    }
  }

  const onPlayerError = (event: any) => {
    setIsLoading(false)
    const errorCode = event.data
    let errorMessage = ERROR_MESSAGES[errorCode] || `YouTube error code: ${errorCode}`

    // Check if this error should be delayed (might be temporary)
    if (DELAYED_ERROR_CODES.includes(errorCode)) {
      console.log(`Delaying error ${errorCode} for ${YOUTUBE_CONFIG.DELAY_ERR_MSG_AFTER}ms`)
      setDelayingError(true)

      if (delayErrorTimerRef.current) clearTimeout(delayErrorTimerRef.current)
      delayErrorTimerRef.current = setTimeout(() => {
        // Check if player is still in error state
        if (player && player.getPlayerState && player.getPlayerState() === window.YT.PlayerState.UNSTARTED) {
          setError(errorMessage)
          setDelayingError(false)

          // Add video ID for context
          if (currentVideoId) {
            setError(`${errorMessage}. Video ID: ${currentVideoId}`)
          }
        }
        setDelayingError(false)
      }, YOUTUBE_CONFIG.DELAY_ERR_MSG_AFTER)

      return // Don't show error immediately
    }

    // For permanent errors, show immediately
    if (PERMANENT_ERROR_CODES.includes(errorCode)) {
      setError(errorMessage)
      if (currentVideoId) {
        setError(`${errorMessage}. Video ID: ${currentVideoId}`)
      }
    } else {
      // For other errors, show immediately but allow retry
      setError(errorMessage)
    }
  }

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    if (!playerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await playerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers()
      if (player && typeof player.destroy === 'function') {
        player.destroy()
      }
    }
  }, [player])

  const hasValidVideo = youtubeUrl && YouTubeUtils.parseURL(youtubeUrl).isValid

  return hasValidVideo ? (
    <div
      ref={playerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        cursor: 'pointer'
      }}
      onDoubleClick={toggleFullscreen}
    >
      <div
        id={playerIdRef.current}
        style={{
          width: '100%',
          height: '100%'
        }}
      />

      {/* Transparent overlay to block YouTube interactions */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          zIndex: 10,
          cursor: 'pointer'
        }}
        onDoubleClick={toggleFullscreen}
      />

      {/* Custom fullscreen button */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: 'none',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          opacity: 0.8,
          transition: 'opacity 0.3s',
          zIndex: 20
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
        title={isFullscreen ? 'Exit fullscreen (double-click also works)' : 'Enter fullscreen (double-click also works)'}
      >
        {isFullscreen ? 'Exit' : 'Fullscreen'}
      </button>

      {(isLoading || delayingError) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '1.5rem'
        }}>
          {delayingError ? 'Checking video availability...' : 'Loading YouTube video...'}
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          textAlign: 'center',
          padding: '2rem',
          maxWidth: '600px'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ef4444' }}>
            Video Cannot Be Played
          </div>
          <div style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '1.5rem' }}>
            {error}
          </div>

          {error.includes('Embedding disabled') && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem'
            }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                This video's owner has disabled embedding. Common reasons:
              </div>
              <ul style={{
                fontSize: '0.9rem',
                opacity: 0.8,
                textAlign: 'left',
                margin: '0.5rem 0 0 1.5rem'
              }}>
                <li>Music videos with copyright restrictions</li>
                <li>Content with regional restrictions</li>
                <li>Videos set to "Watch on YouTube only"</li>
              </ul>
              <div style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.7 }}>
                Try a different video URL in Settings
              </div>
            </div>
          )}

          {error.includes('private') && (
            <div style={{ fontSize: '1rem', opacity: 0.8, marginTop: '1rem' }}>
              This video is either private, deleted, or the URL is incorrect.
              Please check the URL and try again.
            </div>
          )}

          {/* Retry button for non-permanent errors */}
          {!error.includes('Embedding disabled') && !error.includes('Invalid video ID') && (
            <button
              onClick={() => {
                setError('')
                setRetryCount(retryCount + 1)
                const videoInfo = YouTubeUtils.parseURL(youtubeUrl)
                if (videoInfo.videoId) {
                  setIsLoading(true)
                  createPlayer(videoInfo.videoId)
                }
              }}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)'}
            >
              Retry Loading Video
            </button>
          )}
        </div>
      )}
    </div>
  ) : (
    <div className="render">
      <div className="render__hero">
        <div className="render__hero-title">YouTube Video Player</div>
        <div className="render__hero-subtitle">
          {youtubeUrl ? 'Invalid YouTube URL. Please enter a valid YouTube URL in Settings.' : 'Please enter a YouTube URL in Settings to start watching.'}
        </div>
      </div>
    </div>
  )
}
