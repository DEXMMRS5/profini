'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  const id = params.id
  const [hasInk, setHasInk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cleared, setCleared] = useState(0)

  function handleClear() { setCleared(c => c + 1); setHasInk(false) }

  async function handleValidate() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement & { captureSignature?: () => string | null }
    const dataUrl = canvas?.captureSignature?.() ?? canvas?.toDataURL('image/png') ?? null
    if (!dataUrl) return
    setLoading(true)
    console.log('[signature-client] saving')
    await fetch(`/api/chantiers/${id}/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant: 'client', dataUrl }),
    })
    console.log('[signature-client] done')
    router.push(`/chantiers/${id}/recapitulatif`)
  }

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>
        <StatusBar />
        <FormHeader title="Signature du client" backHref={`/chantiers/${id}/signature-artisan`} />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Client handoff message */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16,
            background: `${PRIMARY}12`, border: `1px solid ${PRIMARY}33`, borderRadius: 12,
          }}>
            <div style={{ color: PRIMARY, flexShrink: 0, marginTop: 1 }}>
              <IconUserCheck size={24} sw={2} />
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.45, color: PRIMARY, fontWeight: 500 }}>
              Passez maintenant le téléphone à votre client pour qu&apos;il signe le procès-verbal de réception.
            </div>
          </div>

          <SignatureCanvas key={cleared} onChange={setHasInk} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 13 }}>
            <IconHand size={16} sw={1.75} />
            Le client signe directement sur l&apos;écran avec son doigt.
          </div>
        </div>

        <BottomBar>
          <SecondaryButton onClick={handleClear} icon={IconRotateCcw} fullWidth>Effacer</SecondaryButton>
          <div style={{ flex: 1 }}>
            <PrimaryButton disabled={!hasInk} loading={loading} onClick={handleValidate}>
              Clôturer le chantier
            </PrimaryButton>
          </div>
        </BottomBar>
      </div>
    </MobileShell>
  )
}
