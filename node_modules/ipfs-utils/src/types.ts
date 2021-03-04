import type { RequestInit, Response } from 'electron-fetch'
interface ProgressStatus {
  total: number
  loaded: number
  lengthComputable: boolean
}

export interface ProgressFn { (status: ProgressStatus): void }

export interface FetchOptions extends RequestInit {
  /**
   * Amount of time until request should timeout in ms.
   */
  timeout?: number
  /**
   * URL search param.
   */
  searchParams?: URLSearchParams
  /**
   * Can be passed to track upload progress.
   * Note that if this option in passed underlying request will be performed using `XMLHttpRequest` and response will not be streamed.
   */
  onUploadProgress?: ProgressFn
  /**
   * Can be passed to track download progress.
   */
  onDownloadProgress?: ProgressFn
  overrideMimeType?: string
}

export interface HTTPOptions extends FetchOptions {
  json?: any
  /**
   * The base URL to use in case url is a relative URL
   */
  base? : string
  /**
   * Throw not ok responses as Errors
   */
  throwHttpErrors?: boolean
  /**
   * Transform search params
   */
  transformSearchParams?: (params: URLSearchParams) => URLSearchParams
  /**
   * When iterating the response body, transform each chunk with this function.
   */
  transform?: (chunk: any) => any
  /**
   * Handle errors
   */
  handleError?: (rsp: Response) => Promise<void>
}
