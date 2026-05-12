import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generatePV } from '@/lib/pdf'
import { Resend } from 'resend'

export const runtime = 'nodejs'

async function urlToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const ct  = res.headers.get('content-type') ?? 'image/png'
    return `data:${ct};base64,${Buffer.from(buf).toString('base64')}`
  } catch { return null }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log('[POST /api/chantiers/:id/cloture] start', id)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { paiement_recu, demande_avis } = await req.json()

  const { data: chantier, error: fetchErr } = await supabase
    .from('chantiers').select('*, photos(*)').eq('id', id).eq('artisan_id', user.id).single()
  if (fetchErr || !chantier) return NextResponse.json({ error: 'Chantier introuvable' }, { status: 404 })

  const { data: artisan } = await supabase.from('artisans').select('*').eq('id', user.id).single()
  const serviceClient = await createServiceClient()

  // ── Signatures : signed URL → base64 pour le renderer PDF ──────────────────
  async function getSignedBase64(publicUrl: string | null | undefined): Promise<string | null> {
    if (!publicUrl) return null
    // Extraire le path depuis l'URL publique
    const match = publicUrl.match(/\/signatures\/(.+?)(\?|$)/)
    const path  = match?.[1]
    if (!path) return await urlToBase64(publicUrl)
    const { data } = await serviceClient.storage.from('signatures').createSignedUrl(decodeURIComponent(path), 600)
    if (!data?.signedUrl) return null
    return await urlToBase64(data.signedUrl)
  }

  const [sigArtisanB64, sigClientB64] = await Promise.all([
    getSignedBase64(chantier.sig_artisan_url),
    getSignedBase64(chantier.sig_client_url),
  ])

  // ── Logo artisan (public) → base64 ─────────────────────────────────────────
  const logoB64 = artisan?.logo_url ? await urlToBase64(artisan.logo_url) : null

  console.log('[cloture] sig artisan:', sigArtisanB64 ? 'ok' : 'absent')
  console.log('[cloture] sig client :', sigClientB64  ? 'ok' : 'absent')
  console.log('[cloture] logo       :', logoB64        ? 'ok' : 'absent')

  // ── Génération PDF ──────────────────────────────────────────────────────────
  const closedAt = new Date().toISOString()
  const pdfBuffer = await generatePV({
    chantier: {
      ...chantier,
      sig_artisan_url: sigArtisanB64 ?? undefined,
      sig_client_url:  sigClientB64  ?? undefined,
      closed_at: closedAt,
    },
    artisan: artisan ? { ...artisan, logo_url: logoB64 ?? artisan.logo_url } : null,
  })

  // ── Upload PDF ──────────────────────────────────────────────────────────────
  const pdfPath = `${user.id}/${id}/pv-${Date.now()}.pdf`
  const { error: pdfErr } = await serviceClient.storage
    .from('pdfs').upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

  let pdfUrl: string | undefined
  if (!pdfErr) {
    const { data } = await serviceClient.storage.from('pdfs').createSignedUrl(pdfPath, 60 * 60 * 24 * 365)
    pdfUrl = data?.signedUrl
  } else {
    console.error('[cloture] PDF upload error', pdfErr)
  }

  // ── Mise à jour chantier ────────────────────────────────────────────────────
  await supabase.from('chantiers').update({
    status:       paiement_recu ? 'paye' : 'cloture',
    paiement_recu, demande_avis,
    pdf_url:      pdfUrl,
    closed_at:    closedAt,
  }).eq('id', id)

  // ── Email ───────────────────────────────────────────────────────────────────
  if (chantier.email_client && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key') {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: `${artisan?.nom_entreprise ?? 'ProFini'} <noreply@profini.fr>`,
        to: [chantier.email_client],
        subject: `Procès-verbal de réception — ${chantier.type_travaux}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
            ${artisan?.logo_url ? `<img src="${artisan.logo_url}" style="height:48px;margin-bottom:24px;object-fit:contain;" alt="logo"/>` : ''}
            <h1 style="color:#15355B;font-size:22px;margin:0 0 16px;">Procès-verbal de réception de travaux</h1>
            <p>Bonjour ${chantier.nom_client},</p>
            <p>Votre artisan <strong>${artisan?.nom ?? ''}</strong> ${artisan?.nom_entreprise ? `(${artisan.nom_entreprise})` : ''} vous transmet le procès-verbal signé.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr style="background:#F9FAFB;"><td style="padding:10px;border:1px solid #E5E7EB;font-weight:600;">Travaux</td><td style="padding:10px;border:1px solid #E5E7EB;">${chantier.type_travaux}</td></tr>
              <tr><td style="padding:10px;border:1px solid #E5E7EB;font-weight:600;">Adresse</td><td style="padding:10px;border:1px solid #E5E7EB;">${chantier.adresse}</td></tr>
              <tr style="background:#F9FAFB;"><td style="padding:10px;border:1px solid #E5E7EB;font-weight:600;">Montant TTC</td><td style="padding:10px;border:1px solid #E5E7EB;font-weight:700;">${chantier.montant_ttc.toFixed(2)} €</td></tr>
            </table>
            ${pdfUrl ? `<a href="${pdfUrl}" style="display:inline-block;background:#15355B;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Télécharger le procès-verbal PDF</a>` : ''}
            <p style="margin-top:32px;color:#9CA3AF;font-size:12px;">Document généré par ProFini — profini.vercel.app</p>
          </div>
        `,
      })
    } catch (e) { console.error('[cloture] email error', e) }
  }

  console.log('[POST /api/chantiers/:id/cloture] end — pdf:', pdfUrl ? 'ok' : 'failed')
  return NextResponse.json({ ok: true, pdf_url: pdfUrl })
}
