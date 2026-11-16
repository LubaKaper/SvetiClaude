import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

const XP_PER_LEVEL = 100
const RECENT_KEPT = 12
const RANKS = ['Rookie', 'Apprentice', 'Adventurer', 'Strategist', 'Champion', 'Legend']
const EMPTY = { xp: 0, streak: 0, best: 0, solved: 0, topics: {}, recent: [] }

const normalize = (p) => {
  const base = { ...EMPTY, ...(p && typeof p === 'object' ? p : {}) }
  return {
    ...base,
    topics: base.topics && typeof base.topics === 'object' ? base.topics : {},
    recent: Array.isArray(base.recent) ? base.recent : [],
  }
}

/**
 * XP, level, streak and a per-topic practice record, persisted in
 * localStorage. The record is also what the AI tutor sees.
 */
export function useProgress() {
  const [stored, setStored] = useLocalStorage('sveti-progress', EMPTY)
  const progress = useMemo(() => normalize(stored), [stored])

  /**
   * Record a finished exercise.
   * @param {object} entry - { topic, level, game, outcome: 'solved' | 'revealed', xp, hints, attempts }
   */
  const record = useCallback(
    ({ topic, level = 1, game = '', outcome, xp = 0, hints = 0, attempts = 0 }) => {
      setStored((prev) => {
        const p = normalize(prev)
        const solved = outcome === 'solved'
        const streak = solved ? p.streak + 1 : 0
        const stats = { solved: 0, missed: 0, ...p.topics[topic] }
        return {
          xp: p.xp + (solved ? xp : 0),
          streak,
          best: Math.max(p.best, streak),
          solved: p.solved + (solved ? 1 : 0),
          topics: {
            ...p.topics,
            [topic]: { solved: stats.solved + (solved ? 1 : 0), missed: stats.missed + (solved ? 0 : 1) },
          },
          recent: [...p.recent, { topic, level, game, outcome, hints, attempts }].slice(-RECENT_KEPT),
        }
      })
    },
    [setStored],
  )

  const derived = useMemo(() => {
    const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1
    return {
      level,
      rank: RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 2))],
      intoLevel: progress.xp % XP_PER_LEVEL,
      perLevel: XP_PER_LEVEL,
    }
  }, [progress.xp])

  return useMemo(() => ({ ...progress, ...derived, record }), [progress, derived, record])
}
