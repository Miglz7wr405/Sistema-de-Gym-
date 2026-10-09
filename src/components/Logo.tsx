/** Logótipo do ginásio Olympus. */
export function Logo({ size = 120, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/olympus.jpg"
      alt="Olympus"
      width={size}
      height={size * 0.52}
      className={`rounded-2xl object-contain ${className}`}
      style={{ width: size, height: 'auto' }}
    />
  )
}
