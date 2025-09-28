import { ZepClient } from '@getzep/zep-cloud'
import { EventService } from './event.service'
import { ZepServiceError } from './errors/zep-service.error'
import { MessageCreatedEvent } from '@/types/events/message-created-event.interface'
import { AIContextRequestedEvent } from '@/types/events/ai-context-requested-event.interface'

export class ZepService {
  private _client: ZepClient

  constructor(apiKey: string, private _eventService: EventService) {
    console.log('ZepService: Constructor called with API key length:', apiKey.length)
    if (!apiKey) {
      throw new ZepServiceError('Zep API key is required', 'MISSING_API_KEY')
    }

    this._client = new ZepClient({ apiKey })
    console.log('ZepService: ZepClient created successfully')
    this._setupEventListeners()
    console.log('ZepService: Event listeners setup completed')
  }

  private _setupEventListeners(): void {
    this._eventService.on('MESSAGE_CREATED', this._handleMessageCreated.bind(this))
    this._eventService.on('AI_CONTEXT_REQUESTED', this._handleContextRequested.bind(this))
  }

  private async _handleMessageCreated(payload: MessageCreatedEvent): Promise<void> {
    console.log('ZepService: Received MESSAGE_CREATED event:', payload)
    try {
      await this._addMessageToGraph(payload)
      console.log('ZepService: Successfully processed MESSAGE_CREATED event')
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
    console.log('ZepService: Adding message to graph for user:', payload.userId)
    try {
      if (!payload.userId) {
        console.log('ZepService: No userId provided, skipping Zep ingestion')
        return
      }

      // First, ensure the thread exists in Zep
      await this._ensureThreadExists(payload.threadId, payload.userId)

      const zepMessage = {
        content: payload.message.content,
        role: payload.message.role === 'user' ? 'user' : 'assistant'
      } as any

      console.log('ZepService: Calling Zep API with:', {
        threadId: payload.threadId,
        message: zepMessage
      })

      try {
        await this._client.thread.addMessages(payload.threadId, {
          messages: [zepMessage]
        })
        console.log('ZepService: Successfully added message to Zep knowledge graph')
      } catch (addError: any) {
        if (addError?.statusCode === 404) {
          console.log('ZepService: Thread not found during addMessages, forcing recreation')
          // Force recreate the thread
          try {
            await this._client.thread.create({
              threadId: payload.threadId,
              userId: payload.userId
            })
            console.log('ZepService: Thread recreated, retrying addMessages')
            await this._client.thread.addMessages(payload.threadId, {
              messages: [zepMessage]
            })
            console.log('ZepService: Successfully added message to Zep knowledge graph after recreation')
          } catch (retryError) {
            console.error('ZepService: Failed to recreate thread or add message:', retryError)
            throw retryError
          }
        } else {
          throw addError
        }
      }
    } catch (error) {
      console.error('ZepService: Error details:', error)
      if (error instanceof Error) {
        throw new ZepServiceError(`Failed to add message to knowledge graph: ${error.message}`, 'ADD_MESSAGE_ERROR', error)
      }
      throw new ZepServiceError('An unexpected error occurred while adding message to knowledge graph', 'UNKNOWN_ERROR')
    }
  }

  private async _ensureThreadExists(threadId: string, userId: string): Promise<void> {
    try {
      // First ensure the user exists
      await this._ensureUserExists(userId)

      console.log('ZepService: Checking if thread exists:', threadId)
      await this._client.thread.get(threadId)
      console.log('ZepService: Thread already exists')
    } catch (error: any) {
      if (error?.statusCode === 404) {
        console.log('ZepService: Thread not found, creating new thread:', threadId)
        try {
          await this._client.thread.create({
            threadId: threadId,
            userId: userId
          })
          console.log('ZepService: Thread created successfully')
        } catch (createError) {
          console.error('ZepService: Failed to create thread:', createError)
          throw new ZepServiceError(`Failed to create thread: ${createError}`, 'CREATE_THREAD_ERROR', createError as Error)
        }
      } else {
        console.error('ZepService: Error checking thread existence:', error)
        throw new ZepServiceError(`Failed to check thread existence: ${error}`, 'CHECK_THREAD_ERROR', error as Error)
      }
    }
  }

  private async _ensureUserExists(userId: string): Promise<void> {
    try {
      console.log('ZepService: Checking if user exists:', userId)
      await this._client.user.get(userId)
      console.log('ZepService: User already exists')
    } catch (error: any) {
      if (error?.statusCode === 404) {
        console.log('ZepService: User not found, creating new user:', userId)
        try {
          await this._client.user.add({
            userId: userId
          })
          console.log('ZepService: User created successfully')
        } catch (createError) {
          console.error('ZepService: Failed to create user:', createError)
          throw new ZepServiceError(`Failed to create user: ${createError}`, 'CREATE_USER_ERROR', createError as Error)
        }
      } else {
        console.error('ZepService: Error checking user existence:', error)
        throw new ZepServiceError(`Failed to check user existence: ${error}`, 'CHECK_USER_ERROR', error as Error)
      }
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