'use client'

import { useSearchParams } from 'next/navigation'

export default function AuthCodeError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const code = searchParams.get('code')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sorry, there was an error during authentication. Please try again.
          </p>

          {/* Debug information */}
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
            <p><strong>Error:</strong> {error || 'Not specified'}</p>
            <p><strong>Description:</strong> {errorDescription || 'Not specified'}</p>
            <p><strong>Code present:</strong> {code ? 'Yes' : 'No'}</p>
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          </div>

          <div className="mt-6">
            <a
              href="/auth/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}