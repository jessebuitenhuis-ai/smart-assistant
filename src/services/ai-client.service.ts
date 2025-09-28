import { Database } from '@/types/supabase'
import { AIClientServiceError } from './errors/ai-client-service.error'

type Message = Database['public']['Tables']['messages']['Row']

export class AIClientService {
  async generateResponse(
    messages: Message[],
    threadId: string,
    userId?: string,
    systemPrompt: string = 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.'
  ): Promise<string> {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          threadId,
          userId,
          systemPrompt,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new AIClientServiceError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          'API_ERROR'
        )
      }

      const data = await response.json()

      if (!data.response) {
        throw new AIClientServiceError('Empty response from AI service', 'EMPTY_RESPONSE')
      }

      return data.response
    } catch (error) {
      if (error instanceof AIClientServiceError) {
        throw error
      }

      if (error instanceof Error) {
        throw new AIClientServiceError(`AI generation failed: ${error.message}`, 'GENERATION_ERROR')
      }

      throw new AIClientServiceError('An unexpected error occurred during AI generation', 'UNKNOWN_ERROR')
    }
  }
}