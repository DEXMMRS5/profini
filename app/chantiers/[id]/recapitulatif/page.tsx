import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecapClient from './_recap'

export default async function RecapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: chantier } = await supabase.from('chantiers').select('*, photos(*)').eq('id', id).single()
  if (!chantier) redirect('/')

  return <RecapClient chantier={chantier} />
}
