import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  console.log('[POST /api/artisan/upload] start')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as 'photo' | 'logo' | null

  if (!file || !type) return NextResponse.json({ error: 'Fichier ou type manquant' }, { status: 400 })
  if (!['photo', 'logo'].includes(type)) return NextResponse.json({ error: 'Type invalide' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  if (!['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
    return NextResponse.json({ error: 'Format non supporté (jpg, png, webp, svg)' }, { status: 400 })
  }

  const path = `${user.id}/${type}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('avatars')
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: true,
    })

  if (uploadErr) {
    console.error('[upload] error', uploadErr)
    return NextResponse.json({ error: uploadErr.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  // Cache bust
  const url = `${publicUrl}?v=${Date.now()}`

  // Save URL in artisan profile
  const field = type === 'photo' ? 'photo_url' : 'logo_url'
  await supabase.from('artisans').update({ [field]: url }).eq('id', user.id)

  console.log('[POST /api/artisan/upload] end', type, url)
  return NextResponse.json({ url })
}
