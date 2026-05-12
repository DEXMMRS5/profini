'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import ProFiniLogo from '@/components/ProFiniLogo'
import { PrimaryButton } from '@/components/Buttons'
import PhoneInput from '@/components/PhoneInput'
import { IconMail, IconCheck } from '@/components/icons'

const PRIMARY = '#15355B'
const ACCENT  = '#2BA464'

export default function LoginPage() {
  const router = useRouter()
  const { theme: T } = useTheme()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tel, setTel] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const validEmail = /^[^@]+@[^@]+\.[^@]+$/.test(email)
  const validPassword = password.length >= 6

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validEmail) { setError('Email invalide'); return }
    if (!validPassword) { setError('Mot de passe trop court (6 caractères min.)'); return }

    setLoading(true)
    const supabase = createClient()

    if (mode === 'register') {
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { nom: nom || email.split('@')[0], tel } },
      })
      if (err) { setError(err.message === 'User already registered' ? 'Ce compte existe déjà. Connectez-vous.' : err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError('Email ou mot de passe incorrect'); setLoading(false); return }
    }

    router.push('/')
    router.refresh()
  }

  function inp(name: string): React.CSSProperties {
    const isFocus = focused === name
    return {
      width: '100%', height: 48, padding: '0 14px',
      fontSize: 15, fontFamily: 'inherit', color: T.text,
      background: isFocus ? T.card : T.bgAlt,
      border: `1px solid ${isFocus ? PRIMARY : T.border}`,
      borderRadius: 12, outline: 'none', boxSizing: 'border-box',
      boxShadow: isFocus ? `0 0 0 3px ${PRIMARY}18` : 'none', transition: 'all .15s',
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, rgba(43,164,100,0.08), transparent 50%), linear-gradient(180deg, #0F1729 0%, #1A2540 100%)',
      padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 390,
        background: T.card, borderRadius: 24, padding: '36px 28px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        border: `1px solid ${T.border}`,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <ProFiniLogo color={PRIMARY} accent={ACCENT} size={34} />
          <span style={{ fontSize: 22, fontWeight: 700, color: PRIMARY, letterSpacing: -0.3 }}>ProFini</span>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h1>
        <p style={{ fontSize: 14, color: T.subtle, margin: '0 0 24px' }}>
          {mode === 'login' ? 'Accédez à votre espace artisan.' : 'Commencez à gérer vos chantiers.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.subtle }}>Votre nom</span>
                <input type="text" value={nom} onChange={e => setNom(e.target.value)}
                  placeholder="Thomas Bertrand" autoComplete="name"
                  onFocus={() => setFocused('nom')} onBlur={() => setFocused(null)}
                  style={inp('nom')} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.subtle }}>Téléphone (optionnel)</span>
                <PhoneInput value={tel} onChange={setTel} />
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.subtle }}>Email professionnel</span>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }}>
                <IconMail size={17} sw={1.75} />
              </div>
              {validEmail && email && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconCheck size={11} sw={3} color="#fff" />
                </div>
              )}
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="artisan@email.fr" autoComplete="email"
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                style={{ ...inp('email'), paddingLeft: 38, paddingRight: validEmail && email ? 38 : 14 }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.subtle }}>Mot de passe</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder={mode === 'register' ? 'Minimum 6 caractères' : '••••••••'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              onFocus={() => setFocused('pwd')} onBlur={() => setFocused(null)}
              style={inp('pwd')} />
            {mode === 'register' && password && (
              <div style={{ fontSize: 11, color: validPassword ? '#22C55E' : '#F59E0B', display: 'flex', alignItems: 'center', gap: 4 }}>
                {validPassword ? <IconCheck size={11} sw={2.5} /> : '·'}
                {validPassword ? 'Mot de passe valide' : `${6 - password.length} caractères manquants`}
              </div>
            )}
          </div>

          {error && (
            <div style={{ fontSize: 13, color: '#E24B4A', background: T.dark ? 'rgba(226,75,74,0.15)' : '#FCEBEB',
              padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(226,75,74,0.25)' }}>
              {error}
            </div>
          )}

          <PrimaryButton type="submit" loading={loading}>
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </PrimaryButton>
        </form>

        <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
          style={{ marginTop: 18, width: '100%', background: 'none', border: 'none',
            fontSize: 14, color: T.subtle, cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.5 }}>
          {mode === 'login'
            ? <>Pas encore de compte ? <span style={{ color: PRIMARY, fontWeight: 600 }}>Créer un compte</span></>
            : <>Déjà un compte ? <span style={{ color: PRIMARY, fontWeight: 600 }}>Se connecter</span></>
          }
        </button>
      </div>
    </div>
  )
}
