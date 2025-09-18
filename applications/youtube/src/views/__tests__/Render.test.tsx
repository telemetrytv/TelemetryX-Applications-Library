import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Render } from '../Render'
import { store } from '@telemetryx/sdk'
import { YOUTUBE_CONFIG } from '../../config/youtube.config'

// Mock the SDK store
vi.mock('@telemetryx/sdk', () => ({
  store: vi.fn()
}))

// Mock YouTube utils
vi.mock('../../utils/youtube', () => ({
  YouTubeUtils: {
    parseURL: vi.fn(),
    extractStartTime: vi.fn(),
    extractEndTime: vi.fn(),
    loadYouTubeAPI: vi.fn()
  }
}))

import { YouTubeUtils } from '../../utils/youtube'

// Mock YouTube IFrame API
const mockYTPlayer = {
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  stopVideo: vi.fn(),
  seekTo: vi.fn(),
  mute: vi.fn(),
  unMute: vi.fn(),
  isMuted: vi.fn(),
  setVolume: vi.fn(),
  getVolume: vi.fn(),
  getDuration: vi.fn(),
  getCurrentTime: vi.fn(),
  getPlayerState: vi.fn(),
  getVideoUrl: vi.fn(),
  destroy: vi.fn(),
  loadVideoById: vi.fn(),
  getAvailableQualityLevels: vi.fn(),
  setPlaybackQuality: vi.fn()
}

class MockYTPlayer {
  constructor(elementId: string, options: any) {
    Object.assign(this, mockYTPlayer)

    // Trigger ready event after a delay
    setTimeout(() => {
      if (options.events?.onReady) {
        options.events.onReady({ target: this })
      }
    }, 100)
  }
}

describe('Render Component', () => {
  let mockStore: any
  let mockSubscribeCallback: Function

  beforeEach(() => {
    // Setup store mock
    mockStore = {
      application: {
        subscribe: vi.fn((key, callback) => {
          mockSubscribeCallback = callback
          return Promise.resolve()
        })
      }
    }
    ;(store as any).mockReturnValue(mockStore)

    // Setup YouTube API mock
    ;(window as any).YT = {
      Player: MockYTPlayer,
      PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
      }
    }

    // Setup YouTube utils mocks
    ;(YouTubeUtils.loadYouTubeAPI as any).mockResolvedValue(undefined)
    ;(YouTubeUtils.parseURL as any).mockReturnValue({
      isValid: true,
      videoId: 'test123',
      embedUrl: 'https://www.youtube.com/embed/test123',
      urlType: 'video'
    })
    ;(YouTubeUtils.extractStartTime as any).mockReturnValue(0)
    ;(YouTubeUtils.extractEndTime as any).mockReturnValue(0)

    // Reset all player mocks
    Object.values(mockYTPlayer).forEach(mock => {
      if (typeof mock === 'function' && mock.mockReset) {
        mock.mockReset()
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    delete (window as any).YT
  })

  describe('Component Lifecycle', () => {
    it('should render initial state without video', () => {
      render(<Render />)

      expect(screen.getByText('YouTube Video Player')).toBeInTheDocument()
      expect(screen.getByText('Please enter a YouTube URL in Settings to start watching.')).toBeInTheDocument()
    })

    it('should load YouTube API on mount', async () => {
      render(<Render />)

      await waitFor(() => {
        expect(YouTubeUtils.loadYouTubeAPI).toHaveBeenCalled()
      })
    })

    it('should subscribe to URL changes from store', () => {
      render(<Render />)

      expect(mockStore.application.subscribe).toHaveBeenCalledWith('youtubeUrl', expect.any(Function))
    })

    it('should create player when valid URL is received', async () => {
      vi.useFakeTimers()
      render(<Render />)

      // Simulate URL update
      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      // Wait for player creation
      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      await waitFor(() => {
        expect(mockYTPlayer.mute).toHaveBeenCalled()
        expect(mockYTPlayer.playVideo).toHaveBeenCalled()
      })

      vi.useRealTimers()
    })
  })

  describe('Player Creation and Management', () => {
    it('should mute player for autoplay compliance', async () => {
      vi.useFakeTimers()
      mockYTPlayer.getAvailableQualityLevels.mockReturnValue(['hd1080', 'hd720', 'large'])

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      expect(mockYTPlayer.mute).toHaveBeenCalled()
      expect(mockYTPlayer.setVolume).toHaveBeenCalledWith(0)

      vi.useRealTimers()
    })

    it('should set highest quality on player ready', async () => {
      vi.useFakeTimers()
      mockYTPlayer.getAvailableQualityLevels.mockReturnValue(['hd1080', 'hd720', 'large'])

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      expect(mockYTPlayer.setPlaybackQuality).toHaveBeenCalledWith('hd1080')

      vi.useRealTimers()
    })

    it('should reuse existing player with loadVideoById for new videos', async () => {
      vi.useFakeTimers()

      render(<Render />)

      // First video
      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=first123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      // Clear mocks
      mockYTPlayer.loadVideoById.mockClear()

      // Second video
      ;(YouTubeUtils.parseURL as any).mockReturnValue({
        isValid: true,
        videoId: 'second456',
        urlType: 'video'
      })

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=second456')
      })

      await waitFor(() => {
        expect(mockYTPlayer.loadVideoById).toHaveBeenCalledWith(
          expect.objectContaining({
            videoId: 'second456'
          })
        )
      })

      vi.useRealTimers()
    })
  })

  describe('Error Handling', () => {
    it('should display error for invalid YouTube URL', async () => {
      ;(YouTubeUtils.parseURL as any).mockReturnValue({
        isValid: false,
        error: 'Not a valid YouTube URL'
      })

      render(<Render />)

      act(() => {
        mockSubscribeCallback('invalid-url')
      })

      await waitFor(() => {
        expect(screen.getByText('Invalid YouTube URL. Please enter a valid YouTube URL in Settings.')).toBeInTheDocument()
      })
    })

    it('should handle API loading failure', async () => {
      ;(YouTubeUtils.loadYouTubeAPI as any).mockRejectedValue(new Error('Failed to load'))

      render(<Render />)

      await waitFor(() => {
        expect(screen.getByText(/Failed to load YouTube API/)).toBeInTheDocument()
      })
    })

    it('should show appropriate error messages for different error codes', async () => {
      vi.useFakeTimers()

      const testCases = [
        { code: 2, message: 'Invalid video ID' },
        { code: 100, message: 'Video not found or private' },
        { code: 5, message: 'Cannot play in HTML5 player' }
      ]

      for (const testCase of testCases) {
        const { rerender } = render(<Render />)

        act(() => {
          mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
        })

        await act(async () => {
          vi.advanceTimersByTime(200)
        })

        // Simulate player error
        const onError = (window.YT.Player as any).mock.calls[0][1].events.onError
        act(() => {
          onError({ data: testCase.code })
        })

        await waitFor(() => {
          expect(screen.getByText(/Video Cannot Be Played/)).toBeInTheDocument()
          expect(screen.getByText(new RegExp(testCase.message))).toBeInTheDocument()
        })

        rerender(<></>)
      }

      vi.useRealTimers()
    })

    it('should delay error display for embedding disabled errors', async () => {
      vi.useFakeTimers()

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      mockYTPlayer.getPlayerState.mockReturnValue(-1) // UNSTARTED

      // Trigger error 101
      const onError = (window.YT.Player as any).mock.calls[0][1].events.onError
      act(() => {
        onError({ data: 101 })
      })

      // Should show "Checking video availability" first
      expect(screen.getByText('Checking video availability...')).toBeInTheDocument()
      expect(screen.queryByText(/Embedding disabled/)).not.toBeInTheDocument()

      // Advance time past delay
      await act(async () => {
        vi.advanceTimersByTime(YOUTUBE_CONFIG.DELAY_ERR_MSG_AFTER + 100)
      })

      // Now error should be shown
      await waitFor(() => {
        expect(screen.getByText(/Embedding disabled by video owner/)).toBeInTheDocument()
      })

      vi.useRealTimers()
    })
  })

  describe('Player State Management', () => {
    it('should handle buffering state', async () => {
      vi.useFakeTimers()

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const onStateChange = (window.YT.Player as any).mock.calls[0][1].events.onStateChange

      // Trigger buffering state
      act(() => {
        onStateChange({ data: window.YT.PlayerState.BUFFERING, target: mockYTPlayer })
      })

      expect(screen.getByText('Loading YouTube video...')).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('should auto-resume when paused', async () => {
      vi.useFakeTimers()

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const onStateChange = (window.YT.Player as any).mock.calls[0][1].events.onStateChange

      // Trigger paused state
      act(() => {
        onStateChange({ data: window.YT.PlayerState.PAUSED, target: mockYTPlayer })
      })

      // Advance past retry interval
      await act(async () => {
        vi.advanceTimersByTime(YOUTUBE_CONFIG.PAUSE_RECHECK_INTERVAL + 100)
      })

      expect(mockYTPlayer.playVideo).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should handle video ended state', async () => {
      vi.useFakeTimers()

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const onStateChange = (window.YT.Player as any).mock.calls[0][1].events.onStateChange

      // Trigger ended state
      act(() => {
        onStateChange({ data: window.YT.PlayerState.ENDED, target: mockYTPlayer })
      })

      // Video should loop (based on current implementation)
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument()

      vi.useRealTimers()
    })
  })

  describe('Fullscreen Functionality', () => {
    it('should render fullscreen button', async () => {
      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await waitFor(() => {
        expect(screen.getByText('Fullscreen')).toBeInTheDocument()
      })
    })

    it('should toggle fullscreen on button click', async () => {
      const mockRequestFullscreen = vi.fn()
      const mockExitFullscreen = vi.fn()

      document.documentElement.requestFullscreen = mockRequestFullscreen
      document.exitFullscreen = mockExitFullscreen

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      const fullscreenButton = await screen.findByText('Fullscreen')

      await userEvent.click(fullscreenButton)

      expect(mockRequestFullscreen).toHaveBeenCalled()
    })

    it('should toggle fullscreen on double click', async () => {
      const mockRequestFullscreen = vi.fn()

      render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await waitFor(() => {
        const playerContainer = document.querySelector('[style*="position: fixed"]')
        expect(playerContainer).toBeInTheDocument()
      })

      const playerContainer = document.querySelector('[style*="position: fixed"]') as HTMLElement
      playerContainer.requestFullscreen = mockRequestFullscreen

      await userEvent.dblClick(playerContainer)

      expect(mockRequestFullscreen).toHaveBeenCalled()
    })
  })

  describe('Timer Management', () => {
    it('should clear all timers on cleanup', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const { unmount } = render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      unmount()

      // Should clear multiple timers
      expect(clearTimeoutSpy).toHaveBeenCalled()
      expect(clearIntervalSpy).toHaveBeenCalled()

      clearTimeoutSpy.mockRestore()
      clearIntervalSpy.mockRestore()
    })

    it('should destroy player on unmount', async () => {
      vi.useFakeTimers()

      const { unmount } = render(<Render />)

      act(() => {
        mockSubscribeCallback('https://www.youtube.com/watch?v=test123')
      })

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      unmount()

      expect(mockYTPlayer.destroy).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })
})