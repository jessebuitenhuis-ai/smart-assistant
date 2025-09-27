'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

type Thread = Database['public']['Tables']['threads']['Row']
type Message = Database['public']['Tables']['messages']['Row']

interface ChatInterfaceProps {
  user: User
}

export default function ChatInterface({ user }: ChatInterfaceProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThread, setCurrentThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createSupabaseClient()

  // Load threads on component mount
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const { data, error } = await supabase
          .from('threads')
          .select('*')
          .order('updated_at', { ascending: false })

        if (error) throw error
        setThreads(data || [])
      } catch (error) {
        console.error('Error loading threads:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchThreads()
  }, [supabase])

  // Load messages when current thread changes
  useEffect(() => {
    if (currentThread) {
      const fetchMessages = async () => {
        try {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('thread_id', currentThread.id)
            .order('created_at', { ascending: true })

          if (error) throw error
          setMessages(data || [])
        } catch (error) {
          console.error('Error loading messages:', error)
        }
      }

      fetchMessages()
    } else {
      setMessages([])
    }
  }, [currentThread, supabase])


  const createNewThread = () => {
    // Just clear the current thread to show the empty interface
    setCurrentThread(null)
  }

  const selectThread = (thread: Thread) => {
    setCurrentThread(thread)
  }

  const sendMessage = async (content: string) => {
    let threadToUse = currentThread

    // Create a new thread if none exists
    if (!threadToUse) {
      try {
        const { data, error } = await supabase
          .from('threads')
          .insert({
            user_id: user.id,
            title: null
          })
          .select()
          .single()

        if (error) throw error

        threadToUse = data as Thread
        setThreads(prev => [threadToUse!, ...prev])
        setCurrentThread(threadToUse)
      } catch (error) {
        console.error('Error creating thread:', error)
        return
      }
    }

    try {
      // Add user message
      const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadToUse.id,
          content,
          role: 'user'
        })
        .select()
        .single()

      if (userError) throw userError

      // Update messages state
      setMessages(prev => [...prev, userMessage as Message])

      // Update thread title if it's the first message
      if (!threadToUse.title) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
        await supabase
          .from('threads')
          .update({ title })
          .eq('id', threadToUse.id)

        setCurrentThread(prev => prev ? { ...prev, title } : null)
        setThreads(prev => prev.map(t =>
          t.id === threadToUse!.id ? { ...t, title } : t
        ))
      }

      // TODO: Add AI response logic here
      // For now, we'll just add a placeholder response
      setTimeout(async () => {
        const { data: assistantMessage, error: assistantError } = await supabase
          .from('messages')
          .insert({
            thread_id: threadToUse!.id,
            content: "I'm a placeholder response. AI integration coming soon!",
            role: 'assistant'
          })
          .select()
          .single()

        if (!assistantError) {
          setMessages(prev => [...prev, assistantMessage as Message])
        }
      }, 1000)

    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
      />
    </div>
  )
}