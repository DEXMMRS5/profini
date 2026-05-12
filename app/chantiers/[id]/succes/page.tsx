'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import { PrimaryButton } from '@/components/Buttons'
import { IconCheckCircle, IconCheck } from '@/components/icons'

export default function SuccesPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [600, 1100, 1600].map((d, i) => setTimeout(() => setStep(i + 1), d))
    return () => timers.forEach(clearTimeout)
  }, [])

  const items = ['PDF généré et envoyé', 'Client notifié par email', "Demande d'avis envoyée"]

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>
        <StatusBar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', gap: 32 }}>

          {/* Success icon */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'successPop .55s cubic-bezier(.34,1.56,.64,1) both' }}>
              <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px solid #63992233', animation: 'fadeIn .5s ease-out .4s both' }} />
              <div style={{ color: '#639922' }}>
                <IconCheckCircle size={72} sw={1.5} />
              </div>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#27500A', margin: 0, letterSpacing: -0.4, animation: 'slideUp .5s ease-out .3s both' }}>
              Chantier clôturé !
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '8px 0 0', animation: 'slideUp .5s ease-out .4s both' }}>
              Tout est en ordre, votre client a reçu son procès-verbal.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 280 }}>
            {items.map((it, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: step > i ? 1 : 0.25,
                transform: step > i ? 'translateX(0)' : 'translateX(-6px)',
                transition: 'all .35s ease-out',
                fontSize: 15, color: '#374151', textAlign: 'left',
              }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: step > i ? '#639922' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, transition: 'all .2s' }}>
                  {step > i && <IconCheck size={14} sw={3} />}
                </div>
                {it}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 16px 34px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <PrimaryButton onClick={() => router.push('/')}>Retour au dashboard</PrimaryButton>
          <button onClick={() => router.push(`/chantiers/${params.id}`)} style={{ height: 48, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontFamily: 'inherit', fontSize: 15, fontWeight: 500 }}>
            Voir le procès-verbal
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 100, background: 'rgba(0,0,0,0.2)', zIndex: 20, pointerEvents: 'none' }} />
      </div>
    </MobileShell>
  )
}
