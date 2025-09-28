import { NextRequest, NextResponse } from 'next/server'
import { ServiceRegistry } from '@/services/service-registry'
import { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

export async function POST(request: NextRequest) {
  try {
    const { messages, threadId, userId, systemPrompt } = await request.json()

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages must be an array' },
        { status: 400 }
      )
    }

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      )
    }

    const serviceRegistry = ServiceRegistry.getInstance()
    const aiService = serviceRegistry.getAIService()

    const response = await aiService.generateResponse(
      messages as Message[],
      threadId,
      userId,
      systemPrompt
    )

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}