/// <reference types="node" />

import BufferList = require("bl");

interface LengthDecoderFunction {
    (data: Buffer | BufferList): number;
    bytes: number;
}

interface LengthEncoderFunction {
    (value: number, target: Buffer, offset: number): number|Buffer;
    bytes: number;
}

interface Encoder {
    (options?: Partial<{lengthEncoder: LengthEncoderFunction}>): AsyncGenerator<BufferList|Buffer, BufferList>;
    single: (chunk: Buffer|BufferList, options?: Partial<{lengthEncoder: LengthEncoderFunction}>) => BufferList;
    MIN_POOL_SIZE: number;
    DEFAULT_POOL_SIZE: number;
}

interface DecoderOptions<T = BufferList> {
    lengthDecoder: LengthDecoderFunction;
    onData: (data: BufferList|Buffer) => T;
    maxLengthLength: number;
    maxDataLength: number;
}

interface Decoder {
    (options?: Partial<DecoderOptions>): AsyncGenerator<BufferList|Buffer, BufferList>;
    fromReader: (reader: AsyncIterator<Buffer>, options?: Partial<DecoderOptions>) => AsyncGenerator<BufferList|Buffer, BufferList>;
    MAX_LENGTH_LENGTH: number;
    MAX_DATA_LENGTH: number;
}

export const encode: Encoder
export const decode: Decoder

export const varintEncode: LengthEncoderFunction;
export const varintDecode: LengthDecoderFunction;

export const int32BEEncode: LengthEncoderFunction;
export const int32BEDecode: LengthDecoderFunction;
