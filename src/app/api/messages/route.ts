import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MessageService } from '@/services/message.service'
import { EventService } from '@/services/event.service'
import { ZepService } from '@/services/zep.service'
import { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/messages - Starting request')
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')
    console.log('GET /api/messages - threadId:', threadId)

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      )
    }

    console.log('GET /api/messages - Creating Supabase client')
    const supabase = await createSupabaseServerClient()

    console.log('GET /api/messages - Creating EventService')
    const eventService = new EventService()

    console.log('GET /api/messages - Creating MessageService')
    const messageService = new MessageService(supabase, eventService)

    console.log('GET /api/messages - Fetching messages')
    const messages = await messageService.getMessagesByThreadId(threadId)

    console.log('GET /api/messages - Messages fetched successfully:', messages.length)
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/messages - Starting request')
    const { threadId, content, role, userId, metadata } = await request.json()
    console.log('POST /api/messages - Request data:', { threadId, content, role, userId })

    if (!threadId || !content || !role) {
      return NextResponse.json(
        { error: 'Thread ID, content, and role are required' },
        { status: 400 }
      )
    }

    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either "user" or "assistant"' },
        { status: 400 }
      )
    }

    console.log('POST /api/messages - Creating Supabase client')
    const supabase = await createSupabaseServerClient()

    console.log('POST /api/messages - Creating EventService')
    const eventService = new EventService()

    console.log('POST /api/messages - Initializing ZepService if API key is available')
    const zepApiKey = process.env.ZEP_API_KEY
    if (zepApiKey) {
      try {
        new ZepService(zepApiKey, eventService)
        console.log('POST /api/messages - ZepService initialized')
      } catch (error) {
        console.warn('POST /api/messages - Failed to initialize ZepService:', error)
      }
    } else {
      console.log('POST /api/messages - No ZEP_API_KEY found')
    }

    console.log('POST /api/messages - Creating MessageService')
    const messageService = new MessageService(supabase, eventService)

    console.log('POST /api/messages - Creating message')
    const message = await messageService.createMessage(
      threadId,
      content,
      role,
      userId,
      metadata
    )

    console.log('POST /api/messages - Message created successfully:', message.id)
    return NextResponse.json({ message })
  } catch (error) {
    console.error('Failed to create message:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}