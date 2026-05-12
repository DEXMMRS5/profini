import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Image, renderToBuffer, Font,
} from '@react-pdf/renderer'
import { Chantier, Artisan, montantHT, tva } from './types'

const PRIMARY = '#15355B'
const SUBTLE  = '#6B7280'
const BORDER  = '#E5E7EB'
const BG      = '#F9FAFB'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 11, color: '#111827', padding: 48, backgroundColor: '#fff' },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 2, borderBottomColor: PRIMARY, paddingBottom: 20, marginBottom: 28 },
  logoText:    { fontSize: 22, fontFamily: 'Helvetica-Bold', color: PRIMARY },
  logoSub:     { fontSize: 9, color: SUBTLE, marginTop: 3 },
  headerRight: { alignItems: 'flex-end' },
  pvTitle:     { fontSize: 16, fontFamily: 'Helvetica-Bold', color: PRIMARY },
  pvSub:       { fontSize: 9, color: SUBTLE, marginTop: 3 },

  // Section
  section:      { marginBottom: 20 },
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: SUBTLE, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },

  // Card
  card:    { backgroundColor: BG, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: BORDER },
  cardRowLast: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },

  label:     { fontSize: 11, color: SUBTLE },
  value:     { fontSize: 11, color: '#111827' },
  valueBold: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#111827' },

  name:    { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 3 },
  detail:  { fontSize: 10, color: SUBTLE, marginTop: 2 },

  // Signatures
  sigsRow: { flexDirection: 'row', gap: 16 },
  sigBox:  { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 12, minHeight: 110 },
  sigImg:  { width: '100%', height: 70, objectFit: 'contain' },
  sigLine: { borderTopWidth: 1, borderTopColor: BORDER, marginTop: 8, paddingTop: 6 },
  sigLabel:{ fontSize: 9, color: SUBTLE },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER },
  footerText: { fontSize: 9, color: '#9CA3AF' },

  // Status badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start', marginTop: 4 },
  badgeText: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
})

function PVDocument({ chantier, artisan, date, ht, tax, ttc }: {
  chantier: Chantier; artisan: Artisan | null
  date: string; ht: string; tax: string; ttc: string
}) {
  return (
    <Document title="Procès-verbal de réception" author="ProFini">
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>ProFini</Text>
            <Text style={styles.logoSub}>Gestion de chantiers pour artisans</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.pvTitle}>Procès-verbal de réception</Text>
            <Text style={styles.pvSub}>{date}</Text>
            {chantier.numero_devis ? <Text style={styles.pvSub}>Devis N° {chantier.numero_devis}</Text> : null}
          </View>
        </View>

        {/* Artisan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artisan</Text>
          <View style={styles.card}>
            <Text style={styles.name}>{artisan?.nom ?? 'Artisan'}</Text>
            {artisan?.email ? <Text style={styles.detail}>{artisan.email}</Text> : null}
            {artisan?.tel   ? <Text style={styles.detail}>{artisan.tel}</Text>   : null}
          </View>
        </View>

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <View style={styles.card}>
            <Text style={styles.name}>{chantier.nom_client}</Text>
            <Text style={styles.detail}>{chantier.adresse}</Text>
            <Text style={styles.detail}>{chantier.tel_client}</Text>
            {chantier.email_client ? <Text style={styles.detail}>{chantier.email_client}</Text> : null}
          </View>
        </View>

        {/* Travaux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travaux réalisés</Text>
          <View style={styles.card}>
            <Text style={styles.name}>{chantier.type_travaux}</Text>
            {chantier.description ? <Text style={{ ...styles.detail, marginTop: 6, lineHeight: 1.5 }}>{chantier.description}</Text> : null}
          </View>
        </View>

        {/* Financier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Règlement</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Montant HT</Text>
              <Text style={styles.value}>{ht} €</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.label}>TVA 20%</Text>
              <Text style={styles.value}>{tax} €</Text>
            </View>
            <View style={styles.cardRowLast}>
              <Text style={styles.valueBold}>Montant TTC</Text>
              <Text style={styles.valueBold}>{ttc} €</Text>
            </View>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          <View style={styles.sigsRow}>
            {/* Artisan signature */}
            <View style={styles.sigBox}>
              {chantier.sig_artisan_url
                ? <Image src={chantier.sig_artisan_url} style={styles.sigImg} />
                : <View style={{ flex: 1 }} />
              }
              <View style={styles.sigLine}>
                <Text style={styles.sigLabel}>Signature de l&apos;artisan</Text>
                <Text style={{ ...styles.sigLabel, fontFamily: 'Helvetica-Bold', marginTop: 2 }}>{artisan?.nom ?? ''}</Text>
              </View>
            </View>
            {/* Client signature */}
            <View style={styles.sigBox}>
              {chantier.sig_client_url
                ? <Image src={chantier.sig_client_url} style={styles.sigImg} />
                : <View style={{ flex: 1 }} />
              }
              <View style={styles.sigLine}>
                <Text style={styles.sigLabel}>Signature du client</Text>
                <Text style={{ ...styles.sigLabel, fontFamily: 'Helvetica-Bold', marginTop: 2 }}>{chantier.nom_client}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ProFini — Procès-verbal généré automatiquement</Text>
          <Text style={styles.footerText}>{date}</Text>
        </View>

      </Page>
    </Document>
  )
}

interface PVParams { chantier: Chantier; artisan: Artisan | null }

export async function generatePV({ chantier, artisan }: PVParams): Promise<Buffer> {
  const date = new Date(chantier.closed_at ?? chantier.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const ht  = montantHT(chantier.montant_ttc).toFixed(2)
  const tax = tva(chantier.montant_ttc).toFixed(2)
  const ttc = chantier.montant_ttc.toFixed(2)

  const buffer = await renderToBuffer(
    <PVDocument chantier={chantier} artisan={artisan} date={date} ht={ht} tax={tax} ttc={ttc} />
  )
  return Buffer.from(buffer)
}
