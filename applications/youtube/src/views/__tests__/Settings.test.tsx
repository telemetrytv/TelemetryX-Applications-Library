import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from '../Settings'
import { store } from '@telemetryx/sdk'

// Mock the SDK store
vi.mock('@telemetryx/sdk', () => ({
  store: vi.fn()
}))

// Mock YouTube utils
vi.mock('../../utils/youtube', () => ({
  YouTubeUtils: {
    validateURL: vi.fn()
  }
}))

import { YouTubeUtils } from '../../utils/youtube'

describe('Settings Component', () => {
  let mockStore: any

  beforeEach(() => {
    mockStore = {
      application: {
        get: vi.fn(),
        set: vi.fn().mockResolvedValue(undefined)
      }
    }
    ;(store as any).mockReturnValue(mockStore)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the settings form', () => {
    mockStore.application.get.mockResolvedValue('')

    render(<Settings />)

    expect(screen.getByText('YouTube URL')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')).toBeInTheDocument()
  })

  it('should load saved URL from store on mount', async () => {
    const savedUrl = 'https://www.youtube.com/watch?v=test123'
    mockStore.application.get.mockResolvedValue(savedUrl)

    render(<Settings />)

    await waitFor(() => {
      const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...') as HTMLInputElement
      expect(input.value).toBe(savedUrl)
    })

    expect(mockStore.application.get).toHaveBeenCalledWith('youtubeUrl')
  })

  it('should validate URL on input change', async () => {
    mockStore.application.get.mockResolvedValue('')
    ;(YouTubeUtils.validateURL as any).mockReturnValue({
      isValid: true,
      error: undefined
    })

    render(<Settings />)

    const input = await screen.findByPlaceholderText('https://www.youtube.com/watch?v=...')
    const testUrl = 'https://www.youtube.com/watch?v=valid123'

    await userEvent.type(input, testUrl)

    expect(YouTubeUtils.validateURL).toHaveBeenCalledWith(testUrl)
  })

  it('should show validation success for valid URLs', async () => {
    mockStore.application.get.mockResolvedValue('')
    ;(YouTubeUtils.validateURL as any).mockReturnValue({
      isValid: true,
      error: undefined
    })

    render(<Settings />)

    const input = await screen.findByPlaceholderText('https://www.youtube.com/watch?v=...')
    await userEvent.type(input, 'https://www.youtube.com/watch?v=valid123')

    await waitFor(() => {
      expect(screen.getByText('✓ Valid YouTube video URL')).toBeInTheDocument()
    })
  })

  it('should show validation error for invalid URLs', async () => {
    mockStore.application.get.mockResolvedValue('')
    const errorMessage = 'Not a valid YouTube URL'
    ;(YouTubeUtils.validateURL as any).mockReturnValue({
      isValid: false,
      error: errorMessage
    })

    render(<Settings />)

    const input = await screen.findByPlaceholderText('https://www.youtube.com/watch?v=...')
    await userEvent.type(input, 'https://invalid-url.com')

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should save valid URLs to store', async () => {
    mockStore.application.get.mockResolvedValue('')
    ;(YouTubeUtils.validateURL as any).mockReturnValue({
      isValid: true,
      error: undefined
    })

    render(<Settings />)

    const input = await screen.findByPlaceholderText('https://www.youtube.com/watch?v=...')
    const validUrl = 'https://www.youtube.com/watch?v=valid123'

    await userEvent.type(input, validUrl)

    await waitFor(() => {
      expect(mockStore.application.set).toHaveBeenCalledWith('youtubeUrl', validUrl)
    })
  })

  it('should not save invalid URLs to store', async () => {
    mockStore.application.get.mockResolvedValue('')
    ;(YouTubeUtils.validateURL as any).mockReturnValue({
      isValid: false,
      error: 'Invalid URL'
    })

    render(<Settings />)

    const input = await screen.findByPlaceholderText('https://www.youtube.com/watch?v=...')
    await userEvent.type(input, 'invalid-url')

    await waitFor(() => {
      expect(mockStore.application.set).not.toHaveBeenCalledWith('youtubeUrl', 'invalid-url')
    })
  })

  it('should clear error when input is cleared', async () => {
    mockStore.application.get.mockResolvedValue('')
    ;(YouTubeUtils.validateURL as any)
      .mockReturnValueOnce({ isValid: false, error: 'Invalid URL' })
      .mockReturnValueOnce({ isValid: false, error: 'Please enter a YouTube URL' })

    render(<Settings />)

    const input = await screen.findByPlaceholderText('https://www.youtube.com/watch?v=...')

    // Type invalid URL
    await userEvent.type(input, 'invalid')
    expect(screen.getByText('Invalid URL')).toBeInTheDocument()

    // Clear input
    await userEvent.clear(input)

    await waitFor(() => {
      expect(screen.queryByText('Invalid URL')).not.toBeInTheDocument()
    })
  })

  it('should apply success CSS class for valid URLs', async () => {
    mockStore.application.get.mockResolvedValue('')
    ;(YouTubeUtils.validateURL as any).mockReturnValue({
      isValid: true,
      error: undefined
    })

    render(<Settings />)

    const input = await screen.findByPlaceholderText('https://www.youtube.com/watch?v=...')
    await userEvent.type(input, 'https://www.youtube.com/watch?v=valid123')

    await waitFor(() => {
      expect(input).toHaveClass('success')
    })
  })

  it('should apply error CSS class for invalid URLs', async () => {
    mockStore.application.get.mockResolvedValue('')
    ;(YouTubeUtils.validateURL as any).mockReturnValue({
      isValid: false,
      error: 'Invalid URL'
    })

    render(<Settings />)

    const input = await screen.findByPlaceholderText('https://www.youtube.com/watch?v=...')
    await userEvent.type(input, 'invalid-url')

    await waitFor(() => {
      expect(input).toHaveClass('error')
    })
  })

  it('should handle store errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockStore.application.get.mockRejectedValue(new Error('Store error'))

    render(<Settings />)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
  })
})