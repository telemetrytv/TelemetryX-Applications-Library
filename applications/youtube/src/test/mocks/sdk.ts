import { vi } from 'vitest'

export const store = vi.fn(() => ({
  application: {
    get: vi.fn(),
    set: vi.fn(),
    subscribe: vi.fn()
  }
}))