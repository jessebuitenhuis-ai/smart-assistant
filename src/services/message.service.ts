import { SupabaseClient } from '@supabase/supabase-js'
import { Database, Json } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type MessageUpdate = Database['public']['Tables']['messages']['Update']

export class MessageServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = 'MessageServiceError'
  }
}

export class MessageService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getMessagesByThreadId(threadId: string): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (error) {
        throw new MessageServiceError(`Failed to fetch messages: ${error.message}`, 'FETCH_MESSAGES_ERROR')
      }

      return data || []
    } catch (error) {
      if (error instanceof MessageServiceError) {
        throw error
      }
      throw new MessageServiceError('An unexpected error occurred while fetching messages', 'UNKNOWN_ERROR')
    }
  }

  async createMessage(
    threadId: string,
    content: string,
    role: 'user' | 'assistant',
    metadata?: Json
  ): Promise<Message> {
    try {
      const messageData: MessageInsert = {
        thread_id: threadId,
        content,
        role,
        metadata: metadata || null,
      }

      const { data, error } = await this.supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (error) {
        throw new MessageServiceError(`Failed to create message: ${error.message}`, 'CREATE_MESSAGE_ERROR')
      }

      if (!data) {
        throw new MessageServiceError('No data returned after creating message', 'CREATE_MESSAGE_NO_DATA')
      }

      return data
    } catch (error) {
      if (error instanceof MessageServiceError) {
        throw error
      }
      throw new MessageServiceError('An unexpected error occurred while creating message', 'UNKNOWN_ERROR')
    }
  }

  async updateMessage(messageId: string, updates: Omit<MessageUpdate, 'id'>): Promise<Message> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .update(updates)
        .eq('id', messageId)
        .select()
        .single()

      if (error) {
        throw new MessageServiceError(`Failed to update message: ${error.message}`, 'UPDATE_MESSAGE_ERROR')
      }

      if (!data) {
        throw new MessageServiceError('No data returned after updating message', 'UPDATE_MESSAGE_NO_DATA')
      }

      return data
    } catch (error) {
      if (error instanceof MessageServiceError) {
        throw error
      }
      throw new MessageServiceError('An unexpected error occurred while updating message', 'UNKNOWN_ERROR')
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        throw new MessageServiceError(`Failed to delete message: ${error.message}`, 'DELETE_MESSAGE_ERROR')
      }
    } catch (error) {
      if (error instanceof MessageServiceError) {
        throw error
      }
      throw new MessageServiceError('An unexpected error occurred while deleting message', 'UNKNOWN_ERROR')
    }
  }

  async deleteMessagesByThreadId(threadId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('messages')
        .delete()
        .eq('thread_id', threadId)

      if (error) {
        throw new MessageServiceError(`Failed to delete messages: ${error.message}`, 'DELETE_MESSAGES_ERROR')
      }
    } catch (error) {
      if (error instanceof MessageServiceError) {
        throw error
      }
      throw new MessageServiceError('An unexpected error occurred while deleting messages', 'UNKNOWN_ERROR')
    }
  }

  async getMessageById(messageId: string): Promise<Message | null> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        throw new MessageServiceError(`Failed to fetch message: ${error.message}`, 'FETCH_MESSAGE_ERROR')
      }

      return data
    } catch (error) {
      if (error instanceof MessageServiceError) {
        throw error
      }
      throw new MessageServiceError('An unexpected error occurred while fetching message', 'UNKNOWN_ERROR')
    }
  }
}