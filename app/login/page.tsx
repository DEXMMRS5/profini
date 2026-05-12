'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProFiniLogo from '@/components/ProFiniLogo'
import { PrimaryButton } from '@/components/Buttons'

const PRIMARY = '#15355B'
const ACCENT  = '#2BA464'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    if (mode === 'register') {
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { nom } },
      })
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError('Email ou mot de passe incorrect'); setLoading(false); return }
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at top, rgba(43,164,100,0.08), transparent 50%),
                   linear-gradient(180deg, #0F1729 0%, #1A2540 100%)`,
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#fff', borderRadius: 24,
        padding: '40px 32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <ProFiniLogo color={PRIMARY} accent={ACCENT} size={36} />
          <span style={{ fontSize: 24, fontWeight: 700, color: PRIMARY, letterSpacing: -0.5 }}>ProFini</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 28px' }}>
          {mode === 'login' ? 'Accédez à votre espace artisan.' : 'Commencez à gérer vos chantiers.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Votre nom</span>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)}
                required placeholder="Thomas Bertrand"
                style={inputSt} />
            </label>
          )}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="artisan@email.fr"
              style={inputSt} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Mot de passe</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••"
              style={inputSt} />
          </label>

          {error && (
            <div style={{ fontSize: 13, color: '#E24B4A', background: '#FCEBEB',
              padding: '10px 14px', borderRadius: 10 }}>{error}</div>
          )}

          <PrimaryButton type="submit" loading={loading}>
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </PrimaryButton>
        </form>

        <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
          style={{ marginTop: 20, width: '100%', background: 'none', border: 'none',
            fontSize: 14, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit' }}>
          {mode === 'login'
            ? <>Pas encore de compte ? <span style={{ color: PRIMARY, fontWeight: 600 }}>Créer un compte</span></>
            : <>Déjà un compte ? <span style={{ color: PRIMARY, fontWeight: 600 }}>Se connecter</span></>
          }
        </button>
      </div>
    </div>
  )
}

const inputSt: React.CSSProperties = {
  width: '100%', height: 48, padding: '0 14px',
  fontSize: 16, fontFamily: 'inherit', color: '#111827',
  background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: 12, outline: 'none', boxSizing: 'border-box',
}
