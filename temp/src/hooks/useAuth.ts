import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { useServices } from './useServices'
import { AuthServiceError } from '@/services/errors/auth-service.error'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface UseAuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  initializing: boolean
}

export function useAuth() {
  const { authService } = useServices()
  const [state, setState] = useState<UseAuthState>({
    user: null,
    profile: null,
    loading: false,
    error: null,
    initializing: true,
  })

  const fetchUser = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const user = await authService.getCurrentUser()
      setState(prev => ({ ...prev, user, loading: false, initializing: false }))

      if (user) {
        try {
          const profile = await authService.getProfile(user.id)
          setState(prev => ({ ...prev, profile }))
        } catch (profileError) {
          console.warn('Failed to fetch profile:', profileError)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof AuthServiceError
        ? error.message
        : 'Failed to get user information'

      setState(prev => ({
        ...prev,
        loading: false,
        initializing: false,
        error: errorMessage
      }))
    }
  }, [authService])

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await authService.signOut()
      setState(prev => ({
        ...prev,
        user: null,
        profile: null,
        loading: false
      }))
      return true
    } catch (error) {
      const errorMessage = error instanceof AuthServiceError
        ? error.message
        : 'Failed to sign out'

      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return false
    }
  }, [authService])

  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await authService.signInWithGoogle({ redirectTo })
    } catch (error) {
      const errorMessage = error instanceof AuthServiceError
        ? error.message
        : 'Failed to sign in with Google'

      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
    }
  }, [authService])

  const updateProfile = useCallback(async (updates: {
    email?: string
    full_name?: string
    avatar_url?: string
  }) => {
    if (!state.user) return null

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const updatedProfile = await authService.updateProfile(state.user.id, updates)
      setState(prev => ({ ...prev, profile: updatedProfile, loading: false }))
      return updatedProfile
    } catch (error) {
      const errorMessage = error instanceof AuthServiceError
        ? error.message
        : 'Failed to update profile'

      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return null
    }
  }, [authService, state.user])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  useEffect(() => {
    fetchUser()

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setState(prev => ({ ...prev, user, profile: null }))

      if (user) {
        authService.getProfile(user.id)
          .then(profile => setState(prev => ({ ...prev, profile })))
          .catch(error => console.warn('Failed to fetch profile:', error))
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [authService, fetchUser])

  return {
    ...state,
    signOut,
    signInWithGoogle,
    updateProfile,
    clearError,
    refetch: fetchUser,
    isAuthenticated: !!state.user,
  }
}