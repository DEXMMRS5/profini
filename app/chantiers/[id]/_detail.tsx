'use client'
import { useRouter } from 'next/navigation'
import MobileShell from '@/components/MobileShell'
import StatusBar from '@/components/StatusBar'
import FormHeader from '@/components/FormHeader'
import Badge from '@/components/Badge'
import { Chantier, montantHT, tva, formatEur } from '@/lib/types'
import { IconMapPin, IconPhone, IconMail, IconEuro } from '@/components/icons'
import { PrimaryButton } from '@/components/Buttons'

const PRIMARY = '#15355B'

export default function ChantierDetailClient({ chantier }: { chantier: Chantier }) {
  const router = useRouter()
  const ht  = montantHT(chantier.montant_ttc)
  const tax = tva(chantier.montant_ttc)

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: '#111827' }}>
        <StatusBar />
        <FormHeader title="Détail chantier" backHref="/" cancelLabel="Retour" />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{chantier.nom_client}</div>
              <div style={{ fontSize: 15, color: '#6B7280', marginTop: 2 }}>{chantier.type_travaux}</div>
            </div>
            <Badge status={chantier.status} />
          </div>

          {/* Info card */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#6B7280' }}>
              <IconMapPin size={16} sw={1.75} />{chantier.adresse}
            </div>
            {chantier.tel_client && (
              <a href={`tel:${chantier.tel_client}`} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: PRIMARY, fontWeight: 500, textDecoration: 'none' }}>
                <IconPhone size={16} sw={1.75} />{chantier.tel_client}
              </a>
            )}
            {chantier.email_client && (
              <a href={`mailto:${chantier.email_client}`} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: PRIMARY, fontWeight: 500, textDecoration: 'none' }}>
                <IconMail size={16} sw={1.75} />{chantier.email_client}
              </a>
            )}
          </div>

          {/* Financial */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
            {[
              { label: 'Montant HT', value: formatEur(ht) },
              { label: 'TVA 20%', value: formatEur(tax) },
              { label: 'Montant TTC', value: formatEur(chantier.montant_ttc), bold: true },
            ].map((r, i, arr) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <span style={{ fontSize: 14, color: r.bold ? '#111827' : '#6B7280', fontWeight: r.bold ? 500 : 400 }}>{r.label}</span>
                <span style={{ fontSize: r.bold ? 16 : 14, fontWeight: r.bold ? 700 : 500, color: '#111827' }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {chantier.description && (
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#6B7280', marginBottom: 10 }}>Description</div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{chantier.description}</div>
            </div>
          )}

          {/* PDF */}
          {chantier.pdf_url && (
            <a href={chantier.pdf_url} target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: 16,
              background: `${PRIMARY}08`, border: `1px solid ${PRIMARY}20`, borderRadius: 16,
              color: PRIMARY, fontWeight: 600, textDecoration: 'none', fontSize: 15,
            }}>
              <IconEuro size={20} sw={2} />Télécharger le procès-verbal PDF
            </a>
          )}
        </div>

        {/* CTA — resume flow if not closed */}
        {chantier.status !== 'cloture' && (
          <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px 28px', background: '#fff', borderTop: '0.5px solid #E5E7EB' }}>
            <PrimaryButton onClick={() => router.push(`/chantiers/${chantier.id}/photos`)}>
              Reprendre le flow de clôture
            </PrimaryButton>
          </div>
        )}
      </div>
    </MobileShell>
  )
}
