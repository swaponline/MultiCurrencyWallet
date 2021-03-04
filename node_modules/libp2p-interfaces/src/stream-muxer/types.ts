import BufferList from 'bl'

export interface MuxerFactory {
  new (options: MuxerOptions): Muxer;
  multicodec: string;
}

/**
 * A libp2p stream muxer
 */
export interface Muxer {
  readonly streams: Array<MuxedStream>;
  /**
   * Initiate a new stream with the given name. If no name is
   * provided, the id of th stream will be used.
   */
  newStream (name?: string): MuxedStream;

  /**
   * A function called when receiving a new stream from the remote.
   */
  onStream (stream: MuxedStream): void;

  /**
   * A function called when a stream ends.
   */
  onStreamEnd (stream: MuxedStream): void;
}

export type MuxerOptions = {
  onStream: (stream: MuxedStream) => void;
  onStreamEnd: (stream: MuxedStream) => void;
  maxMsgSize?: number;
}

export type MuxedTimeline = {
  open: number;
  close?: number;
}

export interface MuxedStream extends AsyncIterable<Uint8Array | BufferList> {
  close: () => void;
  abort: () => void;
  reset: () => void;
  sink: Sink;
  source: () => AsyncIterable<Uint8Array | BufferList>;
  timeline: MuxedTimeline;
  id: string;
}

export type Sink = (source: Uint8Array) => Promise<Uint8Array>;
