import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { Render } from '../Render'
import { store } from '@telemetryx/sdk'
import { YOUTUBE_CONFIG } from '../../config/youtube.config'
import { YouTubeUtils } from '../../utils/youtube'

// Mock dependencies
vi.mock('@telemetryx/sdk', () => ({
  store: vi.fn()
}))

vi.mock('../../utils/youtube', () => ({
  YouTubeUtils: {
    parseURL: vi.fn(),
    extractStartTime: vi.fn(),
    extractEndTime: vi.fn(),
    loadYouTubeAPI: vi.fn()
  }
}))

// Setup mock YouTube player
const createMockPlayer = () => ({
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  seekTo: vi.fn(),
  mute: vi.fn(),
  setVolume: vi.fn(),
  getDuration: vi.fn().mockReturnValue(100),
  getCurrentTime: vi.fn().mockReturnValue(0),
  getPlayerState: vi.fn(),
  destroy: vi.fn(),
  loadVideoById: vi.fn(),
  getAvailableQualityLevels: vi.fn().mockReturnValue(['hd1080']),
  setPlaybackQuality: vi.fn(),
  getVideoUrl: vi.fn().mockReturnValue('https://youtube.com/watch?v=test')
})

describe('Render Component - Production Robustness', () => {
  let mockStore: any
  let mockSubscribeCallback: Function
  let mockPlayer: any

  beforeEach(() => {
    vi.useFakeTimers()

    mockStore = {
      application: {
        subscribe: vi.fn((key, callback) => {
          mockSubscribeCallback = callback
          return Promise.resolve()
        })
      }
    }
    ;(store as any).mockReturnValue(mockStore)

    mockPlayer = createMockPlayer()

    ;(window as any).YT = {
      Player: vi.fn((elementId, options) => {
        setTimeout(() => {
          options.events?.onReady?.({ target: mockPlayer })
        }, 100)
        return mockPlayer
      }),
      PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
      }
    }

    ;(YouTubeUtils.loadYouTubeAPI as any).mockResolvedValue(undefined)
    ;(YouTubeUtils.parseURL as any).mockReturnValue({
      isValid: true,
      videoId: 'test123',
      urlType: 'video'
    })
    ;(YouTubeUtils.extractStartTime as any).mockReturnValue(0)
    ;(YouTubeUtils.extractEndTime as any).mockReturnValue(0)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  describe('Retry Mechanism', () => {
    it('should retry playback when paused up to max attempts', async () => {
      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const onStateChange = (window.YT.Player as any).mock.calls[0][1].events.onStateChange

      // Simulate multiple pause events
      for (let i = 0; i < YOUTUBE_CONFIG.SKIP_RECHECK_AFTER - 1; i++) {
        mockPlayer.playVideo.mockClear()

        act(() => {
          onStateChange({ data: window.YT.PlayerState.PAUSED, target: mockPlayer })
        })

        await act(async () => {
          vi.advanceTimersByTime(YOUTUBE_CONFIG.PAUSE_RECHECK_INTERVAL + 100)
        })

        expect(mockPlayer.playVideo).toHaveBeenCalled()
      }

      // One more pause should trigger max attempts error
      act(() => {
        onStateChange({ data: window.YT.PlayerState.PAUSED, target: mockPlayer })
      })

      await waitFor(() => {
        expect(screen.getByText(/Video playback stalled/)).toBeInTheDocument()
      })
    })

    it('should retry network errors up to max attempts', async () => {
      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      // Simulate multiple network failures
      for (let i = 0; i < YOUTUBE_CONFIG.MAX_NETWORK_RETRIES; i++) {
        ;(window.YT.Player as any).mockImplementationOnce(() => {
          throw new Error('Network error')
        })

        await act(async () => {
          vi.advanceTimersByTime(YOUTUBE_CONFIG.NETWORK_RETRY_DELAY + 100)
        })
      }

      // After max retries, error should be displayed
      await waitFor(() => {
        expect(screen.getByText(/Failed to create YouTube player/)).toBeInTheDocument()
      })
    })
  })

  describe('Buffering Timeout Detection', () => {
    it('should detect and handle buffering timeout', async () => {
      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const onStateChange = (window.YT.Player as any).mock.calls[0][1].events.onStateChange

      // Simulate buffering
      mockPlayer.getPlayerState.mockReturnValue(window.YT.PlayerState.BUFFERING)
      mockPlayer.getCurrentTime.mockReturnValue(0)
      mockPlayer.getDuration.mockReturnValue(0)

      act(() => {
        onStateChange({ data: window.YT.PlayerState.BUFFERING, target: mockPlayer })
      })

      // Wait for buffering timeout
      await act(async () => {
        vi.advanceTimersByTime(YOUTUBE_CONFIG.BUFFERING_TIMEOUT + 100)
      })

      await waitFor(() => {
        expect(screen.getByText(/Unable to start playing video/)).toBeInTheDocument()
      })
    })

    it('should use longer timeout for initial buffering', async () => {
      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      // Initial buffering check should use INITIAL_BUFFERING_TIMEOUT
      mockPlayer.getPlayerState.mockReturnValue(window.YT.PlayerState.BUFFERING)

      // Should not timeout at regular timeout
      await act(async () => {
        vi.advanceTimersByTime(YOUTUBE_CONFIG.BUFFERING_TIMEOUT)
      })

      expect(screen.queryByText(/Unable to start/)).not.toBeInTheDocument()

      // Should timeout at initial timeout
      await act(async () => {
        vi.advanceTimersByTime(
          YOUTUBE_CONFIG.INITIAL_BUFFERING_TIMEOUT - YOUTUBE_CONFIG.BUFFERING_TIMEOUT + 100
        )
      })

      await waitFor(() => {
        expect(screen.getByText(/Unable to start playing video/)).toBeInTheDocument()
      })
    })
  })

  describe('Force Advance Mechanism', () => {
    it('should force restart after video duration plus delta', async () => {
      mockPlayer.getDuration.mockReturnValue(60) // 60 second video

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      mockPlayer.seekTo.mockClear()
      mockPlayer.playVideo.mockClear()

      // Advance time past video duration + delta
      await act(async () => {
        vi.advanceTimersByTime((60 + YOUTUBE_CONFIG.FORCE_ADVANCE_DELTA) * 1000 + 100)
      })

      expect(mockPlayer.seekTo).toHaveBeenCalledWith(0)
      expect(mockPlayer.playVideo).toHaveBeenCalled()
    })

    it('should force restart after max video length', async () => {
      mockPlayer.getDuration.mockReturnValue(50000) // Very long video

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      mockPlayer.seekTo.mockClear()
      mockPlayer.playVideo.mockClear()

      // Advance time to max length
      await act(async () => {
        vi.advanceTimersByTime(YOUTUBE_CONFIG.MAX_VIDEO_LENGTH * 1000 + 100)
      })

      expect(mockPlayer.seekTo).toHaveBeenCalledWith(0)
      expect(mockPlayer.playVideo).toHaveBeenCalled()
    })
  })

  describe('Delayed Error Messages', () => {
    it('should delay error 101 (embedding disabled)', async () => {
      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const onError = (window.YT.Player as any).mock.calls[0][1].events.onError
      mockPlayer.getPlayerState.mockReturnValue(window.YT.PlayerState.UNSTARTED)

      // Trigger error 101
      act(() => {
        onError({ data: 101 })
      })

      // Should show checking message, not error
      expect(screen.getByText('Checking video availability...')).toBeInTheDocument()
      expect(screen.queryByText(/Embedding disabled/)).not.toBeInTheDocument()

      // Wait for delay
      await act(async () => {
        vi.advanceTimersByTime(YOUTUBE_CONFIG.DELAY_ERR_MSG_AFTER + 100)
      })

      expect(screen.getByText(/Embedding disabled by video owner/)).toBeInTheDocument()
    })

    it('should delay error 150 (embedding disabled)', async () => {
      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const onError = (window.YT.Player as any).mock.calls[0][1].events.onError
      mockPlayer.getPlayerState.mockReturnValue(window.YT.PlayerState.UNSTARTED)

      // Trigger error 150
      act(() => {
        onError({ data: 150 })
      })

      expect(screen.getByText('Checking video availability...')).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(YOUTUBE_CONFIG.DELAY_ERR_MSG_AFTER + 100)
      })

      expect(screen.getByText(/Embedding disabled by video owner/)).toBeInTheDocument()
    })

    it('should not delay permanent errors', async () => {
      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const onError = (window.YT.Player as any).mock.calls[0][1].events.onError

      // Trigger error 100 (video not found)
      act(() => {
        onError({ data: 100 })
      })

      // Should show error immediately
      expect(screen.getByText(/Video not found or private/)).toBeInTheDocument()
      expect(screen.queryByText(/Checking video availability/)).not.toBeInTheDocument()
    })

    it('should cancel delayed error if video starts playing', async () => {
      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const onError = (window.YT.Player as any).mock.calls[0][1].events.onError
      const onStateChange = (window.YT.Player as any).mock.calls[0][1].events.onStateChange

      // Trigger delayed error
      mockPlayer.getPlayerState.mockReturnValue(window.YT.PlayerState.UNSTARTED)
      act(() => {
        onError({ data: 101 })
      })

      expect(screen.getByText('Checking video availability...')).toBeInTheDocument()

      // Video starts playing before delay expires
      mockPlayer.getPlayerState.mockReturnValue(window.YT.PlayerState.PLAYING)
      act(() => {
        onStateChange({ data: window.YT.PlayerState.PLAYING, target: mockPlayer })
      })

      // Wait past delay time
      await act(async () => {
        vi.advanceTimersByTime(YOUTUBE_CONFIG.DELAY_ERR_MSG_AFTER + 100)
      })

      // Error should not appear
      expect(screen.queryByText(/Embedding disabled/)).not.toBeInTheDocument()
    })
  })

  describe('End Time Monitoring', () => {
    it('should monitor and respect custom end time', async () => {
      ;(YouTubeUtils.extractEndTime as any).mockReturnValue(30)
      mockPlayer.getCurrentTime.mockReturnValue(0)

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123&end=30')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      mockPlayer.seekTo.mockClear()

      // Simulate time progression
      mockPlayer.getCurrentTime.mockReturnValue(29)
      await act(async () => {
        vi.advanceTimersByTime(YOUTUBE_CONFIG.END_TIME_CHECK_INTERVAL)
      })

      expect(mockPlayer.seekTo).not.toHaveBeenCalled()

      // Reach end time
      mockPlayer.getCurrentTime.mockReturnValue(30)
      await act(async () => {
        vi.advanceTimersByTime(YOUTUBE_CONFIG.END_TIME_CHECK_INTERVAL)
      })

      expect(mockPlayer.seekTo).toHaveBeenCalledWith(0)
      expect(mockPlayer.playVideo).toHaveBeenCalled()
    })
  })

  describe('Timer Cleanup', () => {
    it('should clear all timers when URL changes', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=first')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      clearTimeoutSpy.mockClear()
      clearIntervalSpy.mockClear()

      // Change URL
      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=second')
      })

      expect(clearTimeoutSpy).toHaveBeenCalled()
      expect(clearIntervalSpy).toHaveBeenCalled()

      clearTimeoutSpy.mockRestore()
      clearIntervalSpy.mockRestore()
    })

    it('should clear all timers on component unmount', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const { unmount } = render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      clearTimeoutSpy.mockClear()
      clearIntervalSpy.mockClear()

      unmount()

      expect(clearTimeoutSpy).toHaveBeenCalledTimes(6) // All timer refs
      expect(clearIntervalSpy).toHaveBeenCalledTimes(2) // Interval timer refs
      expect(mockPlayer.destroy).toHaveBeenCalled()

      clearTimeoutSpy.mockRestore()
      clearIntervalSpy.mockRestore()
    })
  })
})