import { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

export interface MessageCreatedEvent {
  message: Message
  threadId: string
  userId?: string
}