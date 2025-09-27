import { useState, useEffect, useCallback } from 'react'
import { useServices } from './useServices'
import { ThreadServiceError } from '@/services/thread.service'
import { Database } from '@/types/supabase'

type Thread = Database['public']['Tables']['threads']['Row']

interface UseThreadsState {
  threads: Thread[]
  loading: boolean
  error: string | null
}

export function useThreads(userId?: string) {
  const { threadService } = useServices()
  const [state, setState] = useState<UseThreadsState>({
    threads: [],
    loading: false,
    error: null,
  })

  const fetchThreads = useCallback(async () => {
    if (!userId) {
      setState(prev => ({ ...prev, threads: [], loading: false, error: null }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const threads = await threadService.getThreads(userId)
      setState(prev => ({ ...prev, threads, loading: false }))
    } catch (error) {
      const errorMessage = error instanceof ThreadServiceError
        ? error.message
        : 'Failed to load conversations'

      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
    }
  }, [threadService, userId])

  const createThread = useCallback(async (title?: string) => {
    if (!userId) return null

    try {
      const newThread = await threadService.createThread(userId, title)
      setState(prev => ({
        ...prev,
        threads: [newThread, ...prev.threads]
      }))
      return newThread
    } catch (error) {
      const errorMessage = error instanceof ThreadServiceError
        ? error.message
        : 'Failed to create conversation'

      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    }
  }, [threadService, userId])

  const updateThread = useCallback(async (threadId: string, updates: { title?: string }) => {
    try {
      const updatedThread = await threadService.updateThread(threadId, updates)
      setState(prev => ({
        ...prev,
        threads: prev.threads.map(thread =>
          thread.id === threadId ? updatedThread : thread
        )
      }))
      return updatedThread
    } catch (error) {
      const errorMessage = error instanceof ThreadServiceError
        ? error.message
        : 'Failed to update conversation'

      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    }
  }, [threadService])

  const deleteThread = useCallback(async (threadId: string) => {
    try {
      await threadService.deleteThread(threadId)
      setState(prev => ({
        ...prev,
        threads: prev.threads.filter(thread => thread.id !== threadId)
      }))
      return true
    } catch (error) {
      const errorMessage = error instanceof ThreadServiceError
        ? error.message
        : 'Failed to delete conversation'

      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [threadService])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  return {
    ...state,
    refetch: fetchThreads,
    createThread,
    updateThread,
    deleteThread,
    clearError,
  }
}