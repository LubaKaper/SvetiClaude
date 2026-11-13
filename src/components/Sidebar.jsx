import { BookOpen, Eye, Flame, HelpCircle, ListChecks, Moon, Pencil, Sparkles, Sun, X } from 'lucide-react'
import Logo from './Logo'
import { getAllStyles } from '../config/learningStyles'
import { SUBJECTS } from '../config/prompts'

const STYLE_ICONS = { visual: Eye, reading: BookOpen, examples: ListChecks, socratic: HelpCircle, analogies: Sparkles }

/** Navigation rail: player progress, games, subject and learning style. */
export default function Sidebar({
  open, onClose, progress, packs, onPickGames,
  subject, onSubject, learningStyle, onLearningStyle, theme, onToggleTheme,
}) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-line bg-panel transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Settings and progress"
      >
        <div className="flex items-center justify-between p-5 pb-4">
          <Logo />
          <button type="button" onClick={onClose} className="icon-btn lg:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="scroll-thin flex-1 space-y-6 overflow-y-auto px-5 pb-5">
          {/* Player card */}
          <section className="rounded-2xl border border-line bg-bg p-4" aria-label="Your progress">
            <div className="flex items-center justify-between">
              <div>
                <div className="label">Level {progress.level}</div>
                <div className="font-display text-lg font-bold leading-tight">{progress.rank}</div>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-sm font-semibold" title="Quest streak">
                <Flame size={14} className={progress.streak ? 'text-accent-text' : 'text-muted'} />
                {progress.streak}
              </div>
            </div>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-raised"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={progress.perLevel}
              aria-valuenow={progress.intoLevel}
              aria-label="XP toward next level"
            >
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(progress.intoLevel / progress.perLevel) * 100}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-muted">
              <span className="font-semibold tabular-nums text-accent-text">{progress.xp} XP</span>
              <span>{progress.perLevel - progress.intoLevel} to level {progress.level + 1}</span>
            </div>
          </section>

          {/* Games */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="label">Your games</h2>
              {packs.length > 0 && (
                <button type="button" onClick={onPickGames} className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-fg">
                  <Pencil size={12} /> Edit
                </button>
              )}
            </div>
            {packs.length ? (
              <ul className="space-y-1.5">
                {packs.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-2.5 rounded-xl border border-line bg-bg px-3 py-2 text-sm font-medium">
                    <span className="h-6 w-1 rounded-full" style={{ backgroundColor: p.tint }} />
                    <span aria-hidden="true">{p.emoji}</span>
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    {i === 0 && <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">main</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <button type="button" onClick={onPickGames} className="w-full rounded-xl border border-dashed border-accent/50 bg-accent/5 px-3 py-3 text-left text-sm font-medium hover:bg-accent/10">
                🎮 Pick your games
                <span className="mt-0.5 block text-xs font-normal text-muted">so examples come from what you play</span>
              </button>
            )}
          </section>

          {/* Subject */}
          <section>
            <h2 className="label mb-2">Subject</h2>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-bg p-1" role="group" aria-label="Subject">
              {Object.values(SUBJECTS).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSubject(s.id)}
                  aria-pressed={subject === s.id}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    subject === s.id ? 'bg-accent text-on-accent' : 'text-muted hover:text-fg'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </section>

          {/* Learning style */}
          <section>
            <h2 className="label mb-2">How you like to learn</h2>
            <div className="space-y-1" role="radiogroup" aria-label="Learning style">
              {getAllStyles().map((style) => {
                const Icon = STYLE_ICONS[style.id]
                const on = learningStyle === style.id
                return (
                  <button
                    key={style.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => onLearningStyle(style.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                      on ? 'border-accent/60 bg-accent/10' : 'border-transparent hover:bg-raised'
                    }`}
                  >
                    <Icon size={17} className={on ? 'text-accent-text' : 'text-muted'} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight">{style.name}</span>
                      <span className="block truncate text-xs text-muted">{style.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <div className="border-t border-line p-3">
          <button type="button" onClick={onToggleTheme} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-raised hover:text-fg">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>
    </>
  )
}
