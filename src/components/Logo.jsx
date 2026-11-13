/** Sveti's mark: a four-point spark of light with two pixels breaking off. */
export function Spark({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M32 6l5.6 16.4L54 28l-16.4 5.6L32 50l-5.6-16.4L10 28l16.4-5.6z" fill="currentColor" />
      <rect x="47" y="46" width="8" height="8" fill="currentColor" />
      <rect x="10" y="49" width="5" height="5" fill="currentColor" opacity="0.55" />
    </svg>
  )
}

export function Avatar({ size = 32 }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-text ring-1 ring-accent/30"
      style={{ width: size, height: size }}
    >
      <Spark size={size * 0.6} />
    </span>
  )
}

export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-on-accent shadow-glow">
        <Spark size={22} />
      </span>
      <div className="leading-none">
        <div className="font-pixel text-2xl font-bold tracking-wide text-fg">Sveti</div>
        <div className="mt-0.5 text-[11px] text-muted">learn it in your game</div>
      </div>
    </div>
  )
}
