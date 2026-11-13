import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

const XP_PER_LEVEL = 100
const RANKS = ['Rookie', 'Apprentice', 'Adventurer', 'Strategist', 'Champion', 'Legend']
const EMPTY = { xp: 0, streak: 0, best: 0, solved: 0 }

/** XP, level and streak earned from quests, persisted in localStorage. */
export function useProgress() {
  const [progress, setProgress] = useLocalStorage('sveti-progress', EMPTY)
  const safe = { ...EMPTY, ...(progress && typeof progress === 'object' ? progress : {}) }

  /** Record a solved quest. */
  const award = useCallback(
    (xp) => {
      setProgress((prev) => {
        const p = { ...EMPTY, ...prev }
        const streak = p.streak + 1
        return { xp: p.xp + xp, streak, best: Math.max(p.best, streak), solved: p.solved + 1 }
      })
    },
    [setProgress],
  )

  /** Revealing a solution ends the current streak. */
  const breakStreak = useCallback(() => {
    setProgress((prev) => ({ ...EMPTY, ...prev, streak: 0 }))
  }, [setProgress])

  const derived = useMemo(() => {
    const level = Math.floor(safe.xp / XP_PER_LEVEL) + 1
    return {
      level,
      rank: RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 2))],
      intoLevel: safe.xp % XP_PER_LEVEL,
      perLevel: XP_PER_LEVEL,
    }
  }, [safe.xp])

  return { ...safe, ...derived, award, breakStreak }
}
