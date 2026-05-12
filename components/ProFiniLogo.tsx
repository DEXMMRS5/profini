interface Props { color?: string; accent?: string; size?: number }

export default function ProFiniLogo({ color = '#15355B', accent = '#2BA464', size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M8 4 L26 4 L34 12 L34 22 L26 30 L16 30 L16 36 L8 36 Z"
        stroke={color} strokeWidth="3.2" fill="none" strokeLinejoin="round" />
      <path d="M12 20 L18 26 L30 14 L26 12 L18 20 L14 16 Z" fill={accent} />
    </svg>
  )
}
