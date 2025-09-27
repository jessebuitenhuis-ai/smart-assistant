import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to Smart Assistant!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          🎉 Authentication successful
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {user.user_metadata?.avatar_url && (
              <div className="flex justify-center">
                <img
                  className="h-20 w-20 rounded-full"
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                />
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-gray-900">User Information</h3>
              <dl className="mt-4 space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{user.user_metadata?.full_name || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Provider</dt>
                  <dd className="text-sm text-gray-900">{user.app_metadata?.provider || 'Unknown'}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6">
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </form>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                ✅ Google OAuth authentication is working correctly!<br/>
                ✅ Supabase integration is active<br/>
                ✅ User session management is functional
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
