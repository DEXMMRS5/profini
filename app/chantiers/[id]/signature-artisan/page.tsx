'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  const id = params.id
  const [hasInk, setHasInk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cleared, setCleared] = useState(0)

  function handleClear() { setCleared(c => c + 1); setHasInk(false) }

  async function handleValidate() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement & { captureSignature?: () => string | null }
    const dataUrl = canvas?.captureSignature?.() ?? canvas?.toDataURL('image/png') ?? null
    if (!dataUrl || !hasInk) return
    setLoading(true)
    console.log('[signature-artisan] saving')
    await fetch(`/api/chantiers/${id}/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant: 'artisan', dataUrl }),
    })
    console.log('[signature-artisan] done')
    router.push(`/chantiers/${id}/signature-client`)
  }

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>
        <StatusBar />
        <FormHeader title="Votre signature" backHref={`/chantiers/${id}/photos`} />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SignatureCanvas key={cleared} onChange={setHasInk} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 13 }}>
            <IconHand size={16} sw={1.75} />
            Signez directement sur l&apos;écran avec votre doigt.
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
