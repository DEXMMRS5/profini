import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Image, renderToBuffer,
} from '@react-pdf/renderer'
import { Chantier, Artisan, montantHT, tva } from './types'

const P = '#15355B'
const G = '#2BA464'

const s = StyleSheet.create({
  page:    { fontFamily: 'Helvetica', fontSize: 10, color: '#111827', padding: '40 48', backgroundColor: '#fff', lineHeight: 1.45 },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 2, borderBottomColor: P, paddingBottom: 16, marginBottom: 22 },
  logoImg:     { width: 80, height: 40, objectFit: 'contain' },
  logoText:    { fontSize: 20, fontFamily: 'Helvetica-Bold', color: P },
  logoSub:     { fontSize: 8, color: '#6B7280', marginTop: 3 },
  pvTitle:     { fontSize: 14, fontFamily: 'Helvetica-Bold', color: P, textAlign: 'right' },
  pvRef:       { fontSize: 8, color: '#6B7280', marginTop: 3, textAlign: 'right' },

  // Parties
  parties:    { flexDirection: 'row', gap: 16, marginBottom: 18 },
  partyBox:   { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 12 },
  partyLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  partyName:  { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 3 },
  partyLine:  { fontSize: 9, color: '#4B5563', marginTop: 2 },

  // Section
  sectionTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  section:      { marginBottom: 16 },

  // Description travaux
  travauxBox:   { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 12, marginBottom: 4 },
  travauxName:  { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 4 },
  travauxDesc:  { fontSize: 9, color: '#4B5563', lineHeight: 1.5 },

  // Table financière
  table:        { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden', marginBottom: 4 },
  tableHeader:  { flexDirection: 'row', backgroundColor: P, padding: '8 12' },
  tableHeaderT: { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow:     { flexDirection: 'row', padding: '7 12', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  tableRowBold: { flexDirection: 'row', padding: '9 12', borderTopWidth: 2, borderTopColor: P, backgroundColor: `${P}08` },
  tableLabel:   { flex: 1, fontSize: 9.5, color: '#374151' },
  tableValue:   { fontSize: 9.5, color: '#111827', fontFamily: 'Helvetica-Bold' },
  tableValueBold: { fontSize: 11, color: P, fontFamily: 'Helvetica-Bold' },

  // Signatures
  sigsRow:     { flexDirection: 'row', gap: 16, marginBottom: 4 },
  sigBox:      { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 12 },
  sigTitle:    { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  sigApprouv:  { fontSize: 8, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 8 },
  sigImg:      { width: '100%', height: 60, objectFit: 'contain', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 4 },
  sigLine:     { height: 1, backgroundColor: '#E5E7EB', marginBottom: 4 },
  sigName:     { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#111827' },
  sigDate:     { fontSize: 8, color: '#9CA3AF', marginTop: 2 },

  // Legal
  legalBox:    { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 10, marginBottom: 12 },
  legalTitle:  { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#374151', marginBottom: 4 },
  legalText:   { fontSize: 7.5, color: '#6B7280', lineHeight: 1.5 },

  // Footer
  footer:      { position: 'absolute', bottom: 24, left: 48, right: 48, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText:  { fontSize: 7.5, color: '#9CA3AF' },
  footerGreen: { fontSize: 7.5, color: G, fontFamily: 'Helvetica-Bold' },

  // Badge
  badge:       { backgroundColor: G, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 6 },
  badgeText:   { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#fff' },
})

interface ArtisanFull extends Artisan {
  nom_entreprise?: string; siret?: string; adresse?: string
  code_postal?: string; ville?: string; site_web?: string
  description_activite?: string; mention_tva?: string
  photo_url?: string; logo_url?: string
}

interface PVParams { chantier: Chantier; artisan: ArtisanFull | null }

function PVDocument({ chantier, artisan, date, ref, ht, tax, ttc }: {
  chantier: Chantier; artisan: ArtisanFull | null
  date: string; ref: string; ht: string; tax: string; ttc: string
}) {
  const ville = artisan?.ville ?? 'Lyon'
  const nomEntreprise = artisan?.nom_entreprise ?? artisan?.nom ?? 'Artisan'
  const mentionTva = artisan?.mention_tva ?? 'Non soumis à TVA — Article 293B du CGI'

  return (
    <Document title="Procès-verbal de réception" author={nomEntreprise} subject="Procès-verbal de réception de travaux">
      <Page size="A4" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View>
            {artisan?.logo_url
              ? <Image src={artisan.logo_url} style={s.logoImg} />
              : (
                <View>
                  <Text style={s.logoText}>ProFini</Text>
                  <Text style={s.logoSub}>Gestion de chantiers</Text>
                </View>
              )
            }
            {artisan?.nom_entreprise && <Text style={{ ...s.logoSub, marginTop: 4, fontFamily: 'Helvetica-Bold', color: P }}>{artisan.nom_entreprise}</Text>}
          </View>
          <View>
            <Text style={s.pvTitle}>PROCÈS-VERBAL DE RÉCEPTION</Text>
            <Text style={{ ...s.pvTitle, fontSize: 9, fontFamily: 'Helvetica', marginTop: 3 }}>de travaux</Text>
            <Text style={s.pvRef}>Réf. : {ref}</Text>
            <Text style={s.pvRef}>Date : {date}</Text>
            {chantier.numero_devis && <Text style={s.pvRef}>Devis N° {chantier.numero_devis}</Text>}
          </View>
        </View>

        {/* ── PARTIES ── */}
        <View style={s.parties}>
          {/* Artisan */}
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Prestataire (Artisan)</Text>
            <Text style={s.partyName}>{nomEntreprise}</Text>
            {artisan?.nom && artisan.nom !== artisan?.nom_entreprise && <Text style={s.partyLine}>{artisan.nom}</Text>}
            {artisan?.siret  && <Text style={s.partyLine}>SIRET : {artisan.siret}</Text>}
            {artisan?.adresse && <Text style={s.partyLine}>{artisan.adresse}</Text>}
            {(artisan?.code_postal || artisan?.ville) && <Text style={s.partyLine}>{[artisan.code_postal, artisan.ville].filter(Boolean).join(' ')}</Text>}
            {artisan?.tel    && <Text style={s.partyLine}>Tél. : {artisan.tel}</Text>}
            {artisan?.email  && <Text style={s.partyLine}>{artisan.email}</Text>}
            {artisan?.site_web && <Text style={s.partyLine}>{artisan.site_web}</Text>}
          </View>
          {/* Client */}
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Maître d'ouvrage (Client)</Text>
            <Text style={s.partyName}>{chantier.nom_client}</Text>
            <Text style={s.partyLine}>{chantier.adresse}</Text>
            <Text style={s.partyLine}>Tél. : {chantier.tel_client}</Text>
            {chantier.email_client && <Text style={s.partyLine}>{chantier.email_client}</Text>}
          </View>
        </View>

        {/* ── DESCRIPTION TRAVAUX ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Description des travaux réalisés</Text>
          <View style={s.travauxBox}>
            <Text style={s.travauxName}>{chantier.type_travaux}</Text>
            {chantier.description
              ? <Text style={s.travauxDesc}>{chantier.description}</Text>
              : <Text style={s.travauxDesc}>Travaux réalisés conformément au devis accepté par le client.</Text>
            }
          </View>
          {artisan?.description_activite && (
            <Text style={{ fontSize: 8, color: '#9CA3AF', marginTop: 4 }}>{artisan.description_activite}</Text>
          )}
        </View>

        {/* ── FINANCIER ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Décompte financier</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={s.tableHeaderT}>Désignation</Text>
              <Text style={{ ...s.tableHeaderT, textAlign: 'right' }}>Montant</Text>
            </View>
            <View style={s.tableRow}>
              <Text style={s.tableLabel}>Montant hors taxes (HT)</Text>
              <Text style={s.tableValue}>{ht} €</Text>
            </View>
            <View style={s.tableRow}>
              <Text style={s.tableLabel}>TVA 20%</Text>
              <Text style={s.tableValue}>{tax} €</Text>
            </View>
            <View style={s.tableRowBold}>
              <Text style={{ ...s.tableLabel, fontFamily: 'Helvetica-Bold', color: P }}>TOTAL TTC</Text>
              <Text style={s.tableValueBold}>{ttc} €</Text>
            </View>
          </View>
          <Text style={{ fontSize: 8, color: '#9CA3AF', marginTop: 4 }}>{mentionTva}</Text>
        </View>

        {/* ── DÉCLARATION ── */}
        <View style={{ ...s.legalBox, marginBottom: 14 }}>
          <Text style={s.legalTitle}>Déclaration de réception des travaux</Text>
          <Text style={s.legalText}>
            Le maître d'ouvrage déclare avoir pris possession des travaux décrits ci-dessus, exécutés par le prestataire.
            La réception des travaux est prononcée ce jour sans réserve, conformément aux dispositions de l'article 1792-6 du Code civil.
            Les parties reconnaissent que les travaux ont été réalisés conformément aux règles de l'art et aux stipulations convenues.
          </Text>
        </View>

        {/* ── SIGNATURES ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Signatures des parties — Bon pour accord</Text>
          <View style={s.sigsRow}>
            {/* Artisan */}
            <View style={s.sigBox}>
              <Text style={s.sigTitle}>Prestataire</Text>
              <Text style={s.sigApprouv}>Lu et approuvé — Bon pour accord</Text>
              {chantier.sig_artisan_url
                ? <Image src={chantier.sig_artisan_url} style={s.sigImg} />
                : <View style={{ height: 60, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 4 }} />
              }
              <Text style={s.sigName}>{artisan?.nom ?? nomEntreprise}</Text>
              {artisan?.siret && <Text style={{ fontSize: 7.5, color: '#9CA3AF' }}>SIRET {artisan.siret}</Text>}
              <Text style={s.sigDate}>À {ville}, le {date}</Text>
            </View>
            {/* Client */}
            <View style={s.sigBox}>
              <Text style={s.sigTitle}>Maître d'ouvrage</Text>
              <Text style={s.sigApprouv}>Lu et approuvé — Bon pour accord</Text>
              {chantier.sig_client_url
                ? <Image src={chantier.sig_client_url} style={s.sigImg} />
                : <View style={{ height: 60, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 4 }} />
              }
              <Text style={s.sigName}>{chantier.nom_client}</Text>
              <Text style={{ fontSize: 7.5, color: '#9CA3AF' }}>{chantier.tel_client}</Text>
              <Text style={s.sigDate}>À {ville}, le {date}</Text>
            </View>
          </View>
        </View>

        {/* ── MENTIONS LÉGALES ── */}
        <View style={s.legalBox}>
          <Text style={s.legalTitle}>Mentions légales & garanties</Text>
          <Text style={s.legalText}>
            • Garantie de parfait achèvement (1 an) — article 1792-6 du Code civil.{'\n'}
            • Garantie biennale sur les équipements dissociables (2 ans) — article 1792-3 du Code civil.{'\n'}
            • Garantie décennale sur les travaux de construction (10 ans) — article 1792 du Code civil.{'\n'}
            • En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire.{'\n'}
            • Document généré électroniquement via ProFini. Valeur juridique équivalente à un document papier signé (Règl. eIDAS).
          </Text>
        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{nomEntreprise} — Réf. {ref}</Text>
          <Text style={s.footerText}>Généré le {date} · ProFini</Text>
          <Text style={s.footerGreen}>profini.vercel.app</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generatePV({ chantier, artisan }: PVParams): Promise<Buffer> {
  const now   = chantier.closed_at ?? chantier.created_at ?? new Date().toISOString()
  const date  = new Date(now).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const ref   = `PV-${chantier.id.slice(0, 8).toUpperCase()}`
  const ht    = montantHT(chantier.montant_ttc).toFixed(2)
  const tax   = tva(chantier.montant_ttc).toFixed(2)
  const ttc   = chantier.montant_ttc.toFixed(2)

  const buf = await renderToBuffer(
    <PVDocument chantier={chantier} artisan={artisan} date={date} ref={ref} ht={ht} tax={tax} ttc={ttc} />
  )
  return Buffer.from(buf)
}
