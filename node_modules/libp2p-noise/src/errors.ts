import BufferList from 'bl'

export class FailedIKError extends Error {
  public initialMsg: string|BufferList|Buffer

  constructor (initialMsg: string|BufferList|Buffer, message?: string) {
    super(message)

    this.initialMsg = initialMsg
    this.name = 'FailedIKhandshake'
  }
}
