import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generatePV } from '@/lib/pdf'
import { Resend } from 'resend'

export const runtime = 'nodejs'

async function pathToBase64(serviceClient: ReturnType<typeof createServiceClient> extends Promise<infer T> ? T : never, path: string): Promise<string | null> {
  try {
    const { data, error } = await serviceClient.storage.from('signatures').download(path)
    if (error || !data) { console.error('[sig] download error', error); return null }
    const arr = await data.arrayBuffer()
    return `data:image/png;base64,${Buffer.from(arr).toString('base64')}`
  } catch (e) { console.error('[sig] pathToBase64 error', e); return null }
}

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
  const sc = await createServiceClient()

  // ── Signatures → base64 (priorité: path stocké, fallback: URL signée) ───────
  async function getSigBase64(path: string | null | undefined, url: string | null | undefined): Promise<string | null> {
    if (path) {
      const b64 = await pathToBase64(sc, path)
      if (b64) return b64
    }
    if (url) return urlToBase64(url)
    return null
  }

  const [sigArtisanB64, sigClientB64] = await Promise.all([
    getSigBase64(chantier.sig_artisan_path, chantier.sig_artisan_url),
    getSigBase64(chantier.sig_client_path,  chantier.sig_client_url),
  ])

  console.log('[cloture] sig artisan:', sigArtisanB64 ? `OK (${sigArtisanB64.length} chars)` : 'ABSENT')
  console.log('[cloture] sig client :', sigClientB64  ? `OK (${sigClientB64.length} chars)` : 'ABSENT')

  // ── Logo artisan → base64 ────────────────────────────────────────────────────
  const logoB64 = artisan?.logo_url ? await urlToBase64(artisan.logo_url) : null

  // ── Génération PDF ────────────────────────────────────────────────────────────
  const closedAt = new Date().toISOString()
  const pdfBuffer = await generatePV({
    chantier: { ...chantier, sig_artisan_url: sigArtisanB64 ?? undefined, sig_client_url: sigClientB64 ?? undefined, closed_at: closedAt },
    artisan:  artisan ? { ...artisan, logo_url: logoB64 ?? undefined } : null,
  })

  // ── Upload PDF ────────────────────────────────────────────────────────────────
  const pdfPath = `${user.id}/${id}/pv-${Date.now()}.pdf`
  await sc.storage.from('pdfs').upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })
  const { data: signedPdf } = await sc.storage.from('pdfs').createSignedUrl(pdfPath, 60 * 60 * 24 * 365)
  const pdfUrl = signedPdf?.signedUrl

  // ── Mise à jour chantier ──────────────────────────────────────────────────────
  await supabase.from('chantiers').update({
    status:       paiement_recu ? 'paye' : 'cloture',
    paiement_recu, demande_avis,
    pdf_url:      pdfUrl,
    closed_at:    closedAt,
  }).eq('id', id)

  // ── Email client (PV + demande avis Google) ───────────────────────────────────
  const hasResend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key'
  if (chantier.email_client && hasResend) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const nomArtisan = artisan?.nom_entreprise ?? artisan?.nom ?? 'Votre artisan'
      const googleBtn = demande_avis && artisan?.google_review_url
        ? `<div style="margin-top:24px;padding-top:20px;border-top:1px solid #E5E7EB;">
             <p style="font-size:14px;color:#374151;margin:0 0 12px;">Êtes-vous satisfait des travaux ? Votre avis compte beaucoup !</p>
             <a href="${artisan.google_review_url}" style="display:inline-block;background:#4285F4;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">⭐ Laisser un avis Google</a>
           </div>`
        : ''
      await resend.emails.send({
        from: `${nomArtisan} <noreply@profini.fr>`,
        to: [chantier.email_client],
        subject: `✅ Procès-verbal de réception — ${chantier.type_travaux}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;">
            ${artisan?.logo_url ? `<img src="${artisan.logo_url}" style="height:48px;margin-bottom:24px;object-fit:contain;" alt="logo"/>` : ''}
            <h1 style="color:#15355B;font-size:22px;margin:0 0 8px;">Travaux terminés ✅</h1>
            <p style="color:#374151;margin:0 0 20px;font-size:15px;">Bonjour ${chantier.nom_client},</p>
            <p style="color:#374151;font-size:14px;line-height:1.6;">
              <strong>${nomArtisan}</strong> vous transmet le procès-verbal signé pour les travaux réalisés.
            </p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
              <tr style="background:#F9FAFB;"><td style="padding:10px;border:1px solid #E5E7EB;font-weight:600;color:#374151;">Travaux</td><td style="padding:10px;border:1px solid #E5E7EB;color:#111827;">${chantier.type_travaux}</td></tr>
              <tr><td style="padding:10px;border:1px solid #E5E7EB;font-weight:600;color:#374151;">Adresse</td><td style="padding:10px;border:1px solid #E5E7EB;color:#111827;">${chantier.adresse}</td></tr>
              <tr style="background:#F9FAFB;"><td style="padding:10px;border:1px solid #E5E7EB;font-weight:600;color:#374151;">Montant TTC</td><td style="padding:10px;border:1px solid #E5E7EB;color:#15355B;font-weight:700;">${chantier.montant_ttc.toFixed(2)} €</td></tr>
            </table>
            ${pdfUrl ? `<a href="${pdfUrl}" style="display:inline-block;background:#15355B;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">📄 Télécharger le procès-verbal</a>` : ''}
            ${googleBtn}
            <p style="margin-top:32px;color:#9CA3AF;font-size:11px;border-top:1px solid #F3F4F6;padding-top:16px;">Document généré via ProFini — profini.vercel.app</p>
          </div>
        `,
      })
      console.log('[cloture] email envoyé à', chantier.email_client)
    } catch (e) { console.error('[cloture] email error', e) }
  }

  console.log('[POST /api/chantiers/:id/cloture] end — pdf:', pdfUrl ? 'ok' : 'failed')
  return NextResponse.json({ ok: true, pdf_url: pdfUrl })
}
