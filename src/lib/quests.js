/**
 * Quest engine: generates game-themed algebra problems and checks answers.
 * Everything here is deterministic local math — no AI involved — so answers
 * are always right and quests work offline.
 */
import { resolveGame } from '../config/games.js'

export const TOPICS = [
  { id: 'linear', name: 'Linear equations', blurb: 'Solve for the unknown' },
  { id: 'percent', name: 'Percentages', blurb: 'Discounts, rates and change' },
  { id: 'ratio', name: 'Ratios & proportions', blurb: 'Scale things up and down' },
  { id: 'fn', name: 'Linear functions', blurb: 'Rates, slopes and patterns' },
  { id: 'system', name: 'Systems of equations', blurb: 'Two unknowns, two clues' },
]

export const LEVELS = [
  { id: 1, name: 'Easy', xp: 10 },
  { id: 2, name: 'Medium', xp: 20 },
  { id: 3, name: 'Hard', xp: 30 },
]

/** Small seedable PRNG (mulberry32) so quests can be reproduced in tests. */
export function makeRng(seed = (Math.random() * 2 ** 32) >>> 0) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random helpers handed to game-pack scenarios. */
function helpers(rand, level) {
  return {
    level,
    int: (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1)),
    pick: (list) => list[Math.floor(rand() * list.length)],
    /** Choose a value by difficulty: by(easy, medium, hard). */
    by: (easy, medium, hard) => [easy, medium, hard][level - 1],
  }
}

/**
 * Build a quest.
 * @param {object} opts
 * @param {string} opts.game  - a game name from the player's preferences (or '')
 * @param {string} opts.topic - one of TOPICS ids
 * @param {number} opts.level - 1 (easy) to 3 (hard)
 * @param {number} [opts.seed]
 */
export function generateQuest({ game = '', topic = 'linear', level = 1, seed } = {}) {
  const pack = resolveGame(game)
  const lvl = Math.min(3, Math.max(1, Math.round(level) || 1))
  const scenario = pack.scenarios[topic] || pack.scenarios.linear
  const usedSeed = seed ?? (Math.random() * 2 ** 32) >>> 0
  const problem = scenario(helpers(makeRng(usedSeed), lvl))

  return {
    ...problem,
    id: `${pack.id}-${topic}-${lvl}-${usedSeed}`,
    topic: pack.scenarios[topic] ? topic : 'linear',
    level: lvl,
    game: { id: pack.id, name: pack.name, emoji: pack.emoji, tint: pack.tint },
  }
}

/**
 * Pull a number out of whatever the student typed.
 * Accepts "12", "x = 12", "12 trades", "1,200", "25%", "3/4", "-2.5", "₽600".
 * Returns null when there is no number to read.
 */
export function parseAnswer(input) {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null
  let text = String(input ?? '').trim().toLowerCase()
  if (!text) return null

  text = text
    .replace(/−/g, '-') // unicode minus
    .replace(/(\d),(?=\d{3}\b)/g, '$1') // thousands separators
    .replace(/^[a-z]\s*=\s*/, '') // leading "x ="

  const fraction = text.match(/(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)/)
  if (fraction) {
    const denominator = Number(fraction[2])
    return denominator === 0 ? null : Number(fraction[1]) / denominator
  }

  const number = text.match(/-?(?:\d+\.?\d*|\.\d+)/)
  return number ? Number(number[0]) : null
}

/** Is the typed answer right? Tolerates rounding to two decimal places. */
export function checkAnswer(quest, input) {
  const value = parseAnswer(input)
  if (value === null) return { ok: false, parsed: null }
  return { ok: Math.abs(value - quest.answer) <= 0.011, parsed: value }
}

/**
 * XP for a solved quest: base by difficulty, a bonus for a clean first try,
 * and a quarter off per hint. Revealing the solution earns nothing.
 */
export function questXp({ level, hintsUsed = 0, attempts = 1, revealed = false }) {
  if (revealed) return 0
  const base = LEVELS[level - 1]?.xp ?? 10
  const firstTry = attempts <= 1 && hintsUsed === 0 ? 5 : 0
  return Math.max(2, Math.round(base * (1 - 0.25 * Math.min(hintsUsed, 3)))) + firstTry
}

/** Plain-text version of a quest, for handing it to the AI tutor. */
export function questToPrompt(quest) {
  const story = quest.story.replace(/\*\*/g, '')
  return `I'm stuck on this ${quest.game.name} quest:\n\n${story} ${quest.ask}\n\nCan you help me figure out how to start?`
}
