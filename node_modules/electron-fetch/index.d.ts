import { Readable, Stream } from 'stream'
import { Session } from 'electron'
import { Agent } from 'https'

export default fetch

declare function fetch (
  url: string,
  options?: RequestInit
): Promise<Response>

export class FetchError extends Error {}

export type HeadersInit = Headers | string[][] | { [key: string]: string }

export class Headers {
  constructor (init?: HeadersInit)

  append (name: string, value: string): void

  delete (name: string): void

  get (name: string): string | null

  has (name: string): boolean

  set (name: string, value: string): void

  // WebIDL pair iterator: iterable<ByteString, ByteString>
  entries (): IterableIterator<[string, string]>

  forEach (callback: (value: string, name: string, headers: Headers) => void, thisArg?: any): void

  keys (): IterableIterator<string>

  values (): IterableIterator<string>

  [Symbol.iterator] (): IterableIterator<[string, string]>
}

export type BodyInit = Stream | string | Blob | Buffer | null

export interface Body {
  readonly bodyUsed: boolean

  arrayBuffer (): Promise<ArrayBuffer>

  blob (): Promise<Blob>

  formData (): Promise<FormData>

  json<T = any> (): Promise<T>

  text (): Promise<string>

  buffer (): Promise<Buffer>
}

export class Response implements Body {
  constructor (body: BodyInit, init?: ResponseInit)

  readonly url: string
  readonly status: number
  readonly ok: boolean
  readonly statusText: string
  readonly headers: Headers
  readonly body: Readable | string

  clone (): Response

  // Body impl
  readonly bodyUsed: boolean

  arrayBuffer (): Promise<ArrayBuffer>

  blob (): Promise<Blob>

  formData (): Promise<FormData>

  json<T = any> (): Promise<T>

  text (): Promise<string>

  buffer (): Promise<Buffer>
}

export interface RequestInit {
  // These properties are part of the Fetch Standard
  method?: string
  headers?: HeadersInit
  body?: BodyInit
  signal?: AbortSignal
  // (/!\ only works when running on Node.js) set to `manual` to extract redirect headers, `error` to reject redirect
  redirect?: RequestRedirect

  ////////////////////////////////////////////////////////////////////////////
  // The following properties are electron-fetch extensions

  // (/!\ only works when running on Node.js) maximum redirect count. 0 to not follow redirect
  follow?: number
  // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies)
  timeout?: number
  // maximum response body size in bytes. 0 to disable
  size?: number
  session?: Session
  agent?: Agent,
  useElectronNet?: boolean
  useSessionCookies?: boolean
  // When running on Electron behind an authenticated HTTP proxy, username to use to authenticate
  user?: string
  // When running on Electron behind an authenticated HTTP proxy, password to use to authenticate
  password?: string
}

export type RequestInfo = Request | string

export class Request implements Body {
  constructor (input: RequestInfo, init?: RequestInit)

  readonly method: string
  readonly url: string
  readonly headers: Headers

  readonly redirect: RequestRedirect
  readonly signal: AbortSignal

  clone (): Request

  ////////////////////////////////////////////////////////////////////////////
  // The following properties are electron-fetch extensions

  // (/!\ only works when running on Node.js) maximum redirect count. 0 to not follow redirect
  follow: number
  // (/!\ only works when running on Node.js)
  counter: number
  // (/!\ only works when running on Electron)
  session?: Session
  // (/!\ only works when running on Electron, throws when set to true on Node.js)
  useElectronNet: boolean
  // (/!\ only works when running on Electron)
  useSessionCookies?: boolean

  ////////////////////////////////////////////////////////////////////////////
  // Body impl
  readonly bodyUsed: boolean

  arrayBuffer (): Promise<ArrayBuffer>

  blob (): Promise<Blob>

  formData (): Promise<FormData>

  json<T = any> (): Promise<T>

  text (): Promise<string>

  buffer (): Promise<Buffer>

  readonly body: Readable
}
