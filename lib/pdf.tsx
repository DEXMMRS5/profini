import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, renderToBuffer } from '@react-pdf/renderer'
import { Chantier, Artisan, montantHT, tva } from './types'

const P = '#15355B'; const G = '#2BA464'

const s = StyleSheet.create({
  page:      { fontFamily: 'Helvetica', fontSize: 9.5, color: '#111827', padding: '36 44', backgroundColor: '#fff', lineHeight: 1.5 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 2, borderBottomColor: P, paddingBottom: 14, marginBottom: 18 },
  logoImg:   { width: 80, height: 36, objectFit: 'contain' },
  logoText:  { fontSize: 18, fontFamily: 'Helvetica-Bold', color: P },
  logoSub:   { fontSize: 7.5, color: '#6B7280', marginTop: 2 },
  pvTitle:   { fontSize: 13, fontFamily: 'Helvetica-Bold', color: P, textAlign: 'right' },
  pvMeta:    { fontSize: 7.5, color: '#6B7280', marginTop: 3, textAlign: 'right' },
  parties:   { flexDirection: 'row', gap: 14, marginBottom: 16 },
  partyBox:  { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 11 },
  partyLbl:  { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  partyName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 2 },
  partyLine: { fontSize: 8.5, color: '#4B5563', marginTop: 1.5 },
  secTitle:  { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  sec:       { marginBottom: 14 },
  card:      { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 5, padding: 10 },
  cardName:  { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 3 },
  cardDesc:  { fontSize: 8.5, color: '#4B5563', lineHeight: 1.55 },
  tableHdr:  { flexDirection: 'row', backgroundColor: P, padding: '7 12', borderRadius: 0 },
  tableHdrT: { flex: 1, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#fff', textTransform: 'uppercase' },
  tableRow:  { flexDirection: 'row', padding: '7 12', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  tableRowB: { flexDirection: 'row', padding: '8 12', borderTopWidth: 2, borderTopColor: P, backgroundColor: `${P}0A` },
  tLabel:    { flex: 1, fontSize: 9, color: '#374151' },
  tVal:      { fontSize: 9, color: '#111827', fontFamily: 'Helvetica-Bold' },
  tValB:     { fontSize: 11, color: P, fontFamily: 'Helvetica-Bold' },
  artBox:    { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 5, padding: '8 12', marginBottom: 12 },
  artTitle:  { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#92400E', marginBottom: 4 },
  artText:   { fontSize: 7.5, color: '#78350F', lineHeight: 1.55 },
  sigsRow:   { flexDirection: 'row', gap: 14 },
  sigBox:    { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 5, padding: 10 },
  sigTitle:  { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  sigAppr:   { fontSize: 7, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 6 },
  sigImg:    { width: '100%', height: 56, objectFit: 'contain', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 4 },
  sigName:   { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#111827' },
  sigDate:   { fontSize: 7.5, color: '#9CA3AF', marginTop: 1.5 },
  legalBox:  { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 5, padding: '8 12', marginBottom: 10 },
  legalTitle:{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#374151', marginBottom: 5 },
  legalArt:  { marginBottom: 6 },
  legalArtT: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#15355B', marginBottom: 2 },
  legalText: { fontSize: 7.5, color: '#6B7280', lineHeight: 1.55 },
  footer:    { position: 'absolute', bottom: 20, left: 44, right: 44, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
  footerT:   { fontSize: 7, color: '#9CA3AF' },
  footerG:   { fontSize: 7, color: G, fontFamily: 'Helvetica-Bold' },
})

interface ArtisanFull extends Artisan {
  nom_entreprise?: string; siret?: string; adresse?: string; code_postal?: string; ville?: string
  site_web?: string; description_activite?: string; mention_tva?: string; logo_url?: string
}

interface PVParams { chantier: Chantier; artisan: ArtisanFull | null }

function PVDocument({ chantier, artisan, date, ref, ht, tax, ttc }: {
  chantier: Chantier; artisan: ArtisanFull | null
  date: string; ref: string; ht: string; tax: string; ttc: string
}) {
  const ville      = artisan?.ville ?? 'Lyon'
  const nomEntreprise = artisan?.nom_entreprise ?? artisan?.nom ?? 'Artisan'
  const mentionTva = artisan?.mention_tva ?? 'Non soumis à TVA — Article 293B du CGI'
  const desc       = chantier.description ?? 'Travaux réalisés conformément au devis accepté par les parties.'

  return (
    <Document title={`PV de réception — ${chantier.nom_client}`} author={nomEntreprise} subject="Procès-verbal de réception de travaux">
      <Page size="A4" style={s.page}>

        {/* HEADER */}
        <View style={s.header}>
          <View>
            {artisan?.logo_url
              ? <Image src={artisan.logo_url} style={s.logoImg} />
              : <View><Text style={s.logoText}>ProFini</Text><Text style={s.logoSub}>Gestion de chantiers</Text></View>
            }
            {artisan?.nom_entreprise && <Text style={{ ...s.logoSub, marginTop: 5, fontFamily: 'Helvetica-Bold', color: P }}>{artisan.nom_entreprise}</Text>}
            {artisan?.siret && <Text style={{ ...s.logoSub, marginTop: 2 }}>SIRET {artisan.siret}</Text>}
          </View>
          <View>
            <Text style={s.pvTitle}>PROCÈS-VERBAL DE RÉCEPTION</Text>
            <Text style={{ ...s.pvTitle, fontSize: 8, fontFamily: 'Helvetica', marginTop: 2 }}>de travaux — Réf. {ref}</Text>
            <Text style={s.pvMeta}>Établi à {ville}, le {date}</Text>
            {chantier.numero_devis && <Text style={s.pvMeta}>Suite au devis N° {chantier.numero_devis}</Text>}
          </View>
        </View>

        {/* PARTIES */}
        <View style={s.parties}>
          <View style={s.partyBox}>
            <Text style={s.partyLbl}>Prestataire (Artisan / Entreprise)</Text>
            <Text style={s.partyName}>{nomEntreprise}</Text>
            {artisan?.nom && artisan.nom !== artisan?.nom_entreprise && <Text style={s.partyLine}>{artisan.nom}</Text>}
            {artisan?.siret  && <Text style={s.partyLine}>SIRET : {artisan.siret}</Text>}
            {artisan?.adresse && <Text style={s.partyLine}>{artisan.adresse}</Text>}
            {(artisan?.code_postal || artisan?.ville) && <Text style={s.partyLine}>{[artisan.code_postal, artisan.ville].filter(Boolean).join(' ')}</Text>}
            {artisan?.tel && <Text style={s.partyLine}>Tél. : {artisan.tel}</Text>}
            {artisan?.email && <Text style={s.partyLine}>{artisan.email}</Text>}
          </View>
          <View style={s.partyBox}>
            <Text style={s.partyLbl}>Maître d'ouvrage (Client)</Text>
            <Text style={s.partyName}>{chantier.nom_client}</Text>
            <Text style={s.partyLine}>{chantier.adresse}</Text>
            <Text style={s.partyLine}>Tél. : {chantier.tel_client}</Text>
            {chantier.email_client && <Text style={s.partyLine}>{chantier.email_client}</Text>}
          </View>
        </View>

        {/* OBJET */}
        <View style={s.sec}>
          <Text style={s.secTitle}>Objet des travaux réalisés</Text>
          <View style={s.card}>
            <Text style={s.cardName}>{chantier.type_travaux}</Text>
            <Text style={s.cardDesc}>{desc}</Text>
          </View>
        </View>

        {/* FINANCIER */}
        <View style={s.sec}>
          <Text style={s.secTitle}>Décompte financier final</Text>
          <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' }}>
            <View style={s.tableHdr}>
              <Text style={s.tableHdrT}>Désignation</Text>
              <Text style={{ ...s.tableHdrT, textAlign: 'right' }}>Montant</Text>
            </View>
            <View style={s.tableRow}><Text style={s.tLabel}>Montant hors taxes (HT)</Text><Text style={s.tVal}>{ht} €</Text></View>
            <View style={s.tableRow}><Text style={s.tLabel}>TVA applicable (20 %)</Text><Text style={s.tVal}>{tax} €</Text></View>
            <View style={s.tableRowB}><Text style={{ ...s.tLabel, fontFamily: 'Helvetica-Bold', color: P }}>TOTAL TOUTES TAXES COMPRISES (TTC)</Text><Text style={s.tValB}>{ttc} €</Text></View>
          </View>
          <Text style={{ fontSize: 7.5, color: '#9CA3AF', marginTop: 4 }}>{mentionTva}</Text>
        </View>

        {/* DÉCLARATION */}
        <View style={s.artBox}>
          <Text style={s.artTitle}>Déclaration de réception des travaux</Text>
          <Text style={s.artText}>
            Le maître d'ouvrage déclare avoir pris possession des travaux décrits ci-dessus, réalisés par le prestataire
            à l'adresse indiquée. La réception des travaux est prononcée ce {date} sans réserve, valant acceptation
            de l'ensemble des prestations effectuées, conformément aux dispositions de l'article 1792-6 du Code civil.
            {'\n'}Les deux parties reconnaissent que les travaux ont été exécutés conformément aux règles de l'art,
            aux prescriptions techniques applicables et aux stipulations convenues entre elles.
          </Text>
        </View>

        {/* SIGNATURES */}
        <View style={s.sec}>
          <Text style={s.secTitle}>Signatures des parties — « Lu et approuvé — Bon pour accord »</Text>
          <View style={s.sigsRow}>
            <View style={s.sigBox}>
              <Text style={s.sigTitle}>Prestataire</Text>
              <Text style={s.sigAppr}>Lu et approuvé — Bon pour accord</Text>
              {chantier.sig_artisan_url
                ? <Image src={chantier.sig_artisan_url} style={s.sigImg} />
                : <View style={{ height: 56, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 4 }} />
              }
              <Text style={s.sigName}>{artisan?.nom ?? nomEntreprise}</Text>
              {artisan?.siret && <Text style={{ fontSize: 7, color: '#9CA3AF' }}>SIRET {artisan.siret}</Text>}
              <Text style={s.sigDate}>Fait à {ville}, le {date}</Text>
            </View>
            <View style={s.sigBox}>
              <Text style={s.sigTitle}>Maître d'ouvrage</Text>
              <Text style={s.sigAppr}>Lu et approuvé — Bon pour accord</Text>
              {chantier.sig_client_url
                ? <Image src={chantier.sig_client_url} style={s.sigImg} />
                : <View style={{ height: 56, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 4 }} />
              }
              <Text style={s.sigName}>{chantier.nom_client}</Text>
              <Text style={{ fontSize: 7, color: '#9CA3AF' }}>{chantier.tel_client}</Text>
              <Text style={s.sigDate}>Fait à {ville}, le {date}</Text>
            </View>
          </View>
        </View>

        {/* MENTIONS LÉGALES — ARTICLES RÉDIGÉS */}
        <View style={s.legalBox}>
          <Text style={s.legalTitle}>Garanties légales applicables aux travaux (Code civil)</Text>
          <View style={s.legalArt}>
            <Text style={s.legalArtT}>Art. 1792-6 — Garantie de parfait achèvement (1 an)</Text>
            <Text style={s.legalText}>Le prestataire est tenu, pendant un délai d'un an à compter de la réception des travaux, de remédier à tous les désordres signalés par le maître de l'ouvrage, y compris ceux qui résultent d'un vice apparent lors de la réception, à l'exception de ceux provenant de l'usure normale ou d'un usage anormal de l'ouvrage.</Text>
          </View>
          <View style={s.legalArt}>
            <Text style={s.legalArtT}>Art. 1792-3 — Garantie biennale sur les équipements dissociables (2 ans)</Text>
            <Text style={s.legalText}>Les éléments d'équipement de l'ouvrage qui peuvent être dissociés sans détérioration ou enlèvement de matière, tels que les équipements sanitaires, les revêtements non porteurs et autres éléments similaires, bénéficient d'une garantie minimale de bon fonctionnement d'une durée de deux ans à compter de la réception des travaux.</Text>
          </View>
          <View style={{ ...s.legalArt, marginBottom: 0 }}>
            <Text style={s.legalArtT}>Art. 1792 — Garantie décennale sur les ouvrages de construction (10 ans)</Text>
            <Text style={s.legalText}>Tout constructeur d'un ouvrage est responsable de plein droit, envers le maître ou l'acquéreur de l'ouvrage, des dommages, même résultant d'un vice du sol, qui compromettent la solidité de l'ouvrage ou qui, l'affectant dans l'un de ses éléments constitutifs ou l'un de ses éléments d'équipement, le rendent impropre à sa destination. Cette garantie est valable pendant dix ans à compter de la réception.</Text>
          </View>
        </View>

        <View style={s.legalBox}>
          <Text style={s.legalTitle}>Dispositions finales</Text>
          <Text style={s.legalText}>
            En cas de litige relatif à l'exécution ou à l'interprétation du présent procès-verbal, les parties s'engagent à
            rechercher en priorité une solution amiable avant tout recours contentieux. Le présent document, signé
            électroniquement par les deux parties via l'application ProFini, a une valeur juridique équivalente à un
            document écrit sur support papier, conformément au règlement eIDAS (UE) n° 910/2014 et aux articles
            1366 et 1367 du Code civil relatifs à l'écrit et à la signature électroniques.
          </Text>
        </View>

        {/* FOOTER */}
        <View style={s.footer} fixed>
          <Text style={s.footerT}>{nomEntreprise} · Réf. {ref} · {date}</Text>
          <Text style={s.footerT}>Document généré via ProFini</Text>
          <Text style={s.footerG}>profini.vercel.app</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generatePV({ chantier, artisan }: PVParams): Promise<Buffer> {
  const now  = chantier.closed_at ?? chantier.created_at ?? new Date().toISOString()
  const date = new Date(now).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const ref  = `PV-${chantier.id.slice(0, 8).toUpperCase()}`
  const ht   = montantHT(chantier.montant_ttc).toFixed(2)
  const tax  = tva(chantier.montant_ttc).toFixed(2)
  const ttc  = chantier.montant_ttc.toFixed(2)
  const buf  = await renderToBuffer(<PVDocument chantier={chantier} artisan={artisan} date={date} ref={ref} ht={ht} tax={tax} ttc={ttc} />)
  return Buffer.from(buf)
}
