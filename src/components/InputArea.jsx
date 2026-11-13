import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { getActionChips, getSubject } from '../config/prompts'

/**
 * Message composer with subject-specific quick actions.
 * Picking an action pre-fills a sentence starter and tells the tutor how to
 * shape its reply (explain, show steps, practice, …).
 */
export default function InputArea({ onSend, onStop, isLoading, canStop, subject, draft }) {
  const [value, setValue] = useState('')
  const [action, setAction] = useState(null)
  const ref = useRef(null)
  const chips = getActionChips(subject)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  // A starter card or "Ask Sveti" hands us a draft to drop into the box.
  useEffect(() => {
    if (!draft?.text) return
    setValue(draft.text)
    setAction(null)
    ref.current?.focus()
  }, [draft])

  const pickChip = (chip) => {
    if (action === chip.id) {
      setAction(null)
      if (value === chip.starter) setValue('')
    } else {
      const typed = chips.some((c) => c.starter === value) ? '' : value
      setAction(chip.id)
      setValue(typed || chip.starter)
    }
    ref.current?.focus()
  }

  const submit = (e) => {
    e?.preventDefault()
    const text = value.trim()
    if (!text || isLoading) return
    onSend(text, action)
    setValue('')
    setAction(null)
  }

  return (
    <div className="border-t border-line bg-bg/80 px-3 pb-3 pt-2.5 backdrop-blur sm:px-6 sm:pb-5">
      <div className="mx-auto w-full max-w-3xl">
        <div className="scroll-thin -mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Quick actions">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => pickChip(chip)}
              aria-pressed={action === chip.id}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                action === chip.id
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-line bg-panel text-muted hover:border-accent/50 hover:text-fg'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={submit}
          className="flex items-end gap-2 rounded-2xl border border-line bg-panel p-1.5 pl-4 shadow-card transition focus-within:border-accent/60"
        >
          <label htmlFor="message-input" className="sr-only">
            Message Sveti
          </label>
          <textarea
            id="message-input"
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e)
            }}
            placeholder={getSubject(subject).placeholder}
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed text-fg placeholder:text-muted focus:outline-none"
          />
          {isLoading && canStop ? (
            <button type="button" onClick={onStop} className="btn-ghost h-10 w-10 !p-0" aria-label="Stop reply">
              <Square size={15} fill="currentColor" />
            </button>
          ) : (
            <button type="submit" disabled={!value.trim() || isLoading} className="btn-primary h-10 w-10 !p-0" aria-label="Send message">
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          )}
        </form>
        <p className="mt-1.5 hidden text-center text-[11px] text-muted sm:block">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  )
}
