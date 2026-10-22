export function Logo({ className = 'size-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="var(--sage)" />
      <circle cx="26" cy="32" r="13" fill="none" stroke="var(--on-sage)" strokeWidth="4" opacity="0.5" />
      <circle cx="38" cy="32" r="13" fill="none" stroke="var(--on-sage)" strokeWidth="4" />
    </svg>
  )
}
