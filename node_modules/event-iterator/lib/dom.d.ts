import { EventIterator, EventIteratorOptions } from "./event-iterator";
export declare function subscribe(this: EventTarget, event: string, options?: AddEventListenerOptions, evOptions?: EventIteratorOptions): EventIterator<Event>;
export { EventIterator };
export default EventIterator;
