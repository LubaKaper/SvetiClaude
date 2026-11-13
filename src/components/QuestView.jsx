import { useMemo, useState } from 'react'
import { Check, ChevronRight, Divide, Equal, Eye, Flame, Lightbulb, MessageCircle, Percent, RefreshCw, TrendingUp, Variable, X } from 'lucide-react'
import Markdown from './Markdown'
import { genericPack } from '../config/games'
import { LEVELS, TOPICS, checkAnswer, generateQuest, questToPrompt, questXp } from '../lib/quests'

const TOPIC_ICONS = { linear: Equal, percent: Percent, ratio: Divide, fn: TrendingUp, system: Variable }

const CHEERS = ['Nailed it!', 'GG!', 'Clean solve!', 'Critical hit!', 'Level cleared!']

const formatAnswer = (quest) =>
  `${quest.answer.toLocaleString('en-US')}${quest.unit === '%' ? '%' : ` ${quest.unit}`}`

function Segmented({ options, value, onChange, label }) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-panel p-1" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            value === o.id ? 'bg-accent text-on-accent' : 'text-muted hover:text-fg'
          }`}
        >
          {o.name}
        </button>
      ))}
    </div>
  )
}

/**
 * Quests: game-themed practice problems generated and checked locally.
 * Hints cost a little XP, revealing the solution costs the streak.
 */
export default function QuestView({ packs, progress, onAskSveti, onPickGames }) {
  const choices = packs.length ? packs : [genericPack()]
  const [gameName, setGameName] = useState(choices[0].name)
  const [topic, setTopic] = useState('linear')
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(0)

  // If the selected game was removed in the picker, fall back to the first one.
  const activeGame = choices.find((p) => p.name === gameName) || choices[0]

  const quest = useMemo(
    () => generateQuest({ game: activeGame.custom && activeGame.id === 'generic' ? '' : activeGame.name, topic, level }),
    // `round` re-rolls the quest on demand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeGame.name, topic, level, round],
  )

  const [input, setInput] = useState('')
  const [hints, setHints] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [result, setResult] = useState(null) // null | 'wrong' | 'unreadable' | 'correct' | 'revealed'
  const [earned, setEarned] = useState(0)
  const [questId, setQuestId] = useState(quest.id)

  // Fresh quest -> fresh attempt state (reset during render, no effect needed).
  if (questId !== quest.id) {
    setQuestId(quest.id)
    setInput('')
    setHints(0)
    setAttempts(0)
    setResult(null)
    setEarned(0)
  }

  const done = result === 'correct' || result === 'revealed'
  const next = () => setRound((r) => r + 1)

  const submit = (e) => {
    e.preventDefault()
    if (done || !input.trim()) return
    const { ok, parsed } = checkAnswer(quest, input)
    if (parsed === null) return setResult('unreadable')
    const tries = attempts + 1
    setAttempts(tries)
    if (!ok) return setResult('wrong')
    const xp = questXp({ level: quest.level, hintsUsed: hints, attempts: tries })
    setEarned(xp)
    setResult('correct')
    progress.award(xp)
  }

  const reveal = () => {
    setResult('revealed')
    progress.breakStreak()
  }

  return (
    <div className="scroll-thin flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Quests</h1>
            <p className="mt-1 text-sm text-muted">Algebra practice set inside your games. Answers are checked instantly.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1.5 font-semibold" title="Current streak">
              <Flame size={15} className={progress.streak ? 'text-accent-text' : 'text-muted'} />
              {progress.streak}
            </span>
            <span className="rounded-full border border-line bg-panel px-3 py-1.5 font-display font-bold tabular-nums text-accent-text">
              {progress.xp} XP
            </span>
          </div>
        </div>

        {/* Topic */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label="Topic">
          {TOPICS.map((t) => {
            const Icon = TOPIC_ICONS[t.id]
            const on = topic === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopic(t.id)}
                aria-pressed={on}
                className={`rounded-2xl border p-3 text-left transition ${
                  on ? 'border-accent bg-accent/10 shadow-glow' : 'border-line bg-panel hover:border-accent/50'
                }`}
              >
                <Icon size={18} className={on ? 'text-accent-text' : 'text-muted'} />
                <div className="mt-2 text-[13px] font-semibold leading-tight">{t.name}</div>
              </button>
            )
          })}
        </div>

        {/* Game + difficulty */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {choices.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setGameName(p.name)}
                aria-pressed={activeGame.name === p.name}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  activeGame.name === p.name ? 'border-transparent text-on-accent' : 'border-line bg-panel text-muted hover:text-fg'
                }`}
                style={activeGame.name === p.name ? { backgroundColor: p.tint } : undefined}
              >
                <span aria-hidden="true">{p.emoji}</span> {p.name}
              </button>
            ))}
            <button type="button" onClick={onPickGames} className="rounded-full border border-dashed border-line px-3 py-1.5 text-xs font-medium text-muted hover:border-accent/60 hover:text-fg">
              {packs.length ? 'Change games' : '+ Pick your games'}
            </button>
          </div>
          <Segmented options={LEVELS} value={level} onChange={setLevel} label="Difficulty" />
        </div>

        {/* Quest card */}
        <section key={quest.id} data-quest={quest.id} className="card mt-4 animate-rise overflow-hidden" aria-label="Current quest">
          <div className="h-1.5" style={{ backgroundColor: quest.game.tint }} />
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="label">
                {quest.game.emoji} {quest.game.name} · {TOPICS.find((t) => t.id === quest.topic).name}
              </span>
              <span className="label">up to {questXp({ level: quest.level })} XP</span>
            </div>

            <Markdown className="mt-3 text-[16px]">{quest.story}</Markdown>
            <p className="mt-3 font-display text-lg font-bold">{quest.ask}</p>

            <form onSubmit={submit} className="mt-4 flex flex-wrap items-center gap-2">
              <label htmlFor="quest-answer" className="sr-only">
                Your answer
              </label>
              <div
                className={`flex min-w-0 flex-1 items-center rounded-xl border bg-bg px-3 transition focus-within:border-accent/70 ${
                  result === 'wrong' || result === 'unreadable' ? 'animate-shake border-bad/60' : 'border-line'
                }`}
                key={attempts + (result === 'unreadable' ? 'u' : '')}
              >
                <input
                  id="quest-answer"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={done}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="Your answer"
                  className="h-11 min-w-0 flex-1 bg-transparent text-base font-semibold text-fg placeholder:font-normal placeholder:text-muted focus:outline-none"
                />
                <span className="ml-2 shrink-0 text-sm text-muted">{quest.unit}</span>
              </div>
              <button type="submit" disabled={done || !input.trim()} className="btn-primary h-11">
                Check
              </button>
            </form>

            {/* Feedback */}
            <div aria-live="polite">
              {result === 'unreadable' && (
                <p className="mt-3 flex items-center gap-2 text-sm text-bad">
                  <X size={16} /> I couldn&apos;t read a number in that. Try something like <strong>12</strong> or <strong>x = 12</strong>.
                </p>
              )}
              {result === 'wrong' && (
                <p className="mt-3 flex items-center gap-2 text-sm text-bad">
                  <X size={16} /> Not quite{attempts > 1 ? ' yet' : ''} — check your setup and try again{hints < 3 ? ', or grab a hint' : ''}.
                </p>
              )}
              {result === 'correct' && (
                <div className="mt-4 flex animate-pop flex-wrap items-center justify-between gap-3 rounded-xl border border-good/40 bg-good/10 px-4 py-3">
                  <p className="flex items-center gap-2 font-semibold text-good">
                    <Check size={18} strokeWidth={3} /> {CHEERS[Math.round(quest.answer + attempts) % CHEERS.length]} {formatAnswer(quest)}{quest.also ? ` ${quest.also}` : ''}
                  </p>
                  <span className="font-display text-lg font-bold tabular-nums text-accent-text">+{earned} XP</span>
                </div>
              )}
              {result === 'revealed' && (
                <p className="mt-4 rounded-xl border border-line bg-raised px-4 py-3 text-sm">
                  The answer is <strong>{formatAnswer(quest)}</strong>{quest.also ? ` (${quest.also})` : ''}. Study the steps below, then try a fresh one.
                </p>
              )}
            </div>

            {/* Hints */}
            {hints > 0 && !done && (
              <ol className="mt-4 space-y-2">
                {quest.hints.slice(0, hints).map((hint, i) => (
                  <li key={i} className="flex animate-rise gap-2.5 rounded-xl border border-accent/25 bg-accent/5 px-3.5 py-2.5 text-sm">
                    <Lightbulb size={16} className="mt-0.5 shrink-0 text-accent-text" />
                    <Markdown>{hint}</Markdown>
                  </li>
                ))}
              </ol>
            )}

            {/* Worked solution */}
            {done && (
              <div className="mt-4 animate-rise rounded-xl border border-line bg-bg p-4">
                <div className="label mb-2">How it works</div>
                <Markdown className="text-[15px]">{quest.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}</Markdown>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              {done ? (
                <button type="button" onClick={next} className="btn-primary" autoFocus>
                  Next quest <ChevronRight size={16} />
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => setHints((h) => Math.min(3, h + 1))} disabled={hints >= 3} className="btn-ghost">
                    <Lightbulb size={16} /> {hints >= 3 ? 'No more hints' : `Hint ${hints + 1} of 3`}
                  </button>
                  {(attempts >= 2 || hints >= 3) && (
                    <button type="button" onClick={reveal} className="btn-ghost">
                      <Eye size={16} /> Show solution
                    </button>
                  )}
                  <button type="button" onClick={next} className="btn-ghost">
                    <RefreshCw size={15} /> Skip
                  </button>
                </>
              )}
              <button type="button" onClick={() => onAskSveti(questToPrompt(quest))} className="btn-ghost ml-auto">
                <MessageCircle size={16} /> Ask Sveti
              </button>
            </div>
          </div>
        </section>

        <p className="mt-4 text-center text-xs text-muted">
          {progress.solved} solved · best streak {progress.best} · hints cost a little XP, showing the solution resets your streak
        </p>
      </div>
    </div>
  )
}
