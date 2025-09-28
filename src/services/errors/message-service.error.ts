export class MessageServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = 'MessageServiceError'
  }
}