/**
 * One front door for all practice: algebra quests (typed numeric answers) and
 * English drills (multiple choice). Also handles the `[[quest:topic:level]]`
 * markers the tutor uses to place a live, auto-graded exercise in the chat.
 */
import { TOPICS, LEVELS, generateQuest, questXp } from './quests.js'
import { SKILLS, generateDrill } from './drills.js'
import { hashSeed } from './rng.js'

export const PRACTICE = { algebra: TOPICS, english: SKILLS }

const ALL = [
  ...TOPICS.map((t) => ({ ...t, subject: 'algebra' })),
  ...SKILLS.map((t) => ({ ...t, subject: 'english' })),
]

/** Topic metadata by id, or null. */
export const topicInfo = (id) => ALL.find((t) => t.id === id) || null

export const topicsFor = (subject) => PRACTICE[subject] || TOPICS

/** Generate a quest or drill for any topic id. */
export function makePractice({ topic, level = 1, game = '', seed } = {}) {
  const info = topicInfo(topic)
  return info?.subject === 'english'
    ? generateDrill({ game, topic, seed })
    : { kind: 'number', ...generateQuest({ game, topic, level, seed }) }
}

/** XP earned for a finished exercise of either kind. */
export const practiceXp = (item, result) => questXp({ level: item.level, ...result })

/** Plain-text version of an exercise (for the AI, and for "Ask Sveti"). */
export function describePractice(item) {
  if (item.kind === 'choice') {
    const options = item.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join('  ')
    return `${item.ask}${item.sentence ? ` "${item.sentence}"` : ''} Options: ${options}`
  }
  return `${item.story.replace(/\*\*/g, '')} ${item.ask}`
}

/** The message a student sends when they ask the tutor about an exercise. */
export function practiceToPrompt(item) {
  const where = item.game.id === 'generic' ? '' : `${item.game.name} `
  return `I'm stuck on this ${where}${item.kind === 'choice' ? 'question' : 'quest'}:\n\n${describePractice(item)}\n\nCan you help me figure out how to start?`
}

// ---------------------------------------------------------------------------
// Chat markers
// ---------------------------------------------------------------------------

const MARKER = /\[\[quest:([a-z]+)(?::([1-3]))?\]\]/g

/**
 * Split a tutor message into text and exercise parts.
 * `[[quest:percent:2]]` -> { type: 'quest', topic: 'percent', level: 2, index }
 * Unknown topics are dropped. While a reply is still streaming, a half-written
 * marker at the end is hidden.
 */
export function splitContent(text, { streaming = false } = {}) {
  let source = String(text || '')
  if (streaming) source = source.replace(/\[\[?[a-z:0-9]*$/, '')

  const parts = []
  let last = 0
  let index = 0
  for (const match of source.matchAll(MARKER)) {
    const before = source.slice(last, match.index)
    if (before.trim()) parts.push({ type: 'text', text: before })
    if (topicInfo(match[1])) parts.push({ type: 'quest', topic: match[1], level: Number(match[2]) || 1, index: index++ })
    last = match.index + match[0].length
  }
  const rest = source.slice(last)
  if (rest.trim()) parts.push({ type: 'text', text: rest })
  return parts
}

/** The exercise a marker stands for. Stable for a given message and position. */
export function practiceForMarker(message, part) {
  return makePractice({
    topic: part.topic,
    level: part.level,
    game: message.game || '',
    seed: hashSeed(`${message.id}:${part.index}`),
  })
}

const outcomeText = (r) => {
  if (!r) return 'not answered yet'
  const tries = `${r.attempts} ${r.attempts === 1 ? 'attempt' : 'attempts'}`
  const hints = r.hints ? `, ${r.hints} ${r.hints === 1 ? 'hint' : 'hints'}` : ''
  return r.outcome === 'solved' ? `solved (${tries}${hints})` : `gave up and viewed the solution (${tries}${hints})`
}

/**
 * Rewrite a tutor message for the AI's own history: each marker becomes the
 * actual exercise the student saw, plus how they did on it.
 */
export function contentForAi(message) {
  if (message.role !== 'assistant' || !message.content.includes('[[quest:')) return message.content
  return splitContent(message.content)
    .map((part) => {
      if (part.type === 'text') return part.text.trim()
      const item = practiceForMarker(message, part)
      const result = message.questResults?.[part.index]
      return `[Interactive exercise shown to the student — ${topicInfo(item.topic).name}: ${describePractice(item)} Correct answer: ${item.answer}. Student result: ${outcomeText(result)}.]`
    })
    .join('\n\n')
}

/**
 * Compact practice record sent with each chat request so the tutor knows what
 * the student has been working on.
 */
export function practiceSummary(progress) {
  return {
    topics: progress.topics || {},
    recent: (progress.recent || []).slice(-5),
  }
}

/** Human-readable practice record for the system prompt. Returns '' if empty. */
export function formatPracticeRecord(record) {
  if (!record || typeof record !== 'object') return ''
  const clamp = (v) => Math.max(0, Math.min(9999, Math.round(Number(v)) || 0))

  const lines = []
  for (const t of ALL) {
    const s = record.topics?.[t.id]
    if (!s) continue
    const solved = clamp(s.solved)
    const missed = clamp(s.missed)
    if (solved + missed) lines.push(`- ${t.name}: ${solved} solved, ${missed} gave up`)
  }

  const recent = (Array.isArray(record.recent) ? record.recent : [])
    .slice(-5)
    .filter((r) => r && topicInfo(r.topic))
    .map((r) => {
      const info = topicInfo(r.topic)
      const level = info.subject === 'algebra' ? ` (${LEVELS[clamp(r.level) - 1]?.name || 'Easy'})` : ''
      return `- ${info.name}${level}: ${outcomeText({ outcome: r.outcome === 'solved' ? 'solved' : 'revealed', attempts: clamp(r.attempts), hints: clamp(r.hints) })}`
    })

  if (!lines.length && !recent.length) return ''
  return [
    lines.length ? `Totals\n${lines.join('\n')}` : '',
    recent.length ? `Most recent (oldest first)\n${recent.join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}
