import { ZepClient } from '@getzep/zep-cloud'
import { EventService } from './event.service'
import { ZepServiceError } from './errors/zep-service.error'
import { MessageCreatedEvent } from '@/types/events/message-created-event.interface'
import { AIContextRequestedEvent } from '@/types/events/ai-context-requested-event.interface'

export class ZepService {
  private _client: ZepClient

  constructor(apiKey: string, private _eventService: EventService) {
    if (!apiKey) {
      throw new ZepServiceError('Zep API key is required', 'MISSING_API_KEY')
    }

    this._client = new ZepClient({ apiKey })
    this._setupEventListeners()
  }

  private _setupEventListeners(): void {
    this._eventService.on('MESSAGE_CREATED', this._handleMessageCreated.bind(this))
    this._eventService.on('AI_CONTEXT_REQUESTED', this._handleContextRequested.bind(this))
  }

  private async _handleMessageCreated(payload: MessageCreatedEvent): Promise<void> {
    try {
      await this._addMessageToGraph(payload)
    } catch (error) {
      console.error('Failed to add message to Zep knowledge graph:', error)
    }
  }

  private async _handleContextRequested(payload: AIContextRequestedEvent): Promise<void> {
    try {
      const context = await this._getUserContext(payload.threadId, payload.userId)
      await this._eventService.emit('CONTEXT_RETRIEVED', {
        context,
        threadId: payload.threadId
      })
    } catch (error) {
      console.error('Failed to retrieve context from Zep:', error)
      await this._eventService.emit('CONTEXT_RETRIEVED', {
        context: '',
        threadId: payload.threadId
      })
    }
  }

  private async _addMessageToGraph(payload: MessageCreatedEvent): Promise<void> {
    try {
      if (!payload.userId) {
        return
      }

      await this._ensureThreadExists(payload.threadId, payload.userId)

      await this._client.thread.addMessages(payload.threadId, {
        messages: [{
          content: payload.message.content,
          role: payload.message.role === 'user' ? 'user' : 'assistant'
        }]
      })
    } catch (error) {
      if (error instanceof Error) {
        throw new ZepServiceError(`Failed to add message to knowledge graph: ${error.message}`, 'ADD_MESSAGE_ERROR', error)
      }
      throw new ZepServiceError('An unexpected error occurred while adding message to knowledge graph', 'UNKNOWN_ERROR')
    }
  }

  private async _ensureThreadExists(threadId: string, userId: string): Promise<void> {
    try {
      await this._client.thread.create({
        threadId: threadId,
        userId: userId
      })
    } catch (error: unknown) {
      const typedError = error as { statusCode?: number, status?: number, response?: { status?: number } }
      const statusCode = typedError?.statusCode || typedError?.status || typedError?.response?.status

      if (statusCode === 409 || statusCode === 400) {
        // Thread already exists, this is fine
        return
      }

      throw new ZepServiceError(`Failed to create thread: ${error}`, 'CREATE_THREAD_ERROR', error as Error)
    }
  }


  private async _getUserContext(threadId: string, userId?: string): Promise<string> {
    try {
      if (!userId) {
        return ''
      }

      const memory = await this._client.thread.getUserContext(threadId, { mode: 'basic' })
      return memory.context || ''
    } catch (error) {
      if (error instanceof Error) {
        throw new ZepServiceError(`Failed to get user context: ${error.message}`, 'GET_CONTEXT_ERROR', error)
      }
      throw new ZepServiceError('An unexpected error occurred while getting user context', 'UNKNOWN_ERROR')
    }
  }
}