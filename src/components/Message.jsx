import { memo } from 'react'
import { AlertTriangle, WifiOff } from 'lucide-react'
import Markdown from './Markdown'
import { Avatar } from './Logo'

const time = (ts) => {
  const d = new Date(ts)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/** One chat message. `streaming` shows the typing indicator / live caret. */
function Message({ message, streaming = false }) {
  const { role, content, timestamp, error, local } = message

  if (role === 'user') {
    return (
      <div className="flex animate-rise justify-end">
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="whitespace-pre-wrap break-words rounded-2xl rounded-br-md border border-accent/30 bg-accent/15 px-4 py-2.5 text-[15px] leading-relaxed">
            {content}
          </div>
          <div className="mt-1 text-right text-[11px] text-muted">{time(timestamp)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-rise gap-3">
      <Avatar />
      <div className="min-w-0 max-w-[92%] flex-1 sm:max-w-[85%]">
        <div
          className={`inline-block max-w-full rounded-2xl rounded-tl-md border px-4 py-3 text-[15px] ${
            error ? 'border-bad/40 bg-bad/10' : 'border-line bg-panel shadow-card'
          }`}
        >
          {error && (
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-bad">
              <AlertTriangle size={14} /> Couldn&apos;t get a reply
            </div>
          )}
          {content ? (
            <Markdown className={streaming ? 'caret' : ''}>{content}</Markdown>
          ) : (
            <div className="typing flex items-center gap-1.5 py-1.5" role="status" aria-label="Sveti is thinking">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
          {!streaming && time(timestamp)}
          {local && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line px-1.5 py-0.5">
              <WifiOff size={10} /> demo-mode example
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(Message)
