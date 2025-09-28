import { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

export interface AIContextRequestedEvent {
  threadId: string
  userId?: string
  messages: Message[]
}