import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { getStatus, streamChat } from '../utils/api'
import { classifyIntent } from '../utils/intentService'
import { localReply } from '../lib/localTutor'
import { contentForAi, practiceSummary } from '../lib/practice'

const HISTORY_FOR_AI = 12 // recent messages sent with each request
const HISTORY_SAVED = 200 // per subject, to keep localStorage bounded

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Chat state for one subject: history (persisted per subject), streaming
 * replies from the AI backend, and a local demo-mode tutor when no AI key is
 * configured.
 */
export function useChat({ subject, learningStyle, games, progress }) {
  const [messages, setMessages] = useLocalStorage(`sveti-messages-${subject}`, [])
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState({ live: null, model: null }) // live: null = checking
  const abortRef = useRef(null)

  const list = useMemo(() => (Array.isArray(messages) ? messages : []), [messages])

  useEffect(() => {
    let cancelled = false
    getStatus().then((s) => !cancelled && setStatus(s))
    return () => {
      cancelled = true
    }
  }, [])

  // Stop any in-flight reply when the subject changes or the app unmounts.
  useEffect(() => () => abortRef.current?.abort(), [subject])

  const patch = useCallback(
    (id, fields) => setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...fields } : m))),
    [setMessages],
  )

  const sendMessage = useCallback(
    async (content, action = null) => {
      const text = content?.trim()
      if (!text || isLoading) return

      const userMsg = { id: newId(), role: 'user', content: text, timestamp: Date.now() }
      const replyId = newId()
      const history = [...list, userMsg]
      setMessages([...history, { id: replyId, role: 'assistant', content: '', timestamp: Date.now(), pending: true, game: games[0] || '' }].slice(-HISTORY_SAVED))
      setIsLoading(true)

      const offline = async (note) => {
        await sleep(450) // a beat, so the reply doesn't feel pasted in
        patch(replyId, { content: localReply({ text, subject, games }), pending: false, local: true, note })
      }

      try {
        if (!status.live) {
          await offline()
          return
        }

        const { intent, confidence } = await classifyIntent(text)
        const controller = new AbortController()
        abortRef.current = controller

        const full = await streamChat(
          {
            subject,
            learningStyle,
            action,
            games,
            intent: confidence > 0.5 ? intent : null,
            practice: practiceSummary(progress),
            messages: history
              .filter((m) => m.content && !m.error)
              .slice(-HISTORY_FOR_AI)
              .map((m) => ({ role: m.role, content: contentForAi(m) })),
          },
          { signal: controller.signal, onText: (t) => patch(replyId, { content: t }) },
        )
        patch(replyId, { content: full, pending: false })
      } catch (error) {
        if (error.name === 'AbortError') {
          // Stopped by the student: keep whatever was written so far.
          setMessages((prev) =>
            prev.flatMap((m) => (m.id !== replyId ? [m] : m.content ? [{ ...m, pending: false }] : [])),
          )
        } else if (error.status === 503) {
          // The server lost its key since we last checked: switch to demo mode.
          setStatus((s) => ({ ...s, live: false }))
          await offline()
        } else {
          patch(replyId, { content: error.message || 'Something went wrong. Please try again.', pending: false, error: true })
        }
      } finally {
        abortRef.current = null
        setIsLoading(false)
      }
    },
    [isLoading, list, setMessages, patch, status.live, subject, learningStyle, games, progress],
  )

  /** Remember how the student did on an exercise embedded in a message. */
  const setQuestResult = useCallback(
    (messageId, index, result) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, questResults: { ...m.questResults, [index]: result } } : m)),
      ),
    [setMessages],
  )

  const stop = useCallback(() => abortRef.current?.abort(), [])

  const clearMessages = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
  }, [setMessages])

  return { messages: list, isLoading, status, sendMessage, stop, clearMessages, setQuestResult }
}
