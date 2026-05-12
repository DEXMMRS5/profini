import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generatePV } from '@/lib/pdf'
import { Resend } from 'resend'

export const runtime = 'nodejs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log('[POST /api/chantiers/:id/cloture] start', id)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { paiement_recu, demande_avis } = await req.json()

  // Load chantier + photos
  const { data: chantier, error: fetchErr } = await supabase
    .from('chantiers').select('*, photos(*)').eq('id', id).eq('artisan_id', user.id).single()
  if (fetchErr || !chantier) return NextResponse.json({ error: 'Chantier introuvable' }, { status: 404 })

  // Load artisan
  const { data: artisan } = await supabase.from('artisans').select('*').eq('id', user.id).single()

  // Generate signed URLs for signatures (private storage)
  const serviceClient = await createServiceClient()

  let sigArtisanUrl = chantier.sig_artisan_url
  let sigClientUrl  = chantier.sig_client_url

  if (chantier.sig_artisan_url) {
    try {
      const path = chantier.sig_artisan_url.split('/signatures/')[1]
      if (path) {
        const { data } = await serviceClient.storage.from('signatures').createSignedUrl(path, 3600)
        if (data?.signedUrl) sigArtisanUrl = data.signedUrl
      }
    } catch (e) { console.error('[cloture] sig artisan signed url error', e) }
  }

  if (chantier.sig_client_url) {
    try {
      const path = chantier.sig_client_url.split('/signatures/')[1]
      if (path) {
        const { data } = await serviceClient.storage.from('signatures').createSignedUrl(path, 3600)
        if (data?.signedUrl) sigClientUrl = data.signedUrl
      }
    } catch (e) { console.error('[cloture] sig client signed url error', e) }
  }

  // Generate PDF with signed URLs
  const closedAt = new Date().toISOString()
  const pdfBuffer = await generatePV({
    chantier: { ...chantier, sig_artisan_url: sigArtisanUrl, sig_client_url: sigClientUrl, closed_at: closedAt },
    artisan,
  })

  // Upload PDF
  const pdfPath = `${user.id}/${id}/pv-${Date.now()}.pdf`
  const { error: pdfErr } = await serviceClient.storage
    .from('pdfs').upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

  let pdfUrl: string | undefined
  if (!pdfErr) {
    const { data: signedPdf } = await serviceClient.storage.from('pdfs').createSignedUrl(pdfPath, 60 * 60 * 24 * 365)
    pdfUrl = signedPdf?.signedUrl
  } else {
    console.error('[cloture] PDF upload error', pdfErr)
  }

  // Update chantier
  await supabase.from('chantiers').update({
    status: paiement_recu ? 'paye' : 'cloture',
    paiement_recu, demande_avis,
    pdf_url: pdfUrl,
    closed_at: closedAt,
  }).eq('id', id)

  // Send email
  if (chantier.email_client && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key') {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'ProFini <noreply@profini.fr>',
        to: [chantier.email_client],
        subject: `Procès-verbal de réception — ${chantier.type_travaux}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
            <h1 style="color:#15355B;font-size:24px;margin:0 0 16px;">Procès-verbal de réception</h1>
            <p style="margin:0 0 8px;">Bonjour ${chantier.nom_client},</p>
            <p style="margin:0 0 16px;color:#374151;">Votre artisan vous a transmis le procès-verbal de réception.</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr><td style="padding:8px 12px;background:#F9FAFB;border:1px solid #E5E7EB;font-weight:600;">Travaux</td><td style="padding:8px 12px;border:1px solid #E5E7EB;">${chantier.type_travaux}</td></tr>
              <tr><td style="padding:8px 12px;background:#F9FAFB;border:1px solid #E5E7EB;font-weight:600;">Adresse</td><td style="padding:8px 12px;border:1px solid #E5E7EB;">${chantier.adresse}</td></tr>
              <tr><td style="padding:8px 12px;background:#F9FAFB;border:1px solid #E5E7EB;font-weight:600;">Montant TTC</td><td style="padding:8px 12px;border:1px solid #E5E7EB;font-weight:700;">${chantier.montant_ttc.toFixed(2)} €</td></tr>
            </table>
            ${pdfUrl ? `<a href="${pdfUrl}" style="display:inline-block;background:#15355B;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;">Télécharger le procès-verbal PDF</a>` : ''}
            <p style="margin-top:32px;color:#9CA3AF;font-size:12px;">ProFini — Gestion de chantiers pour artisans</p>
          </div>
        `,
      })
    } catch (e) { console.error('[cloture] email error', e) }
  }

  console.log('[POST /api/chantiers/:id/cloture] end — pdf:', pdfUrl ? 'ok' : 'failed')
  return NextResponse.json({ ok: true, pdf_url: pdfUrl })
}
