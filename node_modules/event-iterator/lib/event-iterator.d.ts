export declare type QueueEvent = keyof EventHandlers;
export declare type RemoveHandler = () => void;
export declare type ListenHandler<T> = (queue: Queue<T>) => void | RemoveHandler;
export interface EventIteratorOptions {
    highWaterMark: number | undefined;
    lowWaterMark: number | undefined;
}
export interface Queue<T> {
    push(value: T): void;
    stop(): void;
    fail(error: Error): void;
    on<E extends QueueEvent>(event: E, fn: EventHandlers[E]): void;
}
interface EventHandlers {
    highWater(): void;
    lowWater(): void;
}
export declare class EventIterator<T> implements AsyncIterable<T> {
    [Symbol.asyncIterator]: () => AsyncIterator<T>;
    constructor(listen: ListenHandler<T>, { highWaterMark, lowWaterMark }?: Partial<EventIteratorOptions>);
}
export default EventIterator;
