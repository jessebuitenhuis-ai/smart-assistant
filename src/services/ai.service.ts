import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

export class AIServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = 'AIServiceError'
  }
}

export class AIService {
  private chatModel: ChatOpenAI

  constructor(apiKey?: string) {
    if (!apiKey) {
      throw new AIServiceError('OpenAI API key is required', 'MISSING_API_KEY')
    }

    this.chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    })
  }

  private formatMessagesForLangChain(messages: Message[], systemPrompt: string = '') {
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

  async generateResponse(
    messages: Message[],
    systemPrompt: string = 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.'
  ): Promise<string> {
    try {
      const formattedMessages = this.formatMessagesForLangChain(messages, systemPrompt)

      const response = await this.chatModel.invoke(formattedMessages)

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
    systemPrompt: string = 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.',
    onToken?: (token: string) => void
  ): Promise<string> {
    try {
      const formattedMessages = this.formatMessagesForLangChain(messages, systemPrompt)

      const response = await this.chatModel.stream(formattedMessages)
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