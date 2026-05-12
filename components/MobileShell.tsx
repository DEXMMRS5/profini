'use client'
import { useTheme } from '@/context/ThemeContext'

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  return (
    <div className="pf-stage" style={theme.dark ? {
      background: 'radial-gradient(ellipse at top, rgba(43,164,100,0.06), transparent 50%), linear-gradient(180deg, #060D1A 0%, #0D1829 100%)',
    } : {}}>
      <div className="pf-shell" style={{ background: theme.bg }}>
        {children}
      </div>
    </div>
  )
}
