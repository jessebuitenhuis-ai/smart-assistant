import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatInterface from '@/components/chat/ChatInterface'

export default async function Home() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  return <ChatInterface user={user} />
}
