'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import MobileShell from '@/components/MobileShell'
import FormHeader from '@/components/FormHeader'
import Badge from '@/components/Badge'
import { Chantier, ChantierStatus, montantHT, tva, formatEur } from '@/lib/types'
import { IconMapPin, IconPhone, IconMail, IconDownload, IconCheck, IconCalendar } from '@/components/icons'
import { PrimaryButton } from '@/components/Buttons'

const PRIMARY = '#15355B'
const STATUTS: { value: ChantierStatus; label: string; color: string }[] = [
  { value: 'encours', label: 'En cours',  color: '#EF9F27' },
  { value: 'impaye',  label: 'Impayé',    color: '#E24B4A' },
  { value: 'paye',    label: 'Payé',      color: '#639922' },
  { value: 'cloture', label: 'Clôturé',   color: '#639922' },
]

export default function ChantierDetailClient({ chantier: initial }: { chantier: Chantier }) {
  const router  = useRouter()
  const { theme: T } = useTheme()
  const [chantier, setChantier] = useState(initial)
  const [changingStatus, setChangingStatus] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  const ht  = montantHT(chantier.montant_ttc)
  const tax = tva(chantier.montant_ttc)
  const isClosed = chantier.status === 'cloture' || chantier.status === 'paye'

  async function changeStatus(s: ChantierStatus) {
    setSavingStatus(true)
    const res = await fetch(`/api/chantiers/${chantier.id}/statut`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }),
    })
    if (res.ok) { const d = await res.json(); setChantier(c => ({ ...c, status: d.status })) }
    setSavingStatus(false); setChangingStatus(false)
  }

  function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }

  return (
    <MobileShell>
      <div style={{ width: '100%', minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: T.text }}>
        <FormHeader title="Détail chantier" backHref="/" cancelLabel="Retour" />

        <div className="pf-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* En-tête */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 21, fontWeight: 700, color: T.text }}>{chantier.nom_client}</div>
              <div style={{ fontSize: 14, color: T.subtle, marginTop: 2 }}>{chantier.type_travaux}</div>
              {chantier.date_chantier && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.muted, marginTop: 5 }}>
                  <IconCalendar size={12} sw={2} />{fmtDate(chantier.date_chantier)}
                </div>
              )}
            </div>
            <button onClick={() => setChangingStatus(c => !c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Badge status={chantier.status} />
            </button>
          </div>

          {/* Changement de statut */}
          {changingStatus && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, animation: 'slideUp .2s ease-out' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Changer le statut</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUTS.map(s => (
                  <button key={s.value} onClick={() => changeStatus(s.value)} disabled={savingStatus || s.value === chantier.status} style={{
                    padding: '8px 14px', borderRadius: 999, border: `1.5px solid ${s.value === chantier.status ? s.color : T.border}`,
                    background: s.value === chantier.status ? `${s.color}18` : 'transparent',
                    color: s.value === chantier.status ? s.color : T.subtle, fontWeight: 600, fontSize: 12, cursor: s.value === chantier.status ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {s.value === chantier.status && <IconCheck size={12} sw={2.5} />}{s.label}
                  </button>
                ))}
              </div>
              {savingStatus && <div style={{ fontSize: 12, color: T.muted }}>Sauvegarde…</div>}
            </div>
          )}

          {/* Contact */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${T.divider}`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.subtle }}>
              <IconMapPin size={14} sw={1.75} />{chantier.adresse}
            </div>
            {chantier.tel_client && (
              <a href={`tel:${chantier.tel_client}`} style={{ padding: '12px 14px', borderBottom: chantier.email_client ? `1px solid ${T.divider}` : 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: PRIMARY, fontWeight: 500, textDecoration: 'none' }}>
                <IconPhone size={14} sw={1.75} />{chantier.tel_client}
              </a>
            )}
            {chantier.email_client && (
              <a href={`mailto:${chantier.email_client}`} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: PRIMARY, fontWeight: 500, textDecoration: 'none' }}>
                <IconMail size={14} sw={1.75} />{chantier.email_client}
              </a>
            )}
          </div>

          {/* Financier */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
            {[{ l: 'Montant HT', v: formatEur(ht) }, { l: 'TVA 20%', v: formatEur(tax) }, { l: 'Total TTC', v: formatEur(chantier.montant_ttc), b: true }].map((r, i, a) => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderBottom: i < a.length - 1 ? `1px solid ${T.divider}` : 'none' }}>
                <span style={{ fontSize: 14, color: r.b ? T.text : T.subtle, fontWeight: r.b ? 600 : 400 }}>{r.l}</span>
                <span style={{ fontSize: r.b ? 16 : 14, fontWeight: r.b ? 700 : 500, color: T.text }}>{r.v}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {chantier.description && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Description</div>
              <div style={{ fontSize: 14, color: T.subtle, lineHeight: 1.6 }}>{chantier.description}</div>
            </div>
          )}

          {/* Signatures */}
          {(chantier.sig_artisan_path || chantier.sig_client_path || chantier.sig_artisan_url || chantier.sig_client_url) && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>Signatures</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ label: 'Artisan', ok: !!(chantier.sig_artisan_path || chantier.sig_artisan_url) }, { label: 'Client', ok: !!(chantier.sig_client_path || chantier.sig_client_url) }].map(s => (
                  <div key={s.label} style={{ flex: 1, background: T.bgAlt, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.ok ? '#22C55E' : T.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.ok && <IconCheck size={10} sw={3} color="#fff" />}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: s.ok ? '#22C55E' : T.muted }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF */}
          {chantier.pdf_url && (
            <a href={chantier.pdf_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: `${PRIMARY}08`, border: `1px solid ${PRIMARY}25`, borderRadius: 14, color: PRIMARY, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
              <IconDownload size={17} sw={2} />Télécharger le procès-verbal PDF
            </a>
          )}
        </div>

        {!isClosed && (
          <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px 28px', background: T.nav, borderTop: `0.5px solid ${T.border}` }}>
            <PrimaryButton onClick={() => router.push(`/chantiers/${chantier.id}/photos`)}>
              Lancer la clôture →
            </PrimaryButton>
          </div>
        )}
      </div>
    </MobileShell>
  )
}
