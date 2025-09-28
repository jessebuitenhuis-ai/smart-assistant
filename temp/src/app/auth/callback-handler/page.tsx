'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function CallbackHandler() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createSupabaseClient()

      try {
        // The tokens are in the URL fragment, Supabase will handle them automatically
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth error:', error)
          router.push('/auth/auth-code-error')
          return
        }

        if (data.session) {
          console.log('Session established successfully')
          router.push('/')
        } else {
          console.log('No session found')
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Callback handler error:', error)
        router.push('/auth/auth-code-error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}