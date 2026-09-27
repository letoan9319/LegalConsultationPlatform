import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch recent sessions
  const { data: sessions } = await supabase
    .from('consultation_sessions')
    .select('*, customer:profiles!customer_id(full_name), lawyer:profiles!lawyer_id(full_name)')
    .or(`customer_id.eq.${user.id},lawyer_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <DashboardClient
      user={user}
      profile={profile}
      sessions={sessions || []}
    />
  )
}
