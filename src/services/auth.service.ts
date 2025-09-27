import { SupabaseClient, User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export class AuthServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

export class AuthService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()

      if (error) {
        throw new AuthServiceError(`Failed to get current user: ${error.message}`, 'GET_USER_ERROR')
      }

      return user
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error
      }
      throw new AuthServiceError('An unexpected error occurred while getting current user', 'UNKNOWN_ERROR')
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        throw new AuthServiceError(`Failed to sign out: ${error.message}`, 'SIGN_OUT_ERROR')
      }
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error
      }
      throw new AuthServiceError('An unexpected error occurred while signing out', 'UNKNOWN_ERROR')
    }
  }

  async signInWithGoogle(options?: { redirectTo?: string }): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: options?.redirectTo,
        },
      })

      if (error) {
        throw new AuthServiceError(`Failed to sign in with Google: ${error.message}`, 'GOOGLE_SIGN_IN_ERROR')
      }
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error
      }
      throw new AuthServiceError('An unexpected error occurred while signing in with Google', 'UNKNOWN_ERROR')
    }
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        throw new AuthServiceError(`Failed to fetch profile: ${error.message}`, 'FETCH_PROFILE_ERROR')
      }

      return data
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error
      }
      throw new AuthServiceError('An unexpected error occurred while fetching profile', 'UNKNOWN_ERROR')
    }
  }

  async createProfile(profileData: ProfileInsert): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        throw new AuthServiceError(`Failed to create profile: ${error.message}`, 'CREATE_PROFILE_ERROR')
      }

      if (!data) {
        throw new AuthServiceError('No data returned after creating profile', 'CREATE_PROFILE_NO_DATA')
      }

      return data
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error
      }
      throw new AuthServiceError('An unexpected error occurred while creating profile', 'UNKNOWN_ERROR')
    }
  }

  async updateProfile(userId: string, updates: Omit<ProfileUpdate, 'id'>): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw new AuthServiceError(`Failed to update profile: ${error.message}`, 'UPDATE_PROFILE_ERROR')
      }

      if (!data) {
        throw new AuthServiceError('No data returned after updating profile', 'UPDATE_PROFILE_NO_DATA')
      }

      return data
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error
      }
      throw new AuthServiceError('An unexpected error occurred while updating profile', 'UNKNOWN_ERROR')
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) {
        throw new AuthServiceError(`Failed to delete profile: ${error.message}`, 'DELETE_PROFILE_ERROR')
      }
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error
      }
      throw new AuthServiceError('An unexpected error occurred while deleting profile', 'UNKNOWN_ERROR')
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    })
  }
}