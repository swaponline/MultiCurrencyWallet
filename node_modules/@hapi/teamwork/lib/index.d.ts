/**
 * Team bridges between callbacks and promises. Used to convert callback-based
 * interfaces to a promise-based result including support for collecting multiple
 * callback events into a single promise.
 */
export class Team<Results extends any | any[] = void> {
    /**
     * Start a new team work.
     *
     * @param options Configuration of the team work.
     */
    constructor(options?: Team.Options);

    /**
     * Resulting work when all the meetings are done.
     */
    work: Promise<Results>;

    /**
     * Attend a single meeting.
     *
     * @param note An optional note that will be included in the work's results. If an error is provided, the work will be immediately rejected with that error.
     */
    attend(note?: Error | Team.ElementOf<Results>): void;

    /**
     * Wait for the current work to be done and start another team work.
     *
     * @param options New configuration of the team work.
     *
     * @returns a promise that resolves when the current work is done.
     */
    regroup(options?: Team.Options) : Promise<void>;
}

export namespace Team {

    /**
     * Configuration of the team work.
     */
    export interface Options {
        /**
         * Number of meetings this team should attend before delivering work.
         *
         * @default 1
         */
        readonly meetings?: number;

        /**
         * Throws when the team attends more than the expected number of `meetings`.
         *
         * @default false
         */
        readonly strict?: boolean;
    }

    type ElementOf<T> = T extends (infer E)[] ? E : T;
}


/**
 * Events emitter via an async iterator interface.
 */
export class Events<T> {

    /**
     * Returns a standard async iterator interface object.
     *
     * @returns async iterator interface object.
     */
    iterator(): Events.Iterator<T>;

    /**
     * Emits an event to be consumed via the iterator.
     *
     * @param value
     */
    emit(value: T): void;

    /**
     * Informs the iterator that no new events will be emitted.
     */
    end(): void;
}

export namespace Events {

    class Iterator<T> implements AsyncIterator<T> {

        constructor(events: Events<T>);
        [Symbol.asyncIterator](): AsyncIterator<T>;
        next(): Promise<IteratorResult<T>>;
    }
}
