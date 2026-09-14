export function BflMark({ className = '' }) {
  return (
    <img
      className={`brand-mark-img ${className}`.trim()}
      src="/brand/bfl-tag.png"
      alt=""
      width={32}
      height={32}
    />
  )
}

export function BflWordmark({ className = '' }) {
  return (
    <img
      className={`bfl-wordmark ${className}`.trim()}
      src="/brand/bfl-group-logo.png"
      alt="BFL Group"
    />
  )
}
