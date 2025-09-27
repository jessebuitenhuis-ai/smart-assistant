import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

type Thread = Database['public']['Tables']['threads']['Row']
type ThreadInsert = Database['public']['Tables']['threads']['Insert']
type ThreadUpdate = Database['public']['Tables']['threads']['Update']

export class ThreadServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = 'ThreadServiceError'
  }
}

export class ThreadService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getThreads(userId: string): Promise<Thread[]> {
    try {
      const { data, error } = await this.supabase
        .from('threads')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        throw new ThreadServiceError(`Failed to fetch threads: ${error.message}`, 'FETCH_THREADS_ERROR')
      }

      return data || []
    } catch (error) {
      if (error instanceof ThreadServiceError) {
        throw error
      }
      throw new ThreadServiceError('An unexpected error occurred while fetching threads', 'UNKNOWN_ERROR')
    }
  }

  async createThread(userId: string, title?: string): Promise<Thread> {
    try {
      const threadData: ThreadInsert = {
        user_id: userId,
        title: title || null,
      }

      const { data, error } = await this.supabase
        .from('threads')
        .insert(threadData)
        .select()
        .single()

      if (error) {
        throw new ThreadServiceError(`Failed to create thread: ${error.message}`, 'CREATE_THREAD_ERROR')
      }

      if (!data) {
        throw new ThreadServiceError('No data returned after creating thread', 'CREATE_THREAD_NO_DATA')
      }

      return data
    } catch (error) {
      if (error instanceof ThreadServiceError) {
        throw error
      }
      throw new ThreadServiceError('An unexpected error occurred while creating thread', 'UNKNOWN_ERROR')
    }
  }

  async updateThread(threadId: string, updates: Omit<ThreadUpdate, 'id'>): Promise<Thread> {
    try {
      const { data, error } = await this.supabase
        .from('threads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', threadId)
        .select()
        .single()

      if (error) {
        throw new ThreadServiceError(`Failed to update thread: ${error.message}`, 'UPDATE_THREAD_ERROR')
      }

      if (!data) {
        throw new ThreadServiceError('No data returned after updating thread', 'UPDATE_THREAD_NO_DATA')
      }

      return data
    } catch (error) {
      if (error instanceof ThreadServiceError) {
        throw error
      }
      throw new ThreadServiceError('An unexpected error occurred while updating thread', 'UNKNOWN_ERROR')
    }
  }

  async deleteThread(threadId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('threads')
        .delete()
        .eq('id', threadId)

      if (error) {
        throw new ThreadServiceError(`Failed to delete thread: ${error.message}`, 'DELETE_THREAD_ERROR')
      }
    } catch (error) {
      if (error instanceof ThreadServiceError) {
        throw error
      }
      throw new ThreadServiceError('An unexpected error occurred while deleting thread', 'UNKNOWN_ERROR')
    }
  }

  async getThreadById(threadId: string): Promise<Thread | null> {
    try {
      const { data, error } = await this.supabase
        .from('threads')
        .select('*')
        .eq('id', threadId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        throw new ThreadServiceError(`Failed to fetch thread: ${error.message}`, 'FETCH_THREAD_ERROR')
      }

      return data
    } catch (error) {
      if (error instanceof ThreadServiceError) {
        throw error
      }
      throw new ThreadServiceError('An unexpected error occurred while fetching thread', 'UNKNOWN_ERROR')
    }
  }
}