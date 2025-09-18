/**
 * Production configuration for YouTube player
 * Based on battle-tested values from TelemetryTV Player-PWA
 */

export const YOUTUBE_CONFIG = {
  // Check YT iFrame API availability
  // In ms. Check if YT service is ready (possible network issue)
  CHECK_INTERVAL: 500,
  // Maximum times to check YT failure. When this threshold is reached, give up
  // 500 * 60 => 30s
  SKIP_AFTER: 60,

  // Paused / Stall / Unstarted
  // In ms. Interval to retry playing video when paused
  PAUSE_RECHECK_INTERVAL: 10000,
  // Times of playback failure. When this threshold is reached, give up
  // 10000 * 6 => 60s
  SKIP_RECHECK_AFTER: 6,

  // Restart
  // In ms. Try restart after this interval for single videos
  RESTART_AFTER: 1200,

  // Buffering timeout
  // In ms. Consider video stuck if buffering longer than this
  BUFFERING_TIMEOUT: 30000,
  // Initial buffering timeout (more lenient for first load)
  INITIAL_BUFFERING_TIMEOUT: 45000,

  // Failsafe timers
  // In seconds. Force advance to next/restart after: video duration + this delta
  FORCE_ADVANCE_DELTA: 30,
  // In seconds. Force advance after max time (12 hours)
  MAX_VIDEO_LENGTH: 43200,

  // Delay error messages for potentially temporary errors
  // In ms. Delay showing error message for embedding errors
  DELAY_ERR_MSG_AFTER: 8000,

  // End time check interval
  // In ms. Check if video reached custom end time
  END_TIME_CHECK_INTERVAL: 1000,

  // Network retry
  // In ms. Wait before retrying after network error
  NETWORK_RETRY_DELAY: 3000,
  // Maximum network retry attempts
  MAX_NETWORK_RETRIES: 3
}

// Error codes that should be delayed (might be temporary)
export const DELAYED_ERROR_CODES = [101, 150, '101', '150']

// Error codes that are permanent (no retry)
export const PERMANENT_ERROR_CODES = [2, 100]

// Error messages mapping
export const ERROR_MESSAGES: Record<number | string, string> = {
  2: 'Invalid YouTube Video ID',
  5: 'Cannot play in HTML5 player',
  100: 'Video not found or private',
  101: 'Embedding disabled by video owner',
  150: 'Embedding disabled by video owner'
}