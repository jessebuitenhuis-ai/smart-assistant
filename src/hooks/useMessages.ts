import { useState, useEffect, useCallback } from 'react'
import { useServices } from './useServices'
import { MessageServiceError } from '@/services/message.service'
import { Database, Json } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

interface UseMessagesState {
  messages: Message[]
  loading: boolean
  error: string | null
}

export function useMessages(threadId?: string) {
  const { messageService } = useServices()
  const [state, setState] = useState<UseMessagesState>({
    messages: [],
    loading: false,
    error: null,
  })

  const fetchMessages = useCallback(async () => {
    if (!threadId) {
      setState(prev => ({ ...prev, messages: [], loading: false, error: null }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const messages = await messageService.getMessagesByThreadId(threadId)
      setState(prev => ({ ...prev, messages, loading: false }))
    } catch (error) {
      const errorMessage = error instanceof MessageServiceError
        ? error.message
        : 'Failed to load messages'

      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
    }
  }, [messageService, threadId])

  const addMessage = useCallback(async (
    content: string,
    role: 'user' | 'assistant',
    metadata?: Json
  ) => {
    if (!threadId) return null

    try {
      const newMessage = await messageService.createMessage(threadId, content, role, metadata)
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }))
      return newMessage
    } catch (error) {
      const errorMessage = error instanceof MessageServiceError
        ? error.message
        : 'Failed to send message'

      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    }
  }, [messageService, threadId])

  const updateMessage = useCallback(async (
    messageId: string,
    updates: { content?: string; metadata?: Json }
  ) => {
    try {
      const updatedMessage = await messageService.updateMessage(messageId, updates)
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(message =>
          message.id === messageId ? updatedMessage : message
        )
      }))
      return updatedMessage
    } catch (error) {
      const errorMessage = error instanceof MessageServiceError
        ? error.message
        : 'Failed to update message'

      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    }
  }, [messageService])

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId)
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(message => message.id !== messageId)
      }))
      return true
    } catch (error) {
      const errorMessage = error instanceof MessageServiceError
        ? error.message
        : 'Failed to delete message'

      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [messageService])

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [], error: null }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return {
    ...state,
    refetch: fetchMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    clearError,
  }
}