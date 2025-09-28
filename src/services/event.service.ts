import { EventPayload } from '@/types/events/event-payload.interface'
import { EventType } from '@/types/events/event-type.type'
import { EventListener } from '@/types/events/event-listener.type'

export class EventService {
  private _listeners: Map<EventType, EventListener<EventType>[]> = new Map()

  on<T extends EventType>(event: T, listener: EventListener<T>): void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, [])
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._listeners.get(event)!.push(listener as any)
  }

  off<T extends EventType>(event: T, listener: EventListener<T>): void {
    const eventListeners = this._listeners.get(event)
    if (eventListeners) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const index = eventListeners.indexOf(listener as any)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  async emit<T extends EventType>(event: T, payload: EventPayload[T]): Promise<void> {
    const eventListeners = this._listeners.get(event)
    if (eventListeners) {
      const promises = eventListeners.map(listener => listener(payload))
      await Promise.all(promises)
    }
  }

  removeAllListeners(event?: EventType): void {
    if (event) {
      this._listeners.delete(event)
    } else {
      this._listeners.clear()
    }
  }
}