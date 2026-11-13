import { useEffect, useRef } from 'react'
import { ArrowRight, Gamepad2 } from 'lucide-react'
import Message from './Message'
import InputArea from './InputArea'
import { Mark } from './Logo'
import { genericPack } from '../config/games'
import { getSubject } from '../config/prompts'

/** Welcome screen: who Sveti is, plus conversation starters from the player's game. */
function EmptyState({ subject, packs, onStarter, onPickGames }) {
  const pack = packs[0] || genericPack()
  const starters = subject === 'english' ? pack.writing : pack.starters
  const subjectName = getSubject(subject).name.toLowerCase()

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
      <Mark size={76} className="mb-5 animate-pop rounded-[18px] shadow-glow" />
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">What are we learning today?</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        {packs.length ? (
          <>
            Ask anything about {subjectName}. I&apos;ll explain it with{' '}
            <span className="font-semibold text-fg">
              {pack.emoji} {pack.name}
            </span>
            .
          </>
        ) : (
          <>Ask anything about {subjectName} — or tell me what you play and I&apos;ll teach it through your game.</>
        )}
      </p>

      {!packs.length && (
        <button type="button" onClick={onPickGames} className="btn-primary mt-5">
          <Gamepad2 size={17} /> Choose your games
        </button>
      )}

      <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-3">
        {starters.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onStarter(text)}
            className="card group flex flex-col justify-between gap-3 p-4 text-left text-sm leading-snug transition hover:-translate-y-0.5 hover:border-accent/60"
          >
            <span>{text}</span>
            <ArrowRight size={15} className="text-muted transition group-hover:translate-x-0.5 group-hover:text-accent-text" />
          </button>
        ))}
      </div>
    </div>
  )
}

/** The conversation: welcome screen or message list, plus the composer. */
export default function ChatView({ chat, subject, packs, draft, onPickGames }) {
  const { messages, isLoading, status, sendMessage, stop } = chat
  const scrollRef = useRef(null)

  // A reply that never finished (e.g. the tab was closed mid-stream) is dropped if empty.
  const visible = messages.filter((m) => m.content || (m.pending && isLoading))
  const last = visible[visible.length - 1]

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [visible.length, last?.content])

  return (
    <>
      <div ref={scrollRef} className="scroll-thin flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <EmptyState
            subject={subject}
            packs={packs}
            onStarter={(text) => sendMessage(text)}
            onPickGames={onPickGames}
          />
        ) : (
          <div
            className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-3 py-6 sm:px-6"
            role="log"
            aria-live="polite"
            aria-label="Conversation with Sveti"
          >
            {visible.map((m) => (
              <Message key={m.id} message={m} streaming={Boolean(m.pending && isLoading)} />
            ))}
          </div>
        )}
      </div>

      <InputArea
        onSend={sendMessage}
        onStop={stop}
        isLoading={isLoading}
        canStop={Boolean(status.live)}
        subject={subject}
        draft={draft}
      />
    </>
  )
}
