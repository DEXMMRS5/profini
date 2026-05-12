'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useTheme } from '@/context/ThemeContext'

const PRIMARY = '#15355B'

interface AddressResult {
  label: string
  name: string
  postcode: string
  city: string
  context: string
}

interface Props {
  value: string
  onChange: (address: string, postcode?: string, city?: string) => void
  placeholder?: string
  error?: string
}

export default function AddressInput({ value, onChange, placeholder = '12 rue Victor Hugo, Lyon', error }: Props) {
  const { theme: T } = useTheme()
  const [focused, setFocused] = useState(false)
  const [results, setResults] = useState<AddressResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5&type=housenumber`,
        { cache: 'no-store' }
      )
      const json = await res.json()
      const items: AddressResult[] = (json.features ?? []).map((f: { properties: AddressResult }) => f.properties)
      setResults(items)
      setOpen(items.length > 0)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(v: string) {
    onChange(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(v), 350)
  }

  function handleSelect(r: AddressResult) {
    onChange(r.name, r.postcode, r.city)
    setOpen(false)
    setResults([])
  }

  // Fermer si clic extérieur
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const borderColor = error ? '#E24B4A' : focused ? PRIMARY : T.border
  const shadow = focused ? `0 0 0 3px ${error ? '#E24B4A' : PRIMARY}18` : 'none'

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Icône */}
      <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7 -6.5 -7 -12a7 7 0 0 1 14 0c0 5.5 -7 12 -7 12z"/><circle cx="12" cy="9" r="2.5"/>
        </svg>
      </div>
      {loading && (
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
      )}
      <input
        type="text" value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={e => handleChange(e.target.value)}
        onFocus={() => { setFocused(true); if (results.length > 0) setOpen(true) }}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        style={{
          width: '100%', height: 48, paddingLeft: 40, paddingRight: 14,
          fontSize: 16, fontFamily: 'inherit', color: T.text,
          background: focused ? T.card : T.bgAlt,
          border: `1px solid ${borderColor}`,
          borderRadius: open ? '12px 12px 0 0' : 12,
          outline: 'none', boxSizing: 'border-box',
          boxShadow: shadow, transition: 'border-color .15s, box-shadow .15s',
        }}
      />
      {/* Dropdown */}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: T.card, border: `1px solid ${PRIMARY}`,
          borderTop: 'none', borderRadius: '0 0 12px 12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
        }}>
          {results.map((r, i) => (
            <button key={i} onMouseDown={() => handleSelect(r)} style={{
              width: '100%', padding: '11px 14px', background: 'transparent',
              border: 'none', borderTop: i > 0 ? `1px solid ${T.divider}` : 'none',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              transition: 'background .1s',
              display: 'flex', flexDirection: 'column', gap: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `${PRIMARY}08`)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>
                {r.name}
              </span>
              <span style={{ fontSize: 12, color: T.subtle }}>
                {r.postcode} {r.city} · {r.context?.split(',')[0]}
              </span>
            </button>
          ))}
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
