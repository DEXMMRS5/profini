import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  console.log('[GET /api/artisan] start')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data, error } = await supabase.from('artisans').select('*').eq('id', user.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  console.log('[GET /api/artisan] end')
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  console.log('[PATCH /api/artisan] start')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const allowed = ['nom', 'tel', 'nom_entreprise', 'siret', 'adresse', 'code_postal', 'ville', 'site_web', 'description_activite', 'mention_tva', 'photo_url', 'logo_url']
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const { data, error } = await supabase
    .from('artisans').update(update).eq('id', user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  console.log('[PATCH /api/artisan] end')
  return NextResponse.json(data)
}
