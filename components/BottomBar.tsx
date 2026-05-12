'use client'
import { useTheme } from '@/context/ThemeContext'

export default function BottomBar({ children }: { children: React.ReactNode }) {
  const { theme: T } = useTheme()
  return (
    <div style={{
      flexShrink: 0, padding: '12px 16px 28px',
      background: T.nav, borderTop: `0.5px solid ${T.border}`,
      display: 'flex', gap: 12, zIndex: 5, position: 'relative',
    }}>
      {children}
      <div style={{
        position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 100,
        background: T.dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
