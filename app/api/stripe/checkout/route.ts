import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'your-stripe-secret-key') {
    return NextResponse.json({ error: 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans vos variables d\'environnement.' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: artisan } = await supabase.from('artisans').select('*').eq('id', user.id).single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://profini.vercel.app'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: artisan?.email ?? user.email,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID ?? 'price_placeholder',
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/plan/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${appUrl}/plan`,
    metadata: { artisan_id: user.id },
    subscription_data: {
      trial_period_days: 14,
      metadata: { artisan_id: user.id },
    },
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: 'ProFini — Abonnement mensuel',
        metadata: { artisan_id: user.id },
      },
    },
  })

  return NextResponse.json({ url: session.url })
}
