'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import FormHeader from '@/components/FormHeader'
import { PrimaryButton } from '@/components/Buttons'
import BottomBar from '@/components/BottomBar'
import { Chantier, montantHT, tva, formatEur } from '@/lib/types'
import { IconUser, IconEuro, IconFile, IconMapPin, IconPhone, IconCheck, IconDownload, IconRocket } from '@/components/icons'

const PRIMARY = '#15355B'

function Card({ children, padding = 16 }: { children: React.ReactNode; padding?: number }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  )
}

function SectionLabel({ children, icon: Ico }: { children: React.ReactNode; icon?: React.ComponentType<{ size?: number; sw?: number }> }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#6B7280', padding: '0 4px' }}>
      {Ico && <Ico size={13} sw={2} />}{children}
    </div>
  )
}

function Row({ label, value, bold, last }: { label: string; value: string; bold?: boolean; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: last ? 'none' : '1px solid #F3F4F6' }}>
      <span style={{ fontSize: 14, color: bold ? '#111827' : '#6B7280', fontWeight: bold ? 500 : 400 }}>{label}</span>
      <span style={{ fontSize: bold ? 16 : 14, color: '#111827', fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  )
}

function CheckboxRow({ checked, onToggle, label, subLabel }: { checked: boolean; onToggle: () => void; label: string; subLabel?: string }) {
  return (
    <button onClick={onToggle} style={{ width: '100%', minHeight: subLabel ? 72 : 56, padding: '12px 4px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'inherit', textAlign: 'left' }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${checked ? PRIMARY : '#D1D5DB'}`, background: checked ? PRIMARY : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
        {checked && <IconCheck size={16} sw={3} color="#fff" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>{label}</div>
        {subLabel && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{subLabel}</div>}
      </div>
    </button>
  )
}

function PdfThumbnail() {
  return (
    <div style={{ width: 80, height: 110, background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB', padding: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: 4, background: PRIMARY, borderRadius: 1, width: '70%' }} />
      {[1,2,3,4].map(i => <div key={i} style={{ height: 2, background: '#E5E7EB', borderRadius: 1, width: i % 2 === 0 ? '80%' : '60%' }} />)}
      <div style={{ position: 'absolute', bottom: 6, right: 6, fontSize: 8, fontWeight: 700, color: PRIMARY, letterSpacing: 0.4 }}>PDF</div>
    </div>
  )
}

export default function RecapClient({ chantier }: { chantier: Chantier }) {
  const router = useRouter()
  const [paid, setPaid] = useState(false)
  const [review, setReview] = useState(true)
  const [loading, setLoading] = useState(false)

  const ht  = montantHT(chantier.montant_ttc)
  const tax = tva(chantier.montant_ttc)

  async function handleCloture() {
    setLoading(true)
    console.log('[recap] cloture start', chantier.id)
    const res = await fetch(`/api/chantiers/${chantier.id}/cloture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paiement_recu: paid, demande_avis: review }),
    })
    console.log('[recap] cloture end', res.status)
    router.push(`/chantiers/${chantier.id}/succes`)
  }

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>
        <StatusBar />
        <FormHeader title="Récapitulatif" backHref={`/chantiers/${chantier.id}/signature-client`} />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Client */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionLabel icon={IconUser}>Client</SectionLabel>
            <Card>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{chantier.nom_client}</div>
              <div style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>{chantier.type_travaux}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6B7280' }}>
                  <IconMapPin size={16} sw={1.75} />{chantier.adresse}
                </div>
                {chantier.tel_client && (
                  <a href={`tel:${chantier.tel_client}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: PRIMARY, textDecoration: 'none', fontWeight: 500 }}>
                    <IconPhone size={16} sw={1.75} />{chantier.tel_client}
                  </a>
                )}
              </div>
            </Card>
          </div>

          {/* Financial */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionLabel icon={IconEuro}>Financier</SectionLabel>
            <Card padding={4}>
              <div style={{ padding: '0 16px' }}>
                <Row label="Montant HT" value={formatEur(ht)} />
                <Row label="TVA 20%" value={formatEur(tax)} />
                <Row label="Montant TTC" value={formatEur(chantier.montant_ttc)} bold last />
              </div>
            </Card>
          </div>

          {/* Documents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionLabel icon={IconFile}>Documents</SectionLabel>
            <Card>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <PdfThumbnail />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>Procès-verbal de réception</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 1.4 }}>Envoyé par email aux deux parties à la clôture.</div>
                  <button style={{ marginTop: 10, padding: 0, background: 'none', border: 'none', color: PRIMARY, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                    <IconDownload size={15} sw={2} />Prévisualiser
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionLabel>Options de clôture</SectionLabel>
            <Card padding={4}>
              <div style={{ padding: '0 16px' }}>
                <CheckboxRow checked={paid} onToggle={() => setPaid(p => !p)} label="Paiement reçu sur place" />
                <div style={{ height: 1, background: '#F3F4F6' }} />
                <CheckboxRow checked={review} onToggle={() => setReview(r => !r)} label="Envoyer demande d'avis Google" subLabel="SMS envoyé immédiatement au client" />
              </div>
            </Card>
          </div>
        </div>

        <BottomBar>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
              En clôturant, le PDF sera généré et envoyé.
            </div>
            <PrimaryButton onClick={handleCloture} loading={loading} icon={IconRocket} pulse>
              Clôturer maintenant
            </PrimaryButton>
          </div>
        </BottomBar>
      </div>
    </MobileShell>
  )
}
