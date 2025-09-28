import { MessageCreatedEvent } from './message-created-event.interface'
import { AIContextRequestedEvent } from './ai-context-requested-event.interface'
import { ContextRetrievedEvent } from './context-retrieved-event.interface'

export interface EventPayload {
  MESSAGE_CREATED: MessageCreatedEvent
  AI_CONTEXT_REQUESTED: AIContextRequestedEvent
  CONTEXT_RETRIEVED: ContextRetrievedEvent
}