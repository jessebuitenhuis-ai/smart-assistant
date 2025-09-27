import { useMemo } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ThreadService } from '@/services/thread.service'
import { MessageService } from '@/services/message.service'
import { AuthService } from '@/services/auth.service'

export function useServices() {
  const supabase = useMemo(() => createSupabaseClient(), [])

  const services = useMemo(() => ({
    threadService: new ThreadService(supabase),
    messageService: new MessageService(supabase),
    authService: new AuthService(supabase),
  }), [supabase])

  return services
}