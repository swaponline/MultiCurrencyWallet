import { Readable as NodeReadableStream } from 'stream'

export default function fetch (input: RequestInfo, init?: RequestInit): Promise<Response>

export interface Body {
  readonly body: NodeReadableStream | ReadableStream<Uint8Array> | null
  readonly bodyUsed: boolean
  arrayBuffer: () => Promise<ArrayBuffer>
  blob: () => Promise<Blob>
  formData: () => Promise<FormData>
  json: () => Promise<any>
  text: () => Promise<string>
  buffer: () => Promise<Buffer>
}
export class Headers extends globalThis.Headers {}

/** This Fetch API interface represents the response to a request. */
export class Response extends globalThis.Response {
  constructor (body?: BodyInit | null, init?: ResponseInit)
  readonly headers: Headers
  readonly ok: boolean
  readonly redirected: boolean
  readonly status: number
  readonly statusText: string
  readonly trailer: Promise<Headers>
  readonly type: ResponseType
  readonly url: string
  clone: () => Response

  // Body interface
  readonly body: NodeReadableStream | ReadableStream<Uint8Array> | null
  readonly bodyUsed: boolean
  arrayBuffer: () => Promise<ArrayBuffer>
  blob: () => Promise<Blob>
  formData: () => Promise<FormData>
  json: () => Promise<any>
  text: () => Promise<string>
  buffer: () => Promise<Buffer>
  iterator: () => AsyncIterable<Uint8Array>
  ndjson: () => AsyncIterable<any>

  static error (): Response
  static redirect (url: string, status?: number): Response
}

export class Request extends globalThis.Request {
  constructor (input: RequestInfo, init?: RequestInit)

  // Body interface
  readonly body: NodeReadableStream | ReadableStream<Uint8Array> | null
  readonly bodyUsed: boolean
  arrayBuffer: () => Promise<ArrayBuffer>
  blob: () => Promise<Blob>
  formData: () => Promise<FormData>
  json: () => Promise<any>
  text: () => Promise<string>
  buffer: () => Promise<Buffer>
}

export type RequestInfo = Request | string

export type BodyInit = Blob | BufferSource | FormData | URLSearchParams | ReadableStream<Uint8Array> | string | Buffer | NodeReadableStream

export interface RequestInit {
  /**
   * A BodyInit object or null to set request's body.
   */
  body?: BodyInit | null
  /**
   * A string indicating how the request will interact with the browser's cache to set request's cache.
   */
  cache?: RequestCache
  /**
   * A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials.
   */
  credentials?: RequestCredentials
  /**
   * A Headers object, an object literal, or an array of two-item arrays to set request's headers.
   */
  headers?: HeadersInit
  /**
   * A cryptographic hash of the resource to be fetched by request. Sets request's integrity.
   */
  integrity?: string
  /**
   * A boolean to set request's keepalive.
   */
  keepalive?: boolean
  /**
   * A string to set request's method.
   */
  method?: string
  /**
   * A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode.
   */
  mode?: RequestMode
  /**
   * A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect.
   */
  redirect?: RequestRedirect
  /**
   * A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer.
   */
  referrer?: string
  /**
   * A referrer policy to set request's referrerPolicy.
   */
  referrerPolicy?: ReferrerPolicy
  /**
   * An AbortSignal to set request's signal.
   */
  signal?: AbortSignal | null
  /**
   * Can only be null. Used to disassociate request from any Window.
   */
  window?: any
}
