import { Database, Json } from '@/types/supabase'
import { MessageServiceError } from './errors/message-service.error'

type Message = Database['public']['Tables']['messages']['Row']

export class MessageClientService {
  async getMessagesByThreadId(threadId: string): Promise<Message[]> {
    try {
      const response = await fetch(`/api/messages?threadId=${encodeURIComponent(threadId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new MessageServiceError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          'API_ERROR'
        )
      }

      const data = await response.json()
      return data.messages || []
    } catch (error) {
      if (error instanceof MessageServiceError) {
        throw error
      }

      if (error instanceof Error) {
        throw new MessageServiceError(`Failed to fetch messages: ${error.message}`, 'FETCH_ERROR')
      }

      throw new MessageServiceError('An unexpected error occurred while fetching messages', 'UNKNOWN_ERROR')
    }
  }

  async createMessage(
    threadId: string,
    content: string,
    role: 'user' | 'assistant',
    userId?: string,
    metadata?: Json
  ): Promise<Message> {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
          content,
          role,
          userId,
          metadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new MessageServiceError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          'API_ERROR'
        )
      }

      const data = await response.json()

      if (!data.message) {
        throw new MessageServiceError('No message returned after creation', 'EMPTY_RESPONSE')
      }

      return data.message
    } catch (error) {
      if (error instanceof MessageServiceError) {
        throw error
      }

      if (error instanceof Error) {
        throw new MessageServiceError(`Failed to create message: ${error.message}`, 'CREATE_ERROR')
      }

      throw new MessageServiceError('An unexpected error occurred while creating message', 'UNKNOWN_ERROR')
    }
  }

  async updateMessage(messageId: string, updates: { content?: string; metadata?: Json }): Promise<Message> {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new MessageServiceError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          'API_ERROR'
        )
      }

      const data = await response.json()

      if (!data.message) {
        throw new MessageServiceError('No message returned after update', 'EMPTY_RESPONSE')
      }

      return data.message
    } catch (error) {
      if (error instanceof MessageServiceError) {
        throw error
      }

      if (error instanceof Error) {
        throw new MessageServiceError(`Failed to update message: ${error.message}`, 'UPDATE_ERROR')
      }

      throw new MessageServiceError('An unexpected error occurred while updating message', 'UNKNOWN_ERROR')
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new MessageServiceError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          'API_ERROR'
        )
      }
    } catch (error) {
      if (error instanceof MessageServiceError) {
        throw error
      }

      if (error instanceof Error) {
        throw new MessageServiceError(`Failed to delete message: ${error.message}`, 'DELETE_ERROR')
      }

      throw new MessageServiceError('An unexpected error occurred while deleting message', 'UNKNOWN_ERROR')
    }
  }
}