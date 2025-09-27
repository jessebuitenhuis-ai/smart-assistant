'use client'

import { useState, useCallback, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import { useThreads } from '@/hooks/useThreads'
import { useMessages } from '@/hooks/useMessages'
import { useServices } from '@/hooks/useServices'
import { Database } from '@/types/supabase'

type Thread = Database['public']['Tables']['threads']['Row']

interface ChatInterfaceProps {
  user: User
}

export default function ChatInterface({ user }: ChatInterfaceProps) {
  const [currentThread, setCurrentThread] = useState<Thread | null>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)

  const {
    threads,
    loading: threadsLoading,
    error: threadsError,
    createThread,
    updateThread,
    clearError: clearThreadsError
  } = useThreads(user.id)

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    addMessage,
    clearMessages,
    clearError: clearMessagesError
  } = useMessages(currentThread?.id)

  const { aiService } = useServices()


  const createNewThread = () => {
    setCurrentThread(null)
    clearMessages()
    clearThreadsError()
    clearMessagesError()
  }

  const selectThread = (thread: Thread) => {
    setCurrentThread(thread)
    clearMessagesError()
  }

  const sendMessage = useCallback(async (content: string) => {
    let threadToUse = currentThread

    if (!threadToUse) {
      threadToUse = await createThread()
      if (!threadToUse) {
        console.error('Failed to create new thread')
        return
      }
      setCurrentThread(threadToUse)
      setPendingMessage(content)
      return
    }

    if (!threadToUse.title) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
      const updatedThread = await updateThread(threadToUse.id, { title })
      if (updatedThread) {
        setCurrentThread(updatedThread)
      }
    }

    const userMessage = await addMessage(content, 'user')
    if (!userMessage) {
      console.error('Failed to send message')
      return
    }

    try {
      const updatedMessages = [...messages, userMessage]
      const aiResponse = await aiService.generateResponse(updatedMessages)
      await addMessage(aiResponse, 'assistant')
    } catch (error) {
      console.error('AI generation error:', error)
      await addMessage('Sorry, I encountered an error while generating a response. Please try again.', 'assistant')
    }
  }, [currentThread, createThread, updateThread, addMessage, messages, aiService])

  useEffect(() => {
    if (currentThread && pendingMessage) {
      sendMessage(pendingMessage)
      setPendingMessage(null)
    }
  }, [currentThread, pendingMessage, sendMessage])

  if (threadsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (threadsError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{threadsError}</p>
          <button
            onClick={clearThreadsError}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        threads={threads}
        currentThread={currentThread}
        onNewThread={createNewThread}
        onSelectThread={selectThread}
        user={user}
      />
      <ChatArea
        currentThread={currentThread}
        messages={messages}
        onSendMessage={sendMessage}
        loading={messagesLoading}
        error={messagesError}
        onClearError={clearMessagesError}
      />
    </div>
  )
}