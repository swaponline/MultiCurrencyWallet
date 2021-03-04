export class AbortError extends Error {
  constructor (message?: string, code?: string)
  type: 'aborted'
  code: string
}

type Options<T> = {
  onAbort?: (source: Source<T>) => void
  abortMessage?: string
  abortCode?: string
  returnOnAbort?: boolean
}

type Signals<T> = {
  signal: AbortSignal,
  options?: Options<T>
}[]

type Source<T> = AsyncIterable<T> | Iterable<T>
type Sink<TSource, TReturn = void> = (source: Source<TSource>) => TReturn
type Transform<TSourceIn, TSourceOut> = (source: Source<TSourceIn>) => Source<TSourceOut>
type Duplex<TSource, TSinkSource, TSinkReturn = void> = { sink: Sink<TSinkSource, TSinkReturn>, source: Source<TSource> }

declare function source<T> (
  source: Source<T>,
  signal?: AbortSignal,
  options?: Options<T>
): AsyncIterable<T>

declare function source<T> (
  source: Source<T>,
  signals: Signals<T>
): AsyncIterable<T>

declare function sink<TSource, TReturn = void> (
  sink: Sink<TSource, TReturn>,
  signal?: AbortSignal,
  options?: Options<TSource>
): Sink<TSource, TReturn>

declare function sink<TSource, TReturn = void> (
  sink: Sink<TSource, TReturn>,
  signals: Signals<TSource>
): Sink<TSource, TReturn>

declare function transform<TSourceIn, TSourceOut> (
  transform: Transform<TSourceIn, TSourceOut>,
  signal?: AbortSignal,
  options?: Options<TSourceIn>
): Transform<TSourceIn, TSourceOut>

declare function transform<TSourceIn, TSourceOut> (
  transform: Transform<TSourceIn, TSourceOut>,
  signals: Signals<TSourceIn>
): Transform<TSourceIn, TSourceOut>

declare function duplex<TSource, TSinkSource, TSinkReturn = void> (
  duplex: Duplex<TSource, TSinkSource, TSinkReturn>,
  signal?: AbortSignal,
  options?: Options<TSource>
): Duplex<TSource, TSinkSource, TSinkReturn>

declare function duplex<TSource, TSinkSource, TSinkReturn = void> (
  duplex: Duplex<TSource, TSinkSource, TSinkReturn>,
  signals: Signals<TSource>
): Duplex<TSource, TSinkSource, TSinkReturn>

export { source, sink, transform, duplex }
export default source
