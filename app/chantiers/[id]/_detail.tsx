'use client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import FormHeader from '@/components/FormHeader'
import Badge from '@/components/Badge'
import { Chantier, ChantierStatus, montantHT, tva, formatEur } from '@/lib/types'
import { IconMapPin, IconPhone, IconMail, IconDownload, IconCheck } from '@/components/icons'
import { PrimaryButton } from '@/components/Buttons'

const PRIMARY = '#15355B'

export default function ChantierDetailClient({ chantier }: { chantier: Chantier }) {
  const router = useRouter()
  const { theme: T } = useTheme()
  const ht  = montantHT(chantier.montant_ttc)
  const tax = tva(chantier.montant_ttc)

  function Row({ label, value, bold, last }: { label: string; value: string; bold?: boolean; last?: boolean }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: last ? 'none' : `1px solid ${T.divider}` }}>
        <span style={{ fontSize: 14, color: T.subtle }}>{label}</span>
        <span style={{ fontSize: bold ? 16 : 14, fontWeight: bold ? 700 : 500, color: T.text }}>{value}</span>
      </div>
    )
  }

  const isClosed = chantier.status === 'cloture' || chantier.status === 'paye'

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex',
        flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <StatusBar dark={T.dark} />
        <FormHeader title="Détail chantier" backHref="/" cancelLabel="Retour" />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* En-tête */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{chantier.nom_client}</div>
              <div style={{ fontSize: 15, color: T.subtle, marginTop: 2 }}>{chantier.type_travaux}</div>
            </div>
            <Badge status={chantier.status as ChantierStatus} />
          </div>

          {/* Contact */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.divider}`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: T.subtle }}>
              <IconMapPin size={15} sw={1.75} />{chantier.adresse}
            </div>
            {chantier.tel_client && (
              <a href={`tel:${chantier.tel_client}`} style={{ padding: '14px 16px', borderBottom: chantier.email_client ? `1px solid ${T.divider}` : 'none', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: PRIMARY, fontWeight: 500, textDecoration: 'none' }}>
                <IconPhone size={15} sw={1.75} />{chantier.tel_client}
              </a>
            )}
            {chantier.email_client && (
              <a href={`mailto:${chantier.email_client}`} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: PRIMARY, fontWeight: 500, textDecoration: 'none' }}>
                <IconMail size={15} sw={1.75} />{chantier.email_client}
              </a>
            )}
          </div>

          {/* Financier */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <Row label="Montant HT" value={formatEur(ht)} />
            <Row label="TVA 20%" value={formatEur(tax)} />
            <Row label="Total TTC" value={formatEur(chantier.montant_ttc)} bold last />
          </div>

          {/* Description */}
          {chantier.description && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Description</div>
              <div style={{ fontSize: 14, color: T.subtle, lineHeight: 1.6 }}>{chantier.description}</div>
            </div>
          )}

          {/* Signatures */}
          {(chantier.sig_artisan_url || chantier.sig_client_url) && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>Signatures</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ label: 'Artisan', url: chantier.sig_artisan_url }, { label: 'Client', url: chantier.sig_client_url }].map(s => (
                  <div key={s.label} style={{ flex: 1, background: T.bgAlt, borderRadius: 10, padding: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.url ? '#22C55E' : T.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.url && <IconCheck size={10} sw={3} color="#fff" />}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: s.url ? '#22C55E' : T.muted }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF */}
          {chantier.pdf_url && (
            <a href={chantier.pdf_url} target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
              background: `${PRIMARY}08`, border: `1px solid ${PRIMARY}25`, borderRadius: 14,
              color: PRIMARY, fontWeight: 600, textDecoration: 'none', fontSize: 14,
            }}>
              <IconDownload size={18} sw={2} />Télécharger le procès-verbal PDF
            </a>
          )}
        </div>

        {/* CTA si non clôturé */}
        {!isClosed && (
          <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px 28px',
            background: T.nav, borderTop: `0.5px solid ${T.border}` }}>
            <PrimaryButton onClick={() => router.push(`/chantiers/${chantier.id}/photos`)}>
              Reprendre la clôture →
            </PrimaryButton>
          </div>
        )}
      </div>
    </MobileShell>
  )
}
