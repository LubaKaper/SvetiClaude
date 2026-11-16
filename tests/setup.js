import { afterEach } from 'vitest'

// UI tests only (jsdom): add DOM matchers and reset the page between tests.
if (typeof document !== 'undefined') {
  await import('@testing-library/jest-dom/vitest')
  const { cleanup } = await import('@testing-library/react')
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })
}
