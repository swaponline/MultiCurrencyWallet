import BufferList = require("bl");
import {Buffer} from "buffer";

type WrappedDuplex = {
    read(bytes?: number): Promise<BufferList>;
    readLP(): Promise<BufferList>;
    readPB<T>(proto: {decode: (data: Buffer) => T}): Promise<T>;
    write(input: BufferList): void;
    writeLP(input: Buffer | BufferList): void;
    writePB(data: Buffer | BufferList, proto: {encode: (data: any) => Buffer}): void;

    pb<Return>(proto: {encode: (data: any) => Buffer, decode: (data: Buffer) => Return}): {read: () => Return, write: (d: Buffer) => void}
    //return vanilla duplex
    unwrap(): any;
}

declare interface LengthDecoderFunction {
    (data: Buffer | BufferList): number;
    bytes: number;
}

declare interface LengthEncoderFunction {
    (value: number, target: Buffer, offset: number): number|Buffer;
    bytes: number;
}

interface Opts {
    //encoding opts
    poolSize: number;
    minPoolSize: number;
    lengthEncoder: LengthEncoderFunction;

    //decoding opts
    lengthDecoder: LengthDecoderFunction;
    maxLengthLength: number;
    maxDataLength: number;
}

declare function Wrap (duplex: any, opts?: Partial<Opts>): WrappedDuplex;

export = Wrap;
