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
import { IconHand, IconRotateCcw } from '@/components/icons'

export default function SignatureArtisanPage() {
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
      body: JSON.stringify({ variant: 'artisan', dataUrl }),
    })
    router.push(`/chantiers/${id}/signature-client`)
  }

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex',
        flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <StatusBar dark={T.dark} />
        <FormHeader title="Votre signature" backHref={`/chantiers/${id}/photos`} />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Contexte */}
          <div style={{ padding: '12px 14px', background: `${'#15355B'}0D`, border: `1px solid ${'#15355B'}25`, borderRadius: 12, fontSize: 14, color: T.text, lineHeight: 1.5 }}>
            <strong style={{ color: '#15355B' }}>Étape 1/2</strong> — Vous signez en premier en tant qu'artisan, puis votre client signera.
          </div>

          <SignatureCanvas key={cleared} onChange={setHasInk} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.muted, fontSize: 13 }}>
            <IconHand size={15} sw={1.75} />
            Tracez votre signature avec le doigt ou la souris.
          </div>
        </div>

        <BottomBar>
          <SecondaryButton onClick={handleClear} icon={IconRotateCcw} fullWidth>Effacer</SecondaryButton>
          <div style={{ flex: 1 }}>
            <PrimaryButton disabled={!hasInk} loading={loading} onClick={handleValidate}>
              Valider ma signature
            </PrimaryButton>
          </div>
        </BottomBar>
      </div>
    </MobileShell>
  )
}
