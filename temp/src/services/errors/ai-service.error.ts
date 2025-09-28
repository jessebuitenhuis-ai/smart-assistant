export class AIServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = 'AIServiceError'
  }
}