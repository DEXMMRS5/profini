'use client'
import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'

const PRIMARY = '#15355B'

function formatPhone(raw: string): string {
  // Garde uniquement les chiffres (et + en premier)
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return ''
  // Groupe par 2 : 06 12 34 56 78
  return digits.slice(0, 10).replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}

function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\s/g, '')
  return /^(0[1-9]\d{8}|(\+33|0033)[1-9]\d{8})$/.test(digits)
}

interface Props {
  value: string
  onChange: (v: string) => void
  error?: string
  required?: boolean
}

export default function PhoneInput({ value, onChange, error, required }: Props) {
  const { theme: T } = useTheme()
  const [focused, setFocused] = useState(false)
  const valid = isValidPhone(value)
  const hasValue = value.replace(/\s/g, '').length > 0

  const borderColor = error ? '#E24B4A'
    : focused ? PRIMARY
    : hasValue && valid ? '#22C55E'
    : T.border

  const shadow = focused ? `0 0 0 3px ${error ? '#E24B4A' : PRIMARY}18` : 'none'

  function handleChange(raw: string) {
    // Accepte chiffres, espaces, +, ()
    const cleaned = raw.replace(/[^\d\s+()]/g, '')
    const formatted = formatPhone(cleaned)
    onChange(formatted)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Indicateur format */}
      <div style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        fontSize: 15, color: T.muted, pointerEvents: 'none', userSelect: 'none',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span>🇫🇷</span>
        <span style={{ width: 1, height: 18, background: T.border }} />
      </div>
      <input
        type="tel"
        value={value}
        placeholder="06 12 34 56 78"
        inputMode="tel"
        autoComplete="tel"
        onChange={e => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 48, paddingLeft: 58, paddingRight: hasValue ? 40 : 14,
          fontSize: 16, fontFamily: 'inherit', letterSpacing: 0.5,
          color: T.text, background: focused ? T.card : T.bgAlt,
          border: `1px solid ${borderColor}`,
          borderRadius: 12, outline: 'none', boxSizing: 'border-box',
          boxShadow: shadow, transition: 'all .15s',
        }}
      />
      {/* Indicateur validation */}
      {hasValue && (
        <div style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          width: 22, height: 22, borderRadius: '50%',
          background: valid ? '#22C55E' : error ? '#E24B4A' : T.border,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .2s',
        }}>
          {valid
            ? <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
          }
        </div>
      )}
      {error && (
        <div style={{ fontSize: 12, color: '#E24B4A', marginTop: 5, paddingLeft: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
          {error}
        </div>
      )}
    </div>
  )
}
