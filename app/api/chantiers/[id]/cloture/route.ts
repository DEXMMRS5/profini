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

  // Load full chantier
  const { data: chantier, error: fetchErr } = await supabase
    .from('chantiers').select('*, photos(*)').eq('id', id).eq('artisan_id', user.id).single()
  if (fetchErr || !chantier) return NextResponse.json({ error: 'Chantier introuvable' }, { status: 404 })

  // Load artisan info
  const { data: artisan } = await supabase.from('artisans').select('*').eq('id', user.id).single()

  // Generate PDF
  const pdfBuffer = await generatePV({ chantier, artisan })

  // Upload PDF to storage (service role to bypass RLS)
  const serviceClient = await createServiceClient()
  const pdfPath = `${user.id}/${id}/pv-${Date.now()}.pdf`
  const { error: pdfUploadErr } = await serviceClient.storage
    .from('pdfs').upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

  let pdfUrl: string | undefined
  if (!pdfUploadErr) {
    const { data } = serviceClient.storage.from('pdfs').getPublicUrl(pdfPath)
    pdfUrl = data.publicUrl
  }

  // Update chantier status
  await supabase.from('chantiers').update({
    status: paiement_recu ? 'paye' : 'cloture',
    paiement_recu, demande_avis,
    pdf_url: pdfUrl,
    closed_at: new Date().toISOString(),
  }).eq('id', id)

  // Send email if client has email
  if (chantier.email_client && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key') {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'ProFini <noreply@profini.fr>',
        to: [chantier.email_client],
        subject: `Procès-verbal de réception — ${chantier.type_travaux}`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #15355B; font-size: 24px;">Procès-verbal de réception</h1>
            <p>Bonjour ${chantier.nom_client},</p>
            <p>Votre artisan vous a transmis le procès-verbal de réception pour les travaux suivants :</p>
            <ul>
              <li><strong>Travaux :</strong> ${chantier.type_travaux}</li>
              <li><strong>Adresse :</strong> ${chantier.adresse}</li>
              <li><strong>Montant TTC :</strong> ${chantier.montant_ttc.toFixed(2)} €</li>
            </ul>
            ${pdfUrl ? `<p><a href="${pdfUrl}" style="color: #15355B; font-weight: 600;">Télécharger le procès-verbal PDF</a></p>` : ''}
            <p style="color: #6B7280; font-size: 14px;">ProFini — Gestion de chantiers</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('[cloture] email error', emailErr)
    }
  }

  console.log('[POST /api/chantiers/:id/cloture] end')
  return NextResponse.json({ ok: true, pdf_url: pdfUrl })
}
