import { useMemo } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ThreadService } from '@/services/thread.service'
import { MessageClientService } from '@/services/message-client.service'
import { AuthService } from '@/services/auth.service'
import { AIClientService } from '@/services/ai-client.service'

export function useServices() {
  const supabase = useMemo(() => createSupabaseClient(), [])

  const services = useMemo(() => ({
    threadService: new ThreadService(supabase),
    messageService: new MessageClientService(),
    authService: new AuthService(supabase),
    aiService: new AIClientService(),
  }), [supabase])

  return services
}