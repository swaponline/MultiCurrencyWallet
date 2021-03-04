declare module 'it-pair' {
  export type Duplex = [Stream, Stream]

  interface Stream {
    sink: (source: Iterable<any>) => void
    source: Record<string, any>
  }
}
