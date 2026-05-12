'use client'
import { useState, ReactNode, SVGProps } from 'react'
import { IconChevronDown, IconAlertCircle } from './icons'

const PRIMARY = '#15355B'

// ── Field wrapper ──────────────────────────────────────────────────────────────
export function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: ReactNode
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', padding: '0 2px' }}>
        {label}{required && <span style={{ color: '#E24B4A', marginLeft: 2 }}>*</span>}
      </span>
      {children}
      {error && (
        <span style={{ fontSize: 12, color: '#E24B4A', padding: '0 2px',
          display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <IconAlertCircle size={13} sw={2} />{error}
        </span>
      )}
    </label>
  )
}

// ── FormSection ────────────────────────────────────────────────────────────────
export function FormSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
        textTransform: 'uppercase', color: '#6B7280', padding: '0 4px',
      }}>{label}</div>
      {children}
    </div>
  )
}

// ── Base input style ───────────────────────────────────────────────────────────
function inputStyle(focused: boolean, hasError: boolean, hasIcon: boolean, prefix?: boolean): React.CSSProperties {
  return {
    width: '100%', minHeight: 48,
    padding: hasIcon ? '12px 12px 12px 40px' : prefix ? '12px 12px 12px 64px' : '12px 14px',
    fontSize: 16, fontFamily: 'inherit',
    color: '#111827',
    background: '#fff',
    border: `1px solid ${hasError ? '#E24B4A' : focused ? PRIMARY : '#E5E7EB'}`,
    borderRadius: 12,
    outline: 'none',
    boxShadow: focused ? `0 0 0 3px ${PRIMARY}26` : 'none',
    transition: 'all .15s',
    boxSizing: 'border-box' as const,
    appearance: 'none' as const,
  }
}

// ── TextInput ──────────────────────────────────────────────────────────────────
interface TextInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  error?: string
  prefix?: string
  suffix?: string
  icon?: React.ComponentType<SVGProps<SVGSVGElement> & { size?: number; sw?: number }>
}

export function TextInput({ value, onChange, placeholder, type = 'text', error, prefix, suffix, icon: Ico }: TextInputProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      {Ico && (
        <div style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: '#9CA3AF', pointerEvents: 'none',
        }}>
          <Ico size={20} sw={1.75} />
        </div>
      )}
      {prefix && (
        <div style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: '#6B7280', pointerEvents: 'none', fontSize: 16, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 10, height: 22,
        }}>
          {prefix}
          <span style={{ width: 1, height: 18, background: '#E5E7EB' }} />
        </div>
      )}
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          ...inputStyle(focused, !!error, !!Ico, !!prefix),
          paddingLeft: Ico ? 40 : prefix ? 68 : 14,
          paddingRight: suffix ? 44 : 14,
        }}
      />
      {suffix && (
        <div style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          color: '#6B7280', pointerEvents: 'none', fontSize: 16, fontWeight: 500,
        }}>{suffix}</div>
      )}
    </div>
  )
}

// ── Select ─────────────────────────────────────────────────────────────────────
export function SelectInput({ value, onChange, options, placeholder, error }: {
  value: string; onChange: (v: string) => void
  options: string[]; placeholder?: string; error?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          ...inputStyle(focused, !!error, false),
          paddingRight: 40,
          color: value ? '#111827' : '#9CA3AF',
          cursor: 'pointer',
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <div style={{
        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
        color: '#6B7280', pointerEvents: 'none',
      }}>
        <IconChevronDown size={20} sw={2} />
      </div>
    </div>
  )
}

// ── TextArea ───────────────────────────────────────────────────────────────────
export function TextArea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        ...inputStyle(focused, false, false),
        minHeight: 120, padding: 14,
        resize: 'vertical', lineHeight: 1.5,
      }}
    />
  )
}

// ── InfoBubble ─────────────────────────────────────────────────────────────────
export function InfoBubble({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '12px 14px',
      background: `${PRIMARY}10`,
      border: `1px solid ${PRIMARY}33`,
      borderRadius: 12,
      color: PRIMARY,
      fontSize: 13, lineHeight: 1.45,
    }}>
      <div style={{ color: PRIMARY, marginTop: 1 }}>
        <IconAlertCircle size={16} sw={2} />
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}
