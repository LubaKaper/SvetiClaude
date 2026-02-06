/**
 * Client for the Python intent classification microservice.
 *
 * Calls POST http://localhost:8000/classify with the student's message.
 * Returns { intent, confidence, rationale } on success, or null on any error.
 *
 * The frontend treats null as "service unavailable" and continues without
 * intent data — the app works identically whether the service is running or not.
 */

const INTENT_SERVICE_URL = 'http://localhost:8000/classify'

/**
 * Classify the intent of a student message.
 * @param {string} text - The raw message text
 * @returns {Promise<{intent: string, confidence: number, rationale: string} | null>}
 */
export async function classifyIntent(text) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2s timeout

    const res = await fetch(INTENT_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!res.ok) return null
    return await res.json()
  } catch {
    // Server down, timeout, network error → silent fallback
    return null
  }
}
