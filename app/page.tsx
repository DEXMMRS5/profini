import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './_dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: artisan } = await supabase
    .from('artisans').select('*').eq('id', user.id).single()

  const { data: chantiers } = await supabase
    .from('chantiers')
    .select('*')
    .eq('artisan_id', user.id)
    .order('created_at', { ascending: false })

  return <DashboardClient artisan={artisan} chantiers={chantiers ?? []} />
}
