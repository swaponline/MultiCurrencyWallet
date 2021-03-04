import { Buffer } from 'buffer';
import { bytes } from './@types/basic';
import { MessageBuffer } from './@types/handshake';
import BufferList from 'bl';
export declare const uint16BEEncode: {
    (value: number, target: Buffer, offset: number): Buffer;
    bytes: number;
};
export declare const uint16BEDecode: {
    (data: Buffer | BufferList): number;
    bytes: number;
};
export declare function encode0(message: MessageBuffer): bytes;
export declare function encode1(message: MessageBuffer): bytes;
export declare function encode2(message: MessageBuffer): bytes;
export declare function decode0(input: bytes): MessageBuffer;
export declare function decode1(input: bytes): MessageBuffer;
export declare function decode2(input: bytes): MessageBuffer;
//# sourceMappingURL=encoder.d.ts.map