export class VSSError extends Error {
  public code
  public requestId
  constructor(code: string | number, message: string, requestId?: string) {
    super(message)
    this.code = code
    this.requestId = requestId
  }
}
