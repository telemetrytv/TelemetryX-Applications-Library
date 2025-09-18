import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { YouTubeUtils } from '../youtube'

describe('YouTubeUtils', () => {
  describe('parseURL', () => {
    it('should parse valid YouTube video URL', () => {
      const result = YouTubeUtils.parseURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

      expect(result.isValid).toBe(true)
      expect(result.videoId).toBe('dQw4w9WgXcQ')
      expect(result.urlType).toBe('video')
      expect(result.embedUrl).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ')
    })

    it('should parse shortened YouTube URL', () => {
      const result = YouTubeUtils.parseURL('https://youtu.be/dQw4w9WgXcQ')

      expect(result.isValid).toBe(true)
      expect(result.videoId).toBe('dQw4w9WgXcQ')
      expect(result.urlType).toBe('video')
    })

    it('should handle invalid URL', () => {
      const result = YouTubeUtils.parseURL('not-a-url')

      expect(result.isValid).toBe(false)
      expect(result.videoId).toBeNull()
      expect(result.error).toBe('Not a valid YouTube URL')
    })

    it('should handle empty URL', () => {
      const result = YouTubeUtils.parseURL('')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid URL provided')
    })

    it('should detect playlist URLs', () => {
      const result = YouTubeUtils.parseURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf')

      expect(result.urlType).toBe('playlist')
    })

    it('should detect channel URLs', () => {
      const result = YouTubeUtils.parseURL('https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw')

      expect(result.urlType).toBe('channel')
      expect(result.isValid).toBe(false) // Channels not yet supported
      expect(result.error).toContain('Playlists and channels not yet supported')
    })
  })

  describe('isYouTubeURL', () => {
    it('should return true for valid YouTube URLs', () => {
      expect(YouTubeUtils.isYouTubeURL('https://www.youtube.com/watch?v=test')).toBe(true)
      expect(YouTubeUtils.isYouTubeURL('https://youtu.be/test')).toBe(true)
      expect(YouTubeUtils.isYouTubeURL('http://youtube.com/watch?v=test')).toBe(true)
      expect(YouTubeUtils.isYouTubeURL('www.youtube.com/watch?v=test')).toBe(true)
    })

    it('should return false for non-YouTube URLs', () => {
      expect(YouTubeUtils.isYouTubeURL('https://vimeo.com/123')).toBe(false)
      expect(YouTubeUtils.isYouTubeURL('https://google.com')).toBe(false)
      expect(YouTubeUtils.isYouTubeURL('not-a-url')).toBe(false)
    })
  })

  describe('extractVideoId', () => {
    it('should extract video ID from standard watch URL', () => {
      expect(YouTubeUtils.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    })

    it('should extract video ID from shortened URL', () => {
      expect(YouTubeUtils.extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    })

    it('should extract video ID from embed URL', () => {
      expect(YouTubeUtils.extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    })

    it('should return null for invalid video ID', () => {
      expect(YouTubeUtils.extractVideoId('https://www.youtube.com/watch?v=short')).toBeNull()
      expect(YouTubeUtils.extractVideoId('https://www.youtube.com/channel/123')).toBeNull()
    })
  })

  describe('extractStartTime', () => {
    it('should extract start time with t parameter', () => {
      expect(YouTubeUtils.extractStartTime('https://www.youtube.com/watch?v=test&t=30')).toBe(30)
      expect(YouTubeUtils.extractStartTime('https://www.youtube.com/watch?v=test&t=30s')).toBe(30)
    })

    it('should extract start time with start parameter', () => {
      expect(YouTubeUtils.extractStartTime('https://www.youtube.com/watch?v=test&start=45')).toBe(45)
    })

    it('should return 0 if no start time', () => {
      expect(YouTubeUtils.extractStartTime('https://www.youtube.com/watch?v=test')).toBe(0)
    })
  })

  describe('extractEndTime', () => {
    it('should extract end time', () => {
      expect(YouTubeUtils.extractEndTime('https://www.youtube.com/watch?v=test&end=120')).toBe(120)
    })

    it('should return 0 if no end time', () => {
      expect(YouTubeUtils.extractEndTime('https://www.youtube.com/watch?v=test')).toBe(0)
    })
  })

  describe('createEmbedUrl', () => {
    it('should create embed URL with autoplay and mute', () => {
      const url = YouTubeUtils.createEmbedUrl('dQw4w9WgXcQ')

      expect(url).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ')
      expect(url).toContain('autoplay=1')
      expect(url).toContain('mute=1')
      expect(url).toContain('controls=0')
      expect(url).toContain('rel=0')
    })

    it('should include start and end times from original URL', () => {
      const originalUrl = 'https://www.youtube.com/watch?v=test&start=30&end=120'
      const url = YouTubeUtils.createEmbedUrl('test', originalUrl)

      expect(url).toContain('start=30')
      expect(url).toContain('end=120')
    })
  })

  describe('validateURL', () => {
    it('should validate correct YouTube URLs', () => {
      const result = YouTubeUtils.validateURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should provide error for empty URL', () => {
      const result = YouTubeUtils.validateURL('')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Please enter a YouTube URL')
    })

    it('should provide error for invalid URL', () => {
      const result = YouTubeUtils.validateURL('https://vimeo.com/123')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Not a valid YouTube URL')
    })
  })

  describe('loadYouTubeAPI', () => {
    let originalYT: any

    beforeEach(() => {
      originalYT = (window as any).YT
      delete (window as any).YT
      document.head.innerHTML = ''
    })

    afterEach(() => {
      (window as any).YT = originalYT
      document.head.innerHTML = ''
    })

    it('should load YouTube API script', async () => {
      const loadPromise = YouTubeUtils.loadYouTubeAPI()

      // Simulate API ready
      setTimeout(() => {
        (window as any).YT = { Player: vi.fn() }
        if ((window as any).onYouTubeIframeAPIReady) {
          (window as any).onYouTubeIframeAPIReady()
        }
      }, 10)

      await expect(loadPromise).resolves.toBeUndefined()

      const script = document.getElementById('youtube-iframe-api')
      expect(script).toBeTruthy()
      expect(script?.getAttribute('src')).toBe('https://www.youtube.com/iframe_api')
    })

    it('should resolve immediately if API already loaded', async () => {
      (window as any).YT = { Player: vi.fn() }

      await expect(YouTubeUtils.loadYouTubeAPI()).resolves.toBeUndefined()
    })

    it('should handle existing script in DOM', async () => {
      const script = document.createElement('script')
      script.id = 'youtube-iframe-api'
      document.head.appendChild(script)

      const loadPromise = YouTubeUtils.loadYouTubeAPI()

      setTimeout(() => {
        if ((window as any).onYouTubeIframeAPIReady) {
          (window as any).onYouTubeIframeAPIReady()
        }
      }, 10)

      await expect(loadPromise).resolves.toBeUndefined()
    })
  })
})