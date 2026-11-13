/**
 * Browser client for Sveti's own backend (`/api/chat`).
 * The AI key lives on the server; nothing secret is bundled into the app.
 */

const ENDPOINT = '/api/chat'

/** Ask the server whether a real AI model is configured. Never throws. */
export async function getStatus() {
  try {
    const res = await fetch(ENDPOINT, { headers: { Accept: 'application/json' } })
    if (!res.ok) return { live: false, model: null }
    const data = await res.json()
    return { live: Boolean(data.live), model: data.model || null }
  } catch {
    return { live: false, model: null }
  }
}

/**
 * Send the conversation and stream the reply.
 * @param {object} payload - { messages, subject, learningStyle, action, intent, games }
 * @param {object} opts
 * @param {(fullText: string) => void} opts.onText - called as the reply grows
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<string>} the complete reply
 */
export async function streamChat(payload, { onText, signal } = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!res.ok || !res.body) {
    let message = 'Sveti could not be reached. Please try again.'
    try {
      message = (await res.json()).error || message
    } catch {
      // keep the default message
    }
    const error = new Error(message)
    error.status = res.status
    throw error
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    full += decoder.decode(value, { stream: true })
    onText?.(full)
  }
  full += decoder.decode()
  return full.trim()
}
