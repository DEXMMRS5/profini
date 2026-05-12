'use client'
import { useState, ReactNode } from 'react'
import { SVGProps } from 'react'

const PRIMARY = '#15355B'
const ACCENT  = '#2BA464'

interface BtnProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  fullWidth?: boolean
  icon?: React.ComponentType<SVGProps<SVGSVGElement> & { size?: number; sw?: number }>
  pulse?: boolean
  type?: 'button' | 'submit'
  loading?: boolean
}

export function PrimaryButton({ children, onClick, disabled, fullWidth = true, icon: Ico, pulse, type = 'button', loading }: BtnProps) {
  const [hov, setHov] = useState(false)
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: 56,
        background: isDisabled ? '#D1D5DB' : hov ? '#1a3f6e' : PRIMARY,
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8,
        boxShadow: isDisabled ? 'none' : '0 4px 14px rgba(21,53,91,0.35)',
        transition: 'all .15s',
        ...(pulse && !isDisabled ? { animation: 'pulseGlow 2s ease-in-out infinite' } : {}),
      }}
    >
      {Ico && <Ico size={22} sw={2} />}
      {loading ? 'Chargement…' : children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, fullWidth = false, icon: Ico, type = 'button' }: BtnProps) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: fullWidth ? '100%' : 'auto',
        flex: fullWidth ? 1 : undefined,
        height: 56,
        background: hov ? '#F9FAFB' : '#fff',
        color: '#111827',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8,
        transition: 'all .15s',
      }}
    >
      {Ico && <Ico size={20} sw={2} />}
      {children}
    </button>
  )
}

export function AccentButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: 'none', border: 'none', color: PRIMARY,
        fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
        display: 'inline-flex', alignItems: 'center', gap: 4,
        cursor: 'pointer', padding: '8px 4px', opacity: hov ? 0.8 : 1,
        transition: 'opacity .15s',
      }}>
      {children}
    </button>
  )
}
