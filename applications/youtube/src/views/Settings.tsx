import './Settings.css'

import { useEffect, useState } from 'react'
import { store } from '@telemetryx/sdk'
import { YouTubeUtils } from '../utils/youtube'

export function Settings() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isLoadingValue, setIsLoadingValue] = useState(true)
  const [validationError, setValidationError] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(false)

  const fetchYoutubeUrlEffect = () => {
    (async () => {
      const defaultUrl = ''
      let url = await store().application.get('youtubeUrl')
      if (!url) await store().application.set('youtubeUrl', defaultUrl)
      setYoutubeUrl(typeof url === 'string' ? url : defaultUrl)
      setIsLoadingValue(false)
    })().catch(console.error)
  }

  useEffect(fetchYoutubeUrlEffect, [])

  const handleYoutubeUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value
    setYoutubeUrl(newUrl)

    // Validate URL in real-time
    if (newUrl.trim()) {
      const validation = YouTubeUtils.validateURL(newUrl)
      setValidationError(validation.error || '')
      setIsValidUrl(validation.isValid)

      // Only store valid URLs
      if (validation.isValid) {
        store().application.set('youtubeUrl', newUrl).catch(console.error)
      }
    } else {
      setValidationError('')
      setIsValidUrl(false)
      store().application.set('youtubeUrl', '').catch(console.error)
    }
  }

  return (
    <div className="settings">
      <div className="form-field">
        <div className="form-field-label">YouTube URL</div>
        <div className="form-field-frame">
          <input
            className={`form-field-input ${validationError ? 'error' : isValidUrl ? 'success' : ''}`}
            type="text"
            value={youtubeUrl}
            onChange={handleYoutubeUrlChange}
            disabled={isLoadingValue}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        {validationError && (
          <div className="validation-error">{validationError}</div>
        )}
        {isValidUrl && !validationError && (
          <div className="validation-success">✓ Valid YouTube video URL</div>
        )}
      </div>
    </div>
  )
}
