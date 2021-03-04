/**
 * Virtual type for an array in which each element represents 5 bits.
 */
export declare type FiveBitArray = Uint8Array;
// As TypeScript (unlike Flow) always uses structural typing for determining type compatibility,
// there seems to be no way to express this better.

export declare function to5BitArray(src: Uint8Array, dst?: FiveBitArray): FiveBitArray;
export declare function from5BitArray(src: FiveBitArray, dst?: Uint8Array): Uint8Array;
export declare function encode5BitArray(prefix: string, data: FiveBitArray): string;
export declare function decodeTo5BitArray(message: string): { prefix: string, data: FiveBitArray };

export declare function encode(prefix: string, data: Uint8Array): string;
export declare function decode(message: string): { prefix: string, data: Uint8Array };

export declare class BitcoinAddress {
  prefix: 'bc' | 'tb';
  scriptVersion: number;
  data: Uint8Array;

  static decode(message: string): BitcoinAddress;
  constructor(prefix: 'bc' | 'tb', scriptVersion: number, data: Uint8Array);
  encode(): string;
  type(): void | 'p2wsh' | 'p2wpkh';
}
