import { EventPayload } from './event-payload.interface'
import { EventType } from './event-type.type'

export type EventListener<T extends EventType> = (payload: EventPayload[T]) => void | Promise<void>