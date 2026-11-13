/**
 * Intent classification for a student message.
 *
 * By default this uses the built-in rules in `src/lib/intent.js`. If
 * `VITE_INTENT_SERVICE_URL` is set (e.g. http://localhost:8000/classify), the
 * optional Python service in `server-python/` is tried first, with the
 * built-in rules as the fallback if it is slow or unreachable.
 */
import { classifyIntent as classifyLocally } from '../lib/intent.js'

const SERVICE_URL = import.meta.env?.VITE_INTENT_SERVICE_URL || ''

/**
 * @param {string} text
 * @returns {Promise<{intent: string, confidence: number}>}
 */
export async function classifyIntent(text) {
  if (SERVICE_URL) {
    try {
      const res = await fetch(SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(1500),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.intent) return { intent: data.intent, confidence: Number(data.confidence) || 0 }
      }
    } catch {
      // fall through to the built-in classifier
    }
  }
  return classifyLocally(text)
}
