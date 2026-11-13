import { useEffect, useRef, useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { GAMES, MAX_GAMES, cleanGameName, findGame, normalizeGamePrefs } from '../config/games'

/**
 * Modal for choosing up to three favorite games. Catalogue games come with
 * fact sheets and hand-written quests; anything else can be typed in and the
 * AI tutor uses its own knowledge of it.
 */
export default function GamePicker({ initial, onSave, onClose, firstRun = false }) {
  const [selected, setSelected] = useState(() => normalizeGamePrefs(initial))
  const [custom, setCustom] = useState('')
  const dialogRef = useRef(null)

  const full = selected.length >= MAX_GAMES
  const customGames = selected.filter((name) => !findGame(name))

  useEffect(() => {
    dialogRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggle = (name) =>
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : full ? prev : [...prev, name]))

  const addCustom = (e) => {
    e.preventDefault()
    const name = cleanGameName(custom)
    if (!name || full) return
    setSelected((prev) => normalizeGamePrefs([...prev, name]))
    setCustom('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        tabIndex={-1}
        className="flex max-h-[92dvh] w-full max-w-2xl animate-rise flex-col rounded-t-3xl border border-line bg-panel shadow-2xl focus:outline-none sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
          <div>
            <h2 id="picker-title" className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              {firstRun ? 'What do you play?' : 'Your games'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Pick up to {MAX_GAMES}. Sveti will explain things and build practice quests using them.
            </p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn -mr-2 -mt-2" aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="scroll-thin flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {GAMES.map((game) => {
              const on = selected.includes(game.name)
              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => toggle(game.name)}
                  aria-pressed={on}
                  disabled={!on && full}
                  className={`relative rounded-2xl border p-3.5 text-left transition disabled:opacity-40 ${
                    on ? 'bg-raised' : 'border-line bg-bg hover:border-muted/60'
                  }`}
                  style={on ? { borderColor: game.tint, boxShadow: `0 0 0 1px ${game.tint}` } : undefined}
                >
                  {on && (
                    <span className="absolute right-2.5 top-2.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-on-accent" style={{ backgroundColor: game.tint }}>
                      <Check size={13} strokeWidth={3.5} />
                    </span>
                  )}
                  <div className="text-2xl" aria-hidden="true">
                    {game.emoji}
                  </div>
                  <div className="mt-2 text-sm font-semibold leading-tight">{game.name}</div>
                  <div className="mt-0.5 text-xs text-muted">{game.genre}</div>
                </button>
              )
            })}
          </div>

          <form onSubmit={addCustom} className="mt-5">
            <label htmlFor="custom-game" className="label">
              Play something else?
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="custom-game"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                maxLength={40}
                disabled={full}
                placeholder={full ? `That's ${MAX_GAMES} — remove one to add another` : 'Type any game, e.g. Hollow Knight'}
                className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3.5 text-sm text-fg placeholder:text-muted focus:border-accent/70 focus:outline-none disabled:opacity-60"
              />
              <button type="submit" disabled={full || !custom.trim()} className="btn-ghost h-11">
                <Plus size={16} /> Add
              </button>
            </div>
            {customGames.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {customGames.map((name) => (
                  <span key={name} className="inline-flex items-center gap-1 rounded-full border border-accent/50 bg-accent/10 py-1 pl-3 pr-1 text-xs font-semibold">
                    🎮 {name}
                    <button type="button" onClick={() => toggle(name)} className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted hover:bg-raised hover:text-fg" aria-label={`Remove ${name}`}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </form>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line p-4 sm:px-6">
          <span className="text-sm text-muted">
            {selected.length} of {MAX_GAMES} selected
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              {firstRun ? 'Skip for now' : 'Cancel'}
            </button>
            <button type="button" onClick={() => onSave(selected)} className="btn-primary">
              {firstRun ? "Let's go" : 'Save'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
