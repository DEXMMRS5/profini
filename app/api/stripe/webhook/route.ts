import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'your-stripe-secret-key') {
    return NextResponse.json({ received: true })
  }

  const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY)
  const sig     = req.headers.get('stripe-signature')
  const body    = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (e) {
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  const sc = await createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const artisanId = session.metadata?.artisan_id
      if (artisanId) {
        await sc.from('artisans').update({
          stripe_customer_id:     session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan: 'active',
        }).eq('id', artisanId)
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const artisanId = sub.metadata?.artisan_id
      if (artisanId) {
        await sc.from('artisans').update({ plan: 'expired' }).eq('id', artisanId)
      }
      break
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice & { customer_email?: string; hosted_invoice_url?: string; pdf?: string }
      // Envoyer la facture par email via Resend
      if (invoice.customer_email && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key') {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY)
          await resend.emails.send({
            from: 'ProFini Facturation <noreply@profini.fr>',
            to: [invoice.customer_email],
            subject: `🧾 Votre facture ProFini — ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
            html: `
              <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
                <h1 style="color:#15355B;font-size:20px;">Votre facture ProFini</h1>
                <p>Merci pour votre abonnement ProFini !</p>
                <p style="font-size:15px;"><strong>Montant :</strong> ${((invoice.amount_paid ?? 0) / 100).toFixed(2)} €</p>
                ${invoice.hosted_invoice_url ? `<p><a href="${invoice.hosted_invoice_url}" style="display:inline-block;background:#15355B;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;">📄 Voir / Télécharger la facture</a></p>` : ''}
                <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">ProFini — profini.vercel.app</p>
              </div>
            `,
          })
        } catch (e) { console.error('[webhook] invoice email error', e) }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
