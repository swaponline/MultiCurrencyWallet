/// <reference types="node" />
import BufferList from 'bl';
export declare class FailedIKError extends Error {
    initialMsg: string | BufferList | Buffer;
    constructor(initialMsg: string | BufferList | Buffer, message?: string);
}
//# sourceMappingURL=errors.d.ts.map