/**
 * Chat backend core, shared by the Vercel function (`api/chat.js`) and the
 * Vite dev server (`vite.config.js`).
 *
 * The API key stays on the server. The browser sends a small structured
 * request (subject, style, games, recent messages); the system prompt is built
 * here so the endpoint can't be repurposed as a general-purpose AI proxy.
 */
import OpenAI from 'openai'
import { buildSystemPrompt, SUBJECTS, DEFAULT_SUBJECT } from '../src/config/prompts.js'
import { learningStyles, DEFAULT_STYLE } from '../src/config/learningStyles.js'
import { normalizeGamePrefs } from '../src/config/games.js'

const DEFAULT_MODEL = 'gpt-4o-mini'
const MAX_MESSAGES = 16
const MAX_MESSAGE_CHARS = 4000
const MAX_OUTPUT_TOKENS = 900
const PLACEHOLDER_KEY = 'sk-your-key-goes-here'

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function getKey(env) {
  // VITE_OPENAI_API_KEY is accepted so existing setups keep working. It is only
  // read here on the server and is no longer bundled into the browser.
  const key = (env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || '').trim()
  return key && key !== PLACEHOLDER_KEY ? key : null
}

const getModel = (env) => (env.OPENAI_MODEL || DEFAULT_MODEL).trim()

/** Is a real AI model available? The UI uses this to show Live vs Demo mode. */
export function getStatus(env = process.env) {
  return { live: Boolean(getKey(env)), model: getModel(env) }
}

/** Validate and normalise the request body. Throws HttpError(400) on bad input. */
export function parseRequest(body) {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Request body must be JSON.')

  const messages = Array.isArray(body.messages) ? body.messages : null
  if (!messages || messages.length === 0) throw new HttpError(400, 'messages must be a non-empty array.')

  const clean = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }))

  if (!clean.length || clean[clean.length - 1].role !== 'user') {
    throw new HttpError(400, 'The last message must be from the student.')
  }

  const subject = SUBJECTS[body.subject] ? body.subject : DEFAULT_SUBJECT
  return {
    messages: clean,
    subject,
    learningStyle: learningStyles[body.learningStyle] ? body.learningStyle : DEFAULT_STYLE,
    action: typeof body.action === 'string' && SUBJECTS[subject].actions[body.action] ? body.action : null,
    intent: typeof body.intent === 'string' ? body.intent.slice(0, 40) : null,
    games: normalizeGamePrefs(body.games),
  }
}

function friendlyError(error) {
  const status = error?.status
  if (status === 401) return new HttpError(502, 'The AI key on the server was rejected. Check OPENAI_API_KEY.')
  if (status === 429) return new HttpError(429, 'Sveti is getting a lot of questions right now. Try again in a moment.')
  if (status === 402 || error?.code === 'insufficient_quota') return new HttpError(502, 'The AI account is out of credit.')
  if (status === 404) return new HttpError(502, 'The configured AI model was not found. Check OPENAI_MODEL.')
  return new HttpError(502, 'The AI service is unavailable right now. Please try again.')
}

/**
 * Stream a tutor reply as plain text chunks.
 * Throws HttpError before the first chunk if the request can't be served.
 */
export async function* streamChat(body, env = process.env, { signal } = {}) {
  const key = getKey(env)
  if (!key) throw new HttpError(503, 'No AI key configured.')

  const request = parseRequest(body)
  const model = getModel(env)
  const client = new OpenAI({ apiKey: key, baseURL: env.OPENAI_BASE_URL || undefined, timeout: 30_000, maxRetries: 1 })

  let stream
  try {
    stream = await client.chat.completions.create(
      {
        model,
        stream: true,
        max_completion_tokens: MAX_OUTPUT_TOKENS,
        // Only the gpt-4 family accepts a custom temperature; newer reasoning
        // models reject it, so it is left at the default for anything else.
        ...(model.startsWith('gpt-4') ? { temperature: 0.5 } : {}),
        messages: [{ role: 'system', content: buildSystemPrompt(request) }, ...request.messages],
      },
      { signal },
    )
  } catch (error) {
    console.error('[sveti] AI request failed:', error?.status, error?.message)
    throw friendlyError(error)
  }

  for await (const chunk of stream) {
    const text = chunk.choices?.[0]?.delta?.content
    if (text) yield text
  }
}

/**
 * Framework-agnostic request handler for Node `(req, res)` servers.
 * GET  -> { live, model }
 * POST -> text/plain stream of the reply
 */
export async function handleChat(req, res, body, env = process.env) {
  const json = (status, data) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(JSON.stringify(data))
  }

  if (req.method === 'GET') return json(200, getStatus(env))
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed.' })

  const abort = new AbortController()
  res.on('close', () => abort.abort())

  let started = false
  try {
    for await (const text of streamChat(body, env, { signal: abort.signal })) {
      if (!started) {
        started = true
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('X-Accel-Buffering', 'no')
      }
      res.write(text)
    }
    if (!started) return json(502, { error: 'The AI returned an empty reply. Please try again.' })
    res.end()
  } catch (error) {
    if (abort.signal.aborted) return res.end()
    if (!started) {
      const status = error instanceof HttpError ? error.status : 500
      return json(status, { error: error instanceof HttpError ? error.message : 'Something went wrong.' })
    }
    console.error('[sveti] stream interrupted:', error?.message)
    res.end('\n\n*(The connection dropped before I could finish. Ask again and I\'ll pick it back up.)*')
  }
}
