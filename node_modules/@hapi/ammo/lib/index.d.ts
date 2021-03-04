/// <reference types="node" />

import * as Stream from 'stream';


/**
 * Parses an HTTP Range header.
 * 
 * @param header - the HTTP Range header.
 * @param length - the payload length.
 * 
 * @returns an array of range objects.
 */
export function header(header: string, length: number): null | Range[];


/**
 * A transform stream taking full payload and returning the requested range.
 */
export class Clip extends Stream.Transform {

    /**
     * Constructs a new transform steam.
     * 
     * @param range - the requested range.
     */
    constructor(range: Range);
}


export interface Range {
    /**
     * The range start position (inclusive).
     */
    readonly from: number;

    /**
     * The range end position (inclusive).
     */
    readonly to: number;
}
