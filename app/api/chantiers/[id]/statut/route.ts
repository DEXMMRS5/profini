import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ChantierStatus } from '@/lib/types'

const VALID: ChantierStatus[] = ['encours', 'impaye', 'paye', 'cloture']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { status } = await req.json()
  if (!VALID.includes(status)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })

  const { data, error } = await supabase
    .from('chantiers').update({ status }).eq('id', id).eq('artisan_id', user.id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
