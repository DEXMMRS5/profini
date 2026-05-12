import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log('[GET /api/chantiers/:id] start', id)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data, error } = await supabase
    .from('chantiers').select('*, photos(*)')
    .eq('id', id).eq('artisan_id', user.id).single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  console.log('[GET /api/chantiers/:id] end')
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log('[PATCH /api/chantiers/:id] start', id)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('chantiers').update(body)
    .eq('id', id).eq('artisan_id', user.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  console.log('[PATCH /api/chantiers/:id] end')
  return NextResponse.json(data)
}
