import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

type Ton = 'cordial' | 'neutre' | 'formel'

function buildMessage(ton: Ton, jour: number, data: { client: string; artisan: string; montant: number; facture?: string }): { objet: string; message: string } {
  const m = data.montant.toFixed(2)
  const f = data.facture ? `(réf. ${data.facture}) ` : ''

  if (jour <= 2) {
    return {
      objet: `Rappel règlement — ${(data as { type_travaux?: string }).type_travaux ?? 'travaux'}`,
      message: `Bonjour ${data.client},\n\nJ'espère que les travaux vous donnent satisfaction !\nJe me permets de vous rappeler la facture ${f}d'un montant de ${m} €, qui n'a pas encore été réglée.\nN'hésitez pas à me contacter si vous avez la moindre question.\n\nCordialement,\n${data.artisan}`,
    }
  } else if (jour <= 7) {
    return {
      objet: `Relance paiement — facture en attente`,
      message: `Bonjour ${data.client},\n\nSauf erreur de ma part, la facture ${f}de ${m} € reste impayée à ce jour.\nMerci de procéder au règlement dans les meilleurs délais ou de me confirmer une date de paiement.\n\nCordialement,\n${data.artisan}`,
    }
  } else {
    const level = ton === 'formel'
      ? `Je suis dans l'obligation de vous informer que sans règlement sous 8 jours, je serai contraint d'engager une procédure de recouvrement.`
      : `Je vous invite vivement à régulariser cette situation rapidement.`
    return {
      objet: `3ème relance — facture impayée ${f}`,
      message: `Bonjour ${data.client},\n\nMalgré mes précédentes relances, la facture ${f}d'un montant de ${m} € reste impayée.\n${level}\n\nCordialement,\n${data.artisan}`,
    }
  }
}

interface RelanceData { client: string; artisan: string; montant: number; facture?: string; type_travaux?: string; [key: string]: unknown }

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { chantier_id, type, custom_message } = await req.json()
  const jour = type === 'j2' ? 2 : type === 'j7' ? 7 : 30

  const { data: chantier } = await supabase.from('chantiers').select('*').eq('id', chantier_id).eq('artisan_id', user.id).single()
  if (!chantier || !chantier.email_client) return NextResponse.json({ error: 'Chantier ou email introuvable' }, { status: 404 })

  const { data: artisan } = await supabase.from('artisans').select('*').eq('id', user.id).single()

  const ton: Ton = (artisan?.relance_ton as Ton) ?? 'cordial'
  const data: RelanceData = { client: chantier.nom_client, artisan: artisan?.nom ?? 'Votre artisan', montant: chantier.montant_ttc, facture: chantier.numero_devis, type_travaux: chantier.type_travaux }
  const { objet, message } = buildMessage(ton, jour, data)
  const finalMessage = custom_message ?? message

  const hasResend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key'
  let sent = false

  if (hasResend) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: `${artisan?.nom_entreprise ?? artisan?.nom ?? 'ProFini'} <noreply@profini.fr>`,
        to: [chantier.email_client],
        subject: objet,
        html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;"><pre style="white-space:pre-wrap;font-family:inherit;font-size:15px;color:#374151;">${finalMessage}</pre>${chantier.pdf_url ? `<p style="margin-top:24px;"><a href="${chantier.pdf_url}" style="color:#15355B;font-weight:600;">📄 Voir le procès-verbal</a></p>` : ''}</div>`,
      })
      sent = true
    } catch (e) { console.error('[relance] email error', e) }
  }

  await supabase.from('relances').insert({ chantier_id, artisan_id: user.id, type, email_to: chantier.email_client, message_body: finalMessage })

  return NextResponse.json({ ok: true, sent, preview: { objet, message: finalMessage } })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const { data } = await supabase.from('relances').select('*, chantiers(nom_client, type_travaux, montant_ttc)').eq('artisan_id', user.id).order('sent_at', { ascending: false }).limit(50)
  return NextResponse.json(data ?? [])
}
