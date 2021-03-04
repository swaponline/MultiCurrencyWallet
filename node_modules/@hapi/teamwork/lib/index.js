'use strict';

const internals = {};


exports.Team = class {

    #meetings = null;
    #count = null;
    #notes = null;
    #done = false;
    #strict = false;

    constructor(options) {

        this._init(options);
    }

    _init(options = {}) {

        this.work = new Promise((resolve, reject) => {

            this._resolve = resolve;
            this._reject = reject;
        });

        const meetings = options.meetings || 1;
        this.#meetings = meetings;
        this.#count = meetings;
        this.#notes = [];
        this.#done = false;
        this.#strict = options.strict;
    }

    attend(note) {

        if (this.#strict && this.#done) {
            throw new Error('Unscheduled meeting');
        }

        if (note instanceof Error) {
            this.#done = true;
            return this._reject(note);
        }

        this.#notes.push(note);

        if (--this.#count) {
            return;
        }

        this.#done = true;
        return this._resolve(this.#meetings === 1 ? this.#notes[0] : this.#notes);
    }

    async regroup(options) {

        await this.work;

        this._init(options);
    }
};


exports.Events = class {

    #pending = null;
    #queue = [];

    static isIterator(iterator) {

        return iterator instanceof internals.EventsIterator;
    }

    iterator() {

        return new internals.EventsIterator(this);
    }

    emit(value) {

        this._queue({ value, done: false });
    }

    end() {

        this._queue({ done: true });
    }

    _next() {

        if (this.#queue.length) {
            return Promise.resolve(this.#queue.shift());
        }

        this.#pending = new exports.Team();
        return this.#pending.work;
    }

    _queue(item) {

        if (this.#pending) {
            this.#pending.attend(item);
            this.#pending = null;
        }
        else {
            this.#queue.push(item);
        }
    }
};


internals.EventsIterator = class {

    #events = null;

    constructor(events) {

        this.#events = events;
    }

    [Symbol.asyncIterator]() {

        return this;
    }

    next() {

        return this.#events._next();
    }
};
