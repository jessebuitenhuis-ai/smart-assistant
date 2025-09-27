'use client'

import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/supabase'

type Thread = Database['public']['Tables']['threads']['Row']

interface SidebarProps {
  threads: Thread[]
  currentThread: Thread | null
  onNewThread: () => void
  onSelectThread: (thread: Thread) => void
  user: User
}

export default function Sidebar({
  threads,
  currentThread,
  onNewThread,
  onSelectThread,
  user
}: SidebarProps) {
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Header with New Thread Button */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewThread}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          New Thread
        </button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-4 text-gray-400 text-sm text-center">
            No conversations yet.<br />
            Start by creating a new thread.
          </div>
        ) : (
          <div className="p-2">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  currentThread?.id === thread.id
                    ? 'bg-gray-700 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <div className="font-medium text-sm truncate">
                  {thread.title || 'New Conversation'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(thread.updated_at)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Info and Sign Out */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {user.user_metadata?.full_name || 'User'}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-sm bg-gray-800 hover:bg-gray-700 rounded-lg p-2 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}