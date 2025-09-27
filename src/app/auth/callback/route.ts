import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('OAuth callback - code:', code ? 'present' : 'missing')
  console.log('OAuth callback - origin:', origin)

  if (code) {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('exchangeCodeForSession error:', error)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      console.log('Success! Redirecting to:', `${origin}${next}`)

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  } else {
    // Handle implicit flow - redirect to a client-side handler
    console.log('No code found - likely implicit flow, redirecting to client handler')
    return NextResponse.redirect(`${origin}/auth/callback-handler`)
  }

  // Return the user to an error page with instructions
  console.log('OAuth callback failed - redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}