import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { normalizeGamePrefs, resolveGame } from '../config/games'

/**
 * The player's favorite games (up to 3), persisted in localStorage.
 * `asked` records that the picker has been shown once, so onboarding doesn't
 * nag on every visit.
 */
export function useGamePrefs() {
  const [stored, setStored] = useLocalStorage('sveti-game-prefs', [])
  const [asked, setAsked] = useLocalStorage('sveti-game-asked', false)

  const games = useMemo(() => normalizeGamePrefs(stored), [stored])
  const packs = useMemo(() => games.map(resolveGame), [games])

  const setGames = useCallback(
    (list) => {
      setStored(normalizeGamePrefs(list))
      setAsked(true)
    },
    [setStored, setAsked],
  )

  return { games, packs, setGames, asked: asked === true || asked === 'true', setAsked }
}
