import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { EventService } from './event.service'
import { ZepService } from './zep.service'
import { MessageService } from './message.service'
import { AIService } from './ai.service'

export class ServiceRegistry {
  private static instance: ServiceRegistry
  private _eventService: EventService
  private _zepService: ZepService | null = null
  private _messageService: MessageService | null = null
  private _aiService: AIService | null = null

  private constructor() {
    this._eventService = new EventService()
    this._initializeZepService()
  }

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry()
    }
    return ServiceRegistry.instance
  }

  private _initializeZepService(): void {
    try {
      const zepApiKey = process.env.ZEP_API_KEY
      if (zepApiKey) {
        this._zepService = new ZepService(zepApiKey, this._eventService)
      }
    } catch (error) {
      console.error('Failed to initialize ZepService:', error)
      this._zepService = null
    }
  }

  getEventService(): EventService {
    return this._eventService
  }

  getMessageService(supabase: SupabaseClient<Database>): MessageService {
    if (!this._messageService) {
      this._messageService = new MessageService(supabase, this._eventService)
    }
    return this._messageService
  }

  getAIService(): AIService {
    if (!this._aiService) {
      const openaiApiKey = process.env.OPENAI_API_KEY
      if (!openaiApiKey) {
        throw new Error('OpenAI API key is required')
      }
      this._aiService = new AIService(openaiApiKey, this._eventService)
    }
    return this._aiService
  }
}