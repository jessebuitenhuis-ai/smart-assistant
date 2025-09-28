'use client'

import { useState, useRef, useEffect } from 'react'
import { Database } from '@/types/supabase'
import SendIcon from '@/components/ui/SendIcon'
import CloseIcon from '@/components/ui/CloseIcon'

type Thread = Database['public']['Tables']['threads']['Row']
type Message = Database['public']['Tables']['messages']['Row']

interface ChatAreaProps {
  currentThread: Thread | null
  messages: Message[]
  onSendMessage: (content: string) => void
  loading?: boolean
  error?: string | null
  onClearError?: () => void
}

export default function ChatArea({
  currentThread,
  messages,
  onSendMessage,
  loading = false,
  error = null,
  onClearError
}: ChatAreaProps) {
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSubmitting) return

    const content = input.trim()
    setInput('')
    setIsSubmitting(true)

    try {
      onSendMessage(content)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // If no thread is selected or no messages, show centered input
  if (!currentThread || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        {/* Empty state with centered input */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Smart Assistant
              </h1>
              <p className="text-lg text-gray-600">
                How can I help you today?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black placeholder-gray-400"
                  rows={4}
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSubmitting}
                  className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Chat interface with messages and bottom input
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="text-red-800">{error}</p>
                {onClearError && (
                  <button
                    onClick={onClearError}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
            </div>
          )}

          {loading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading messages...</span>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.created_at)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom input */}
      <div className="border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black placeholder-gray-400"
                rows={1}
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                style={{
                  minHeight: '52px',
                  maxHeight: '200px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 200) + 'px'
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isSubmitting}
                className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SendIcon />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}