import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log('[POST /api/chantiers/:id/signature] start', id)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { variant, dataUrl } = await req.json() as { variant: 'artisan' | 'client'; dataUrl: string }

  // dataUrl = "data:image/png;base64,..."
  const base64 = dataUrl.split(',')[1]
  const buffer = Buffer.from(base64, 'base64')
  const path = `${user.id}/${id}/${variant}-${Date.now()}.png`

  const { error: uploadError } = await supabase.storage
    .from('signatures').upload(path, buffer, { contentType: 'image/png', upsert: true })

  if (uploadError) {
    console.error('[signature] upload error', uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('signatures').getPublicUrl(path)

  const field = variant === 'artisan' ? 'sig_artisan_url' : 'sig_client_url'
  const { error } = await supabase.from('chantiers')
    .update({ [field]: publicUrl })
    .eq('id', id).eq('artisan_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  console.log('[POST /api/chantiers/:id/signature] end', variant)
  return NextResponse.json({ ok: true, url: publicUrl })
}
