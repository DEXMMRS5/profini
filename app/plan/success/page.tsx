'use client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import { IconCheckCircle } from '@/components/icons'
import { PrimaryButton } from '@/components/Buttons'

export default function PlanSuccessPage() {
  const router = useRouter()
  const { theme: T } = useTheme()
  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: T.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', gap: 24, fontFamily: 'Inter, sans-serif', color: T.text }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'successPop .6s cubic-bezier(.34,1.56,.64,1)' }}>
          <div style={{ color: '#2BA464' }}><IconCheckCircle size={60} sw={1.5} /></div>
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#27500A', margin: '0 0 8px' }}>Abonnement activé !</h1>
          <p style={{ fontSize: 14, color: T.subtle, margin: 0, lineHeight: 1.6 }}>Bienvenue dans ProFini. Votre facture vous a été envoyée par email. Bonne productivité !</p>
        </div>
        <PrimaryButton onClick={() => router.push('/')}>Accéder à mon espace →</PrimaryButton>
      </div>
    </MobileShell>
  )
}
