'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import FormHeader from '@/components/FormHeader'
import SignatureCanvas from '@/components/SignatureCanvas'
import { PrimaryButton, SecondaryButton } from '@/components/Buttons'
import BottomBar from '@/components/BottomBar'
import { IconHand, IconRotateCcw, IconUserCheck } from '@/components/icons'

const PRIMARY = '#15355B'

export default function SignatureClientPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { theme: T } = useTheme()
  const id = params.id
  const [hasInk, setHasInk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cleared, setCleared] = useState(0)

  function handleClear() { setCleared(c => c + 1); setHasInk(false) }

  async function handleValidate() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement & { captureSignature?: () => string | null }
    const dataUrl = canvas?.captureSignature?.() ?? (hasInk ? canvas?.toDataURL('image/png') : null)
    if (!dataUrl || !hasInk) return
    setLoading(true)
    await fetch(`/api/chantiers/${id}/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant: 'client', dataUrl }),
    })
    router.push(`/chantiers/${id}/recapitulatif`)
  }

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex',
        flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <StatusBar dark={T.dark} />
        <FormHeader title="Signature du client" backHref={`/chantiers/${id}/signature-artisan`} />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Message client */}
          <div style={{ display: 'flex', gap: 12, padding: '14px 16px',
            background: T.dark ? `${PRIMARY}20` : `${PRIMARY}0E`, border: `1px solid ${PRIMARY}30`, borderRadius: 14 }}>
            <div style={{ color: PRIMARY, flexShrink: 0, marginTop: 1 }}>
              <IconUserCheck size={22} sw={2} />
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: T.dark ? '#fff' : PRIMARY, fontWeight: 500 }}>
              Passez le téléphone à votre client pour qu'il signe le procès-verbal de réception des travaux.
            </div>
          </div>

          {/* Étape */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {[{ n: 1, label: 'Artisan', done: true }, { n: 2, label: 'Client', done: false }].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {i > 0 && <div style={{ width: 24, height: 1, background: T.border }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                    background: s.done ? '#22C55E' : PRIMARY, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.done ? '✓' : s.n}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.done ? '#22C55E' : PRIMARY }}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          <SignatureCanvas key={cleared} onChange={setHasInk} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.muted, fontSize: 13 }}>
            <IconHand size={15} sw={1.75} />
            Le client trace sa signature avec le doigt.
          </div>
        </div>

        <BottomBar>
          <SecondaryButton onClick={handleClear} icon={IconRotateCcw} fullWidth>Effacer</SecondaryButton>
          <div style={{ flex: 1 }}>
            <PrimaryButton disabled={!hasInk} loading={loading} onClick={handleValidate}>
              Valider et continuer
            </PrimaryButton>
          </div>
        </BottomBar>
      </div>
    </MobileShell>
  )
}
