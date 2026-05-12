'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Theme {
  dark: boolean
  // Surfaces
  bg:      string
  bgAlt:   string
  card:    string
  // Textes
  text:    string
  subtle:  string
  muted:   string
  // Bordures
  border:  string
  divider: string
  // Nav
  nav:     string
  // Primaire (inchangé)
  primary: string
  accent:  string
}

function buildTheme(dark: boolean): Theme {
  return dark ? {
    dark: true,
    bg:      '#0B1220',
    bgAlt:   '#111827',
    card:    '#1F2937',
    text:    '#F9FAFB',
    subtle:  '#9CA3AF',
    muted:   '#6B7280',
    border:  '#374151',
    divider: '#1F2937',
    nav:     '#111827',
    primary: '#15355B',
    accent:  '#2BA464',
  } : {
    dark: false,
    bg:      '#F9FAFB',
    bgAlt:   '#F3F4F6',
    card:    '#FFFFFF',
    text:    '#111827',
    subtle:  '#6B7280',
    muted:   '#9CA3AF',
    border:  '#E5E7EB',
    divider: '#F3F4F6',
    nav:     '#FFFFFF',
    primary: '#15355B',
    accent:  '#2BA464',
  }
}

const ThemeCtx = createContext<{
  theme: Theme
  toggle: () => void
}>({ theme: buildTheme(false), toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('profini-dark')
    if (stored === '1') setDark(true)
  }, [])

  function toggle() {
    setDark(d => {
      localStorage.setItem('profini-dark', d ? '0' : '1')
      return !d
    })
  }

  return (
    <ThemeCtx.Provider value={{ theme: buildTheme(dark), toggle }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeCtx)
}
