import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log('[POST /api/chantiers/:id/photos] start', id)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  // Verify chantier belongs to user
  const { data: chantier } = await supabase.from('chantiers').select('id').eq('id', id).eq('artisan_id', user.id).single()
  if (!chantier) return NextResponse.json({ error: 'Chantier introuvable' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}/${id}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('photos').upload(path, await file.arrayBuffer(), { contentType: file.type })

  if (uploadError) {
    console.error('[photos] upload error', uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)

  const { data, error } = await supabase.from('photos').insert({ chantier_id: id, url: publicUrl, path }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  console.log('[POST /api/chantiers/:id/photos] end', data.id)
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const photoId = searchParams.get('photoId')
  if (!photoId) return NextResponse.json({ error: 'photoId manquant' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: photo } = await supabase.from('photos').select('path').eq('id', photoId).single()
  if (photo?.path) await supabase.storage.from('photos').remove([photo.path])

  await supabase.from('photos').delete().eq('id', photoId)
  return NextResponse.json({ ok: true })
}
