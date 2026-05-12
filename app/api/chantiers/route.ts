import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  console.log('[GET /api/chantiers] start')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data, error } = await supabase
    .from('chantiers').select('*, photos(*)')
    .eq('artisan_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  console.log('[GET /api/chantiers] end', data?.length, 'chantiers')
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  console.log('[POST /api/chantiers] start')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('chantiers')
    .insert({ ...body, artisan_id: user.id, status: 'encours' })
    .select().single()

  if (error) { console.error('[POST /api/chantiers] error', error); return NextResponse.json({ error: error.message }, { status: 500 }) }
  console.log('[POST /api/chantiers] end', data.id)
  return NextResponse.json(data)
}
