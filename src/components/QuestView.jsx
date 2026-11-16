import { useMemo, useState } from 'react'
import { Divide, Equal, Flame, Percent, PenLine, Quote, Scale, TrendingUp, Variable, WholeWord } from 'lucide-react'
import PracticeCard from './PracticeCard'
import { genericPack } from '../config/games'
import { LEVELS } from '../lib/quests'
import { makePractice, practiceToPrompt, topicsFor } from '../lib/practice'

const TOPIC_ICONS = {
  linear: Equal, percent: Percent, ratio: Divide, fn: TrendingUp, system: Variable,
  homophones: WholeWord, commas: Quote, agreement: Scale, thesis: PenLine,
}

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
 * Quests: practice generated and checked locally, set inside the player's
 * games. Algebra gets typed-answer problems in three difficulties; English
 * gets multiple-choice grammar and thesis drills.
 */
export default function QuestView({ subject, packs, progress, onAskSveti, onPickGames }) {
  const topics = topicsFor(subject)
  const choices = packs.length ? packs : [genericPack()]
  const [gameName, setGameName] = useState(choices[0].name)
  const [picked, setPicked] = useState({}) // chosen topic per subject
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(0)

  const topic = topics.some((t) => t.id === picked[subject]) ? picked[subject] : topics[0].id
  // If the selected game was removed in the picker, fall back to the first one.
  const activeGame = choices.find((p) => p.name === gameName) || choices[0]
  const isAlgebra = subject === 'algebra'

  const item = useMemo(
    () => makePractice({ game: activeGame.id === 'generic' ? '' : activeGame.name, topic, level: isAlgebra ? level : 1 }),
    // `round` re-rolls the exercise on demand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeGame.name, topic, level, isAlgebra, round],
  )

  const finish = (result) =>
    progress.record({ topic: item.topic, level: item.level, game: item.game.name, ...result })

  return (
    <div className="scroll-thin flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Quests</h1>
            <p className="mt-1 text-sm text-muted">
              {isAlgebra ? 'Algebra practice set inside your games.' : 'Grammar and thesis drills built from your games.'} Answers are checked instantly.
            </p>
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
        <div className={`mt-5 grid grid-cols-2 gap-2 ${isAlgebra ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`} role="group" aria-label="Topic">
          {topics.map((t) => {
            const Icon = TOPIC_ICONS[t.id]
            const on = topic === t.id
            const stats = progress.topics[t.id]
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setPicked((p) => ({ ...p, [subject]: t.id }))}
                aria-pressed={on}
                className={`rounded-2xl border p-3 text-left transition ${
                  on ? 'border-accent bg-accent/10 shadow-glow' : 'border-line bg-panel hover:border-accent/50'
                }`}
              >
                <Icon size={18} className={on ? 'text-accent-text' : 'text-muted'} />
                <div className="mt-2 text-[13px] font-semibold leading-tight">{t.name}</div>
                <div className="mt-1 text-[11px] text-muted">{stats?.solved ? `${stats.solved} solved` : 'New'}</div>
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
          {isAlgebra && <Segmented options={LEVELS} value={level} onChange={setLevel} label="Difficulty" />}
        </div>

        <div className="mt-4">
          <PracticeCard
            key={item.id}
            item={item}
            onFinish={finish}
            onNext={() => setRound((r) => r + 1)}
            onAskSveti={() => onAskSveti(practiceToPrompt(item))}
          />
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          {progress.solved} solved · best streak {progress.best} · hints cost a little XP, showing the solution resets your streak
        </p>
      </div>
    </div>
  )
}
