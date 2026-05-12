'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import FormHeader from '@/components/FormHeader'
import { PrimaryButton } from '@/components/Buttons'
import BottomBar from '@/components/BottomBar'
import { Chantier, montantHT, tva, formatEur } from '@/lib/types'
import { IconUser, IconEuro, IconFile, IconMapPin, IconPhone, IconCheck, IconDownload, IconRocket } from '@/components/icons'

const PRIMARY = '#15355B'

export default function RecapClient({ chantier }: { chantier: Chantier }) {
  const router = useRouter()
  const { theme: T } = useTheme()
  const [paid, setPaid] = useState(false)
  const [review, setReview] = useState(true)
  const [loading, setLoading] = useState(false)

  const ht  = montantHT(chantier.montant_ttc)
  const tax = tva(chantier.montant_ttc)

  function Card({ children, pad = 16 }: { children: React.ReactNode; pad?: number }) {
    return <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: pad, boxShadow: T.dark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>{children}</div>
  }

  function SLabel({ children, icon: Ico }: { children: React.ReactNode; icon?: React.ComponentType<{ size?: number; sw?: number }> }) {
    return <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' as const, color: T.muted, padding: '0 2px' }}>{Ico && <Ico size={12} sw={2} />}{children}</div>
  }

  function Row({ label, value, bold, last }: { label: string; value: string; bold?: boolean; last?: boolean }) {
    return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: last ? 'none' : `1px solid ${T.divider}` }}>
      <span style={{ fontSize: 14, color: bold ? T.text : T.subtle, fontWeight: bold ? 500 : 400 }}>{label}</span>
      <span style={{ fontSize: bold ? 16 : 14, color: T.text, fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  }

  function CheckRow({ checked, onToggle, label, sub }: { checked: boolean; onToggle: () => void; label: string; sub?: string }) {
    return <button onClick={onToggle} style={{ width: '100%', padding: '12px 4px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'inherit', textAlign: 'left' }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${checked ? PRIMARY : T.border}`, background: checked ? PRIMARY : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
        {checked && <IconCheck size={14} sw={3} color="#fff" />}
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, color: T.text }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{sub}</div>}
      </div>
    </button>
  }

  async function handleCloture() {
    setLoading(true)
    await fetch(`/api/chantiers/${chantier.id}/cloture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paiement_recu: paid, demande_avis: review }),
    })
    router.push(`/chantiers/${chantier.id}/succes`)
  }

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex',
        flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <StatusBar dark={T.dark} />
        <FormHeader title="Récapitulatif" backHref={`/chantiers/${chantier.id}/signature-client`} />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Client */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SLabel icon={IconUser}>Client</SLabel>
            <Card>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{chantier.nom_client}</div>
              <div style={{ fontSize: 14, color: T.subtle, marginTop: 2 }}>{chantier.type_travaux}</div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.subtle }}>
                  <IconMapPin size={14} sw={1.75} />{chantier.adresse}
                </div>
                {chantier.tel_client && (
                  <a href={`tel:${chantier.tel_client}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: PRIMARY, textDecoration: 'none', fontWeight: 500 }}>
                    <IconPhone size={14} sw={1.75} />{chantier.tel_client}
                  </a>
                )}
              </div>
            </Card>
          </div>

          {/* Financier */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SLabel icon={IconEuro}>Financier</SLabel>
            <Card pad={0}>
              <div style={{ padding: '0 16px' }}>
                <Row label="Montant HT" value={formatEur(ht)} />
                <Row label="TVA 20%" value={formatEur(tax)} />
                <Row label="Total TTC" value={formatEur(chantier.montant_ttc)} bold last />
              </div>
            </Card>
          </div>

          {/* Signatures */}
          {(chantier.sig_artisan_url || chantier.sig_client_url) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SLabel>Signatures collectées</SLabel>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ label: 'Artisan', url: chantier.sig_artisan_url }, { label: 'Client', url: chantier.sig_client_url }].map(s => (
                  <div key={s.label} style={{ flex: 1, background: T.card, border: `1px solid ${s.url ? '#22C55E50' : T.border}`, borderRadius: 12, padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: s.url ? '#22C55E' : T.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.url && <IconCheck size={11} sw={3} color="#fff" />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: s.url ? '#22C55E' : T.muted }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SLabel icon={IconFile}>Document</SLabel>
            <Card>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {/* Mini PDF thumb */}
                <div style={{ width: 52, height: 68, background: '#fff', borderRadius: 6, border: `1px solid ${T.border}`, padding: 6, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ height: 3, background: PRIMARY, borderRadius: 1, width: '70%', marginBottom: 4 }} />
                  {[...Array(5)].map((_, i) => <div key={i} style={{ height: 2, background: T.border, borderRadius: 1, marginBottom: 3, width: `${60 + (i % 2) * 20}%` }} />)}
                  <div style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 6, fontWeight: 700, color: PRIMARY }}>PDF</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>Procès-verbal de réception</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 3, lineHeight: 1.4 }}>Généré et envoyé automatiquement à la clôture.</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: '#22C55E', fontWeight: 600 }}>
                    <IconCheck size={12} sw={2.5} />Signatures incluses
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SLabel>Options de clôture</SLabel>
            <Card pad={0}>
              <div style={{ padding: '0 16px' }}>
                <CheckRow checked={paid} onToggle={() => setPaid(p => !p)} label="Paiement reçu sur place" />
                <div style={{ height: 1, background: T.divider }} />
                <CheckRow checked={review} onToggle={() => setReview(r => !r)}
                  label="Demande d'avis Google" sub="SMS envoyé au client après clôture" />
              </div>
            </Card>
          </div>
        </div>

        <BottomBar>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, color: T.muted, textAlign: 'center' }}>
              Le procès-verbal sera généré et envoyé par email.
            </div>
            <PrimaryButton onClick={handleCloture} loading={loading} icon={IconRocket} pulse>
              Clôturer le chantier
            </PrimaryButton>
          </div>
        </BottomBar>
      </div>
    </MobileShell>
  )
}
