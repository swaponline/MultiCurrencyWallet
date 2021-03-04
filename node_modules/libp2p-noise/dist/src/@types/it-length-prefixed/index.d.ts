declare module 'it-length-prefixed' {
  import BufferList from 'bl'
  import { Buffer } from 'buffer'

  interface LengthDecoderFunction {
    (data: Buffer | BufferList): number
    bytes: number
  }

  interface LengthEncoderFunction {
    (value: number, target: Buffer, offset: number): number|Buffer
    bytes: number
  }

  interface Encoder {
    (options?: Partial<{lengthEncoder: LengthEncoderFunction}>): AsyncGenerator<BufferList, Buffer>
    single: (chunk: Buffer, options?: Partial<{lengthEncoder: LengthEncoderFunction}>) => BufferList
    MIN_POOL_SIZE: number
    DEFAULT_POOL_SIZE: number
  }

  interface DecoderOptions {
    lengthDecoder: LengthDecoderFunction
    maxLengthLength: number
    maxDataLength: number
  }

  interface Decoder {
    (options?: Partial<DecoderOptions>): AsyncGenerator<BufferList, BufferList>
    fromReader: (reader: any, options?: Partial<DecoderOptions>) => BufferList
    MAX_LENGTH_LENGTH: number
    MAX_DATA_LENGTH: number
  }

  export const encode: Encoder
  export const decode: Decoder

}
