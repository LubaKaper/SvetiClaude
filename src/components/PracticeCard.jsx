import { useState } from 'react'
import { Check, ChevronRight, Eye, Lightbulb, MessageCircle, RefreshCw, X } from 'lucide-react'
import Markdown from './Markdown'
import { checkAnswer } from '../lib/quests'
import { practiceXp, topicInfo } from '../lib/practice'

const CHEERS = ['Nailed it!', 'GG!', 'Clean solve!', 'Critical hit!', 'Level cleared!']

const formatAnswer = (item) =>
  item.kind === 'choice'
    ? item.answer
    : `${item.answer.toLocaleString('en-US')}${item.unit === '%' ? '%' : ` ${item.unit}`}${item.also ? ` ${item.also}` : ''}`

/**
 * One exercise: an algebra quest (typed answer) or an English drill (multiple
 * choice), with hints, instant checking and the explanation afterwards.
 *
 * Used on the Quests page and embedded in chat replies. Give it a `key` of
 * `item.id` so a new exercise starts with fresh state.
 *
 * @param {object}   props.item      - from makePractice()
 * @param {object}   [props.initial] - a stored result, to show it already finished
 * @param {Function} props.onFinish  - ({ outcome, xp, hints, attempts }) once solved or revealed
 * @param {Function} [props.onNext]  - shows Next / Skip buttons
 * @param {Function} [props.onAskSveti]
 */
export default function PracticeCard({ item, initial = null, onFinish, onNext, onAskSveti, embedded = false }) {
  const [input, setInput] = useState('')
  const [hints, setHints] = useState(initial?.hints || 0)
  const [attempts, setAttempts] = useState(initial?.attempts || 0)
  const [wrong, setWrong] = useState([]) // option indexes already tried (choice)
  const [result, setResult] = useState(initial ? (initial.outcome === 'solved' ? 'correct' : 'revealed') : null)
  const [earned, setEarned] = useState(initial?.xp || 0)

  const done = result === 'correct' || result === 'revealed'
  const maxHints = item.hints.length
  const isChoice = item.kind === 'choice'
  const topicName = topicInfo(item.topic)?.name

  const finish = (outcome, tries) => {
    const xp = outcome === 'solved' ? practiceXp(item, { hintsUsed: hints, attempts: tries }) : 0
    setEarned(xp)
    setResult(outcome === 'solved' ? 'correct' : 'revealed')
    onFinish?.({ outcome, xp, hints, attempts: tries })
  }

  const submitNumber = (e) => {
    e.preventDefault()
    if (done || !input.trim()) return
    const { ok, parsed } = checkAnswer(item, input)
    if (parsed === null) return setResult('unreadable')
    const tries = attempts + 1
    setAttempts(tries)
    if (ok) finish('solved', tries)
    else setResult('wrong')
  }

  const choose = (index) => {
    if (done || wrong.includes(index)) return
    const tries = attempts + 1
    setAttempts(tries)
    if (index === item.answerIndex) return finish('solved', tries)
    setWrong((w) => [...w, index])
    setResult('wrong')
  }

  return (
    <section
      data-quest={item.id}
      className={`card animate-rise overflow-hidden ${embedded ? 'my-1 w-full' : ''}`}
      aria-label={`${topicName} exercise`}
    >
      <div className="h-1.5" style={{ backgroundColor: item.game.tint }} />
      <div className={embedded ? 'p-4' : 'p-5 sm:p-6'}>
        <div className="flex items-center justify-between gap-3">
          <span className="label">
            {item.game.emoji} {item.game.id === 'generic' ? 'Quest' : item.game.name} · {topicName}
          </span>
          {!done && <span className="label shrink-0">up to {practiceXp(item, {})} XP</span>}
        </div>

        {isChoice ? (
          <>
            <p className={`mt-3 font-display font-bold ${embedded ? 'text-base' : 'text-lg'}`}>{item.ask}</p>
            {item.sentence && (
              <p className="mt-2 rounded-xl border border-line bg-bg px-4 py-3 text-[16px] leading-relaxed">
                {done ? item.sentence.replace('___', item.answer) : item.sentence}
              </p>
            )}
            <div className={`mt-3 grid gap-2 ${item.sentence ? 'sm:grid-cols-3' : ''}`} role="group" aria-label="Answer choices">
              {item.options.map((option, i) => {
                const isRight = done && i === item.answerIndex
                const isWrong = wrong.includes(i)
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => choose(i)}
                    disabled={done || isWrong}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-[15px] transition ${
                      isRight
                        ? 'border-good/60 bg-good/10 font-semibold text-good'
                        : isWrong
                          ? 'border-bad/40 bg-bad/5 text-muted line-through'
                          : 'border-line bg-bg hover:border-accent/60 disabled:opacity-60'
                    } ${item.sentence ? 'justify-center font-semibold' : ''}`}
                  >
                    {isRight && <Check size={16} strokeWidth={3} className="shrink-0" />}
                    {isWrong && <X size={16} className="shrink-0 text-bad" />}
                    <span>{option}</span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <Markdown className={`mt-3 ${embedded ? '' : 'text-[16px]'}`}>{item.story}</Markdown>
            <p className={`mt-3 font-display font-bold ${embedded ? 'text-base' : 'text-lg'}`}>{item.ask}</p>
            <form onSubmit={submitNumber} className="mt-4 flex flex-wrap items-center gap-2">
              <div
                key={attempts + (result === 'unreadable' ? 'u' : '')}
                className={`flex min-w-0 flex-1 items-center rounded-xl border bg-bg px-3 transition focus-within:border-accent/70 ${
                  result === 'wrong' || result === 'unreadable' ? 'animate-shake border-bad/60' : 'border-line'
                }`}
              >
                <input
                  aria-label="Your answer"
                  data-answer-input
                  value={done && !input ? String(item.answer) : input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={done}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="Your answer"
                  className="h-11 min-w-0 flex-1 bg-transparent text-base font-semibold text-fg placeholder:font-normal placeholder:text-muted focus:outline-none"
                />
                <span className="ml-2 shrink-0 text-sm text-muted">{item.unit}</span>
              </div>
              <button type="submit" disabled={done || !input.trim()} className="btn-primary h-11">
                Check
              </button>
            </form>
          </>
        )}

        {/* Feedback */}
        <div aria-live="polite">
          {result === 'unreadable' && (
            <p className="mt-3 flex items-center gap-2 text-sm text-bad">
              <X size={16} className="shrink-0" /> I couldn&apos;t read a number in that. Try something like 12 or x = 12.
            </p>
          )}
          {result === 'wrong' && (
            <p className="mt-3 flex items-center gap-2 text-sm text-bad">
              <X size={16} className="shrink-0" /> Not quite{attempts > 1 ? ' yet' : ''} —{' '}
              {isChoice ? 'have another look' : 'check your setup and try again'}
              {hints < maxHints ? ', or grab a hint.' : '.'}
            </p>
          )}
          {result === 'correct' && (
            <div className="mt-4 flex animate-pop flex-wrap items-center justify-between gap-3 rounded-xl border border-good/40 bg-good/10 px-4 py-3">
              <p className="flex items-center gap-2 font-semibold text-good">
                <Check size={18} strokeWidth={3} className="shrink-0" />
                {CHEERS[(item.id.length + attempts) % CHEERS.length]} {!isChoice && formatAnswer(item)}
              </p>
              <span className="font-display text-lg font-bold tabular-nums text-accent-text">+{earned} XP</span>
            </div>
          )}
          {result === 'revealed' && (
            <p className="mt-4 rounded-xl border border-line bg-raised px-4 py-3 text-sm">
              The answer is <strong>{formatAnswer(item)}</strong>. Read why below, then try a fresh one.
            </p>
          )}
        </div>

        {/* Hints */}
        {hints > 0 && !done && (
          <ol className="mt-4 space-y-2">
            {item.hints.slice(0, hints).map((hint, i) => (
              <li key={i} className="flex animate-rise gap-2.5 rounded-xl border border-accent/25 bg-accent/5 px-3.5 py-2.5 text-sm">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-accent-text" />
                <Markdown>{hint}</Markdown>
              </li>
            ))}
          </ol>
        )}

        {/* Explanation */}
        {done && (
          <div className="mt-4 animate-rise rounded-xl border border-line bg-bg p-4">
            <div className="label mb-2">{isChoice ? 'The rule' : 'How it works'}</div>
            <Markdown className="text-[15px]">
              {isChoice ? item.explain : item.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
            </Markdown>
          </div>
        )}

        {/* Actions */}
        {(!done || onNext || onAskSveti) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            {done
              ? onNext && (
                  <button type="button" onClick={onNext} className="btn-primary">
                    Next quest <ChevronRight size={16} />
                  </button>
                )
              : (
                <>
                  <button type="button" onClick={() => setHints((h) => Math.min(maxHints, h + 1))} disabled={hints >= maxHints} className="btn-ghost">
                    <Lightbulb size={16} />
                    {hints >= maxHints ? 'No more hints' : maxHints === 1 ? 'Hint' : `Hint ${hints + 1} of ${maxHints}`}
                  </button>
                  {(attempts >= 2 || hints >= maxHints) && (
                    <button type="button" onClick={() => finish('revealed', attempts)} className="btn-ghost">
                      <Eye size={16} /> Show solution
                    </button>
                  )}
                  {onNext && (
                    <button type="button" onClick={onNext} className="btn-ghost">
                      <RefreshCw size={15} /> Skip
                    </button>
                  )}
                </>
              )}
            {onAskSveti && (
              <button type="button" onClick={onAskSveti} className="btn-ghost ml-auto">
                <MessageCircle size={16} /> Ask Sveti
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
