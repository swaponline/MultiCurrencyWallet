/// <reference types="node" />
import { Readable } from "stream";
import { EventIterator, EventIteratorOptions } from "./event-iterator";
export declare function stream(this: Readable, evOptions?: EventIteratorOptions): EventIterator<Buffer>;
export { EventIterator };
export default EventIterator;
