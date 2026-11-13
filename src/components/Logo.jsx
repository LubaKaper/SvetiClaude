/**
 * Sveti's mark: a glowing D-pad that is also a plus sign, throwing off pixels
 * of light. "Sveti" (свети) means "shine" — games, math and light in one shape.
 */

const DPAD =
  'M26 14h12a2 2 0 0 1 2 2v8h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8v8a2 2 0 0 1-2 2H26a2 2 0 0 1-2-2v-8h-8a2 2 0 0 1-2-2V26a2 2 0 0 1 2-2h8v-8a2 2 0 0 1 2-2z'
const HOLE = 'M32 27.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9z'

function Pixels({ fill }) {
  return (
    <>
      <g fill={fill}>
        <rect x="12" y="12" width="6" height="6" />
        <rect x="46" y="12" width="6" height="6" />
        <rect x="12" y="46" width="6" height="6" />
        <rect x="46" y="46" width="6" height="6" />
      </g>
      <g fill={fill} opacity="0.5">
        <rect x="6" y="6" width="4" height="4" />
        <rect x="54" y="6" width="4" height="4" />
        <rect x="6" y="54" width="4" height="4" />
        <rect x="54" y="54" width="4" height="4" />
      </g>
    </>
  )
}

/** One-colour glyph (inherits the text colour). */
export function Spark({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d={`${DPAD}${HOLE}`} fill="currentColor" fillRule="evenodd" />
      <Pixels fill="currentColor" />
    </svg>
  )
}

/** Full-colour app icon: the glowing mark on a dark tile. */
export function Mark({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="sveti-glow">
          <stop offset="0" stopColor="#ffc53d" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffc53d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sveti-amber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.45" stopColor="#ffc53d" />
          <stop offset="1" stopColor="#ff9a1f" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="#11142a" />
      <circle cx="32" cy="32" r="30" fill="url(#sveti-glow)" />
      <path d={`${DPAD}${HOLE}`} fill="url(#sveti-amber)" fillRule="evenodd" />
      <Pixels fill="#ffc53d" />
    </svg>
  )
}

export function Avatar({ size = 32 }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-text ring-1 ring-accent/30"
      style={{ width: size, height: size }}
    >
      <Spark size={size * 0.7} />
    </span>
  )
}

export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <Mark size={40} className="rounded-xl shadow-glow" />
      <div className="leading-none">
        <div className="font-pixel text-2xl font-bold tracking-wide text-fg">Sveti</div>
        <div className="mt-0.5 text-[11px] text-muted">learn it in your game</div>
      </div>
    </div>
  )
}
