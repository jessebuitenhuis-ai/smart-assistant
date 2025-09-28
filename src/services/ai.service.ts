import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { Database } from '@/types/supabase'
import { AIServiceError } from './errors/ai-service.error'
import { EventService } from './event.service'

type Message = Database['public']['Tables']['messages']['Row']

export class AIService {
  private _chatModel: ChatOpenAI

  constructor(apiKey: string, private _eventService: EventService) {
    if (!apiKey) {
      throw new AIServiceError('OpenAI API key is required', 'MISSING_API_KEY')
    }

    this._chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    })
  }

  private _formatMessagesForLangChain(messages: Message[], systemPrompt: string = '') {
    const langChainMessages = []

    if (systemPrompt) {
      langChainMessages.push(new SystemMessage(systemPrompt))
    }

    for (const message of messages) {
      if (message.role === 'user') {
        langChainMessages.push(new HumanMessage(message.content))
      } else if (message.role === 'assistant') {
        langChainMessages.push(new AIMessage(message.content))
      }
    }

    return langChainMessages
  }

  private async _getContext(threadId: string, messages: Message[], userId?: string): Promise<string> {
    if (!userId) {
      return ''
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(''), 2000)

      const handleContextRetrieved = (payload: { context: string; threadId: string }) => {
        if (payload.threadId === threadId) {
          clearTimeout(timeout)
          this._eventService.off('CONTEXT_RETRIEVED', handleContextRetrieved)
          resolve(payload.context)
        }
      }

      this._eventService.on('CONTEXT_RETRIEVED', handleContextRetrieved)
      this._eventService.emit('AI_CONTEXT_REQUESTED', { threadId, userId, messages })
    })
  }

  async generateResponse(
    messages: Message[],
    threadId: string,
    userId?: string,
    systemPrompt: string = 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.'
  ): Promise<string> {
    try {
      const context = await this._getContext(threadId, messages, userId)
      const enhancedSystemPrompt = context ? `${systemPrompt}\n\n${context}` : systemPrompt

      const formattedMessages = this._formatMessagesForLangChain(messages, enhancedSystemPrompt)

      const response = await this._chatModel.invoke(formattedMessages)

      if (!response.content) {
        throw new AIServiceError('Empty response from AI model', 'EMPTY_RESPONSE')
      }

      return response.content.toString()
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error
      }

      if (error instanceof Error) {
        throw new AIServiceError(`AI generation failed: ${error.message}`, 'GENERATION_ERROR')
      }

      throw new AIServiceError('An unexpected error occurred during AI generation', 'UNKNOWN_ERROR')
    }
  }

  async generateResponseStream(
    messages: Message[],
    threadId: string,
    userId?: string,
    systemPrompt: string = 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.',
    onToken?: (token: string) => void
  ): Promise<string> {
    try {
      const context = await this._getContext(threadId, messages, userId)
      const enhancedSystemPrompt = context ? `${systemPrompt}\n\n${context}` : systemPrompt

      const formattedMessages = this._formatMessagesForLangChain(messages, enhancedSystemPrompt)

      const response = await this._chatModel.stream(formattedMessages)
      let fullResponse = ''

      for await (const chunk of response) {
        const token = chunk.content?.toString() || ''
        fullResponse += token
        if (onToken) {
          onToken(token)
        }
      }

      if (!fullResponse) {
        throw new AIServiceError('Empty response from AI model', 'EMPTY_RESPONSE')
      }

      return fullResponse
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error
      }

      if (error instanceof Error) {
        throw new AIServiceError(`AI generation failed: ${error.message}`, 'GENERATION_ERROR')
      }

      throw new AIServiceError('An unexpected error occurred during AI generation', 'UNKNOWN_ERROR')
    }
  }
}