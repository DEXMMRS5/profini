'use client'
import { useState, ReactNode } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { IconChevronDown, IconAlertCircle, IconCheck } from './icons'

const PRIMARY = '#15355B'

// ── Field wrapper ──────────────────────────────────────────────────────────────
export function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: ReactNode
}) {
  const { theme: T } = useTheme()
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: T.subtle, padding: '0 2px' }}>
        {label}
        {required && <span style={{ color: '#E24B4A', marginLeft: 2 }}>*</span>}
      </span>
      {children}
      {hint && !error && <span style={{ fontSize: 11, color: T.muted, padding: '0 2px' }}>{hint}</span>}
      {error && (
        <span style={{ fontSize: 12, color: '#E24B4A', padding: '0 2px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <IconAlertCircle size={13} sw={2} />{error}
        </span>
      )}
    </label>
  )
}

// ── FormSection ────────────────────────────────────────────────────────────────
export function FormSection({ label, children }: { label: string; children: ReactNode }) {
  const { theme: T } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' as const, color: T.muted, padding: '0 2px' }}>{label}</div>
      {children}
    </div>
  )
}

// ── TextInput ──────────────────────────────────────────────────────────────────
interface TextInputProps {
  value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; error?: string
  prefix?: string; suffix?: string; hint?: string
  icon?: React.ComponentType<{ size?: number; sw?: number }>
  valid?: boolean; inputMode?: string; autoComplete?: string
}

export function TextInput({ value, onChange, placeholder, type = 'text', error, prefix, suffix, icon: Ico, valid, inputMode, autoComplete }: TextInputProps) {
  const { theme: T } = useTheme()
  const [focused, setFocused] = useState(false)

  const borderColor = error ? '#E24B4A'
    : focused ? PRIMARY
    : (valid && value) ? '#22C55E'
    : T.border

  const shadow = focused ? `0 0 0 3px ${error ? '#E24B4A' : PRIMARY}18` : 'none'

  return (
    <div style={{ position: 'relative' }}>
      {Ico && (
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }}>
          <Ico size={18} sw={1.75} />
        </div>
      )}
      {prefix && (
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none', fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          {prefix}<span style={{ width: 1, height: 18, background: T.border }} />
        </div>
      )}
      <input
        type={type} value={value} placeholder={placeholder}
        inputMode={inputMode as React.HTMLAttributes<HTMLInputElement>['inputMode']}
        autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', minHeight: 48,
          paddingTop: 12, paddingBottom: 12,
          paddingLeft: Ico ? 38 : prefix ? 64 : 14,
          paddingRight: suffix ? 42 : (valid && value) ? 36 : 14,
          fontSize: 16, fontFamily: 'inherit', color: T.text,
          background: focused ? T.card : T.bgAlt,
          border: `1px solid ${borderColor}`,
          borderRadius: 12, outline: 'none', boxSizing: 'border-box' as const,
          boxShadow: shadow, transition: 'all .15s',
        }}
      />
      {suffix && (
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none', fontSize: 15, fontWeight: 500 }}>{suffix}</div>
      )}
      {valid && value && !suffix && (
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconCheck size={12} sw={3} color="#fff" />
        </div>
      )}
    </div>
  )
}

// ── SelectInput ────────────────────────────────────────────────────────────────
export function SelectInput({ value, onChange, options, placeholder, error }: {
  value: string; onChange: (v: string) => void
  options: string[]; placeholder?: string; error?: string
}) {
  const { theme: T } = useTheme()
  const [focused, setFocused] = useState(false)
  const borderColor = error ? '#E24B4A' : focused ? PRIMARY : T.border
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 48, paddingLeft: 14, paddingRight: 40,
          fontSize: 16, fontFamily: 'inherit', color: value ? T.text : T.muted,
          background: focused ? T.card : T.bgAlt,
          border: `1px solid ${borderColor}`,
          borderRadius: 12, outline: 'none', boxSizing: 'border-box' as const,
          boxShadow: focused ? `0 0 0 3px ${PRIMARY}18` : 'none',
          transition: 'all .15s', cursor: 'pointer', appearance: 'none',
        }}>
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }}>
        <IconChevronDown size={18} sw={2} />
      </div>
    </div>
  )
}

// ── TextArea ───────────────────────────────────────────────────────────────────
export function TextArea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  const { theme: T } = useTheme()
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: '100%', padding: 14, fontSize: 15, fontFamily: 'inherit', color: T.text,
        background: focused ? T.card : T.bgAlt,
        border: `1px solid ${focused ? PRIMARY : T.border}`,
        borderRadius: 12, outline: 'none', boxSizing: 'border-box' as const,
        boxShadow: focused ? `0 0 0 3px ${PRIMARY}18` : 'none',
        resize: 'vertical', lineHeight: 1.55, minHeight: 110,
        transition: 'all .15s',
      }} />
  )
}

// ── InfoBubble ─────────────────────────────────────────────────────────────────
export function InfoBubble({ children, type = 'info' }: { children: ReactNode; type?: 'info' | 'success' | 'warning' }) {
  const { theme: T } = useTheme()
  const colors = {
    info:    { bg: `${PRIMARY}0D`, border: `${PRIMARY}30`, text: PRIMARY },
    success: { bg: '#DCFCE7',       border: '#22C55E40',    text: '#15803D' },
    warning: { bg: '#FFF7ED',       border: '#F9731640',    text: '#C2410C' },
  }[type]
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '11px 14px',
      background: T.dark ? `${colors.text}18` : colors.bg, border: `1px solid ${colors.border}`,
      borderRadius: 12, color: colors.text, fontSize: 13, lineHeight: 1.5 }}>
      <IconAlertCircle size={15} sw={2} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}
