import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/services/ai.service'
import { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json()

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages must be an array' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const aiService = new AIService(apiKey)
    const response = await aiService.generateResponse(
      messages as Message[],
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