'use strict';

const Boom = require('@hapi/boom');
const Hoek = require('@hapi/hoek');


const internals = {
    maxTimer: 2147483647,   // 2 ^ 31 - 1
    entrySize: 144          // Approximate cache entry size without value: 144 bytes
};


internals.defaults = {
    maxByteSize: 100 * 1024 * 1024,          // 100MB
    minCleanupIntervalMsec: 1000,
    cloneBuffersOnGet: false
};


exports = module.exports = internals.Connection = class {

    constructor(options = {}) {

        Hoek.assert(this.constructor === internals.Connection, 'Memory cache client must be instantiated using new');
        Hoek.assert(options.maxByteSize === undefined || options.maxByteSize >= 0, 'Invalid cache maxByteSize value');
        Hoek.assert(options.allowMixedContent === undefined, 'allowMixedContent no longer supported');
        Hoek.assert(options.minCleanupIntervalMsec === undefined || options.minCleanupIntervalMsec < internals.maxTimer, 'Invalid cache minCleanupIntervalMsec value');
        Hoek.assert(options.cloneBuffersOnGet === undefined || typeof options.cloneBuffersOnGet === 'boolean', 'Invalid cloneBuffersOnGet value');

        this.settings = Hoek.applyToDefaults(internals.defaults, options);
        this.cache = null;

        this._timer = null;
        this._timerDue = null;
    }

    start() {

        if (!this.cache) {
            this.cache = new Map();
            this.byteSize = 0;
        }
    }

    _scheduleCleanup(msec) {

        const cleanup = () => {

            this._timer = null;
            this._timerDue = null;

            const now = Date.now();
            let next = Infinity;
            for (const [, segment] of this.cache) {
                for (const [id, envelope] of segment) {
                    const ttl = envelope.stored + envelope.ttl - now;
                    if (ttl <= 0) {
                        segment.delete(id);
                        this.byteSize -= envelope.byteSize;
                    }
                    else {
                        next = Math.min(next, ttl);
                    }
                }
            }

            if (next !== Infinity) {
                this._scheduleCleanup(next);
            }
        };

        const now = Date.now();
        const timeout = Math.min(Math.max(this.settings.minCleanupIntervalMsec, msec), internals.maxTimer);
        if (this._timer) {
            if (this._timerDue - now < msec) {
                return;
            }

            clearTimeout(this._timer);
        }

        this._timerDue = now + timeout;
        this._timer = setTimeout(cleanup, timeout);
    }

    stop() {

        clearTimeout(this._timer);
        this._timer = null;
        this._timerDue = null;

        this.cache = null;
        this.byteSize = 0;
    }

    isReady() {

        return !!this.cache;
    }

    validateSegmentName(name) {

        if (!name) {
            throw new Boom.Boom('Empty string');
        }

        if (name.indexOf('\u0000') !== -1) {
            throw new Boom.Boom('Includes null character');
        }

        return null;
    }

    get(key) {

        if (!this.cache) {
            throw new Boom.Boom('Connection not started');
        }

        const segment = this.cache.get(key.segment);
        if (!segment) {
            return null;
        }

        const envelope = segment.get(key.id);
        if (!envelope) {
            return null;
        }

        if (envelope.stored + envelope.ttl < Date.now()) {
            this.drop(key);
            return null;
        }

        let item = null;
        if (Buffer.isBuffer(envelope.item)) {
            item = envelope.item;
            if (this.settings.cloneBuffersOnGet) {
                const copy = Buffer.alloc(item.length);
                item.copy(copy);
                item = copy;
            }
        }
        else {
            try {
                item = JSON.parse(envelope.item);
            }
            catch (err) {
                throw new Boom.Boom('Bad value content');
            }
        }

        const result = {
            item,
            stored: envelope.stored,
            ttl: envelope.ttl
        };

        return result;
    }

    set(key, value, ttl) {

        if (!this.cache) {
            throw new Boom.Boom('Connection not started');
        }

        const envelope = new internals.MemoryCacheEntry(key, value, ttl);

        let segment = this.cache.get(key.segment);
        if (!segment) {
            segment = new Map();
            this.cache.set(key.segment, segment);
        }

        const cachedItem = segment.get(key.id);
        if (cachedItem) {
            this.byteSize -= cachedItem.byteSize;       // If the item existed, decrement the byteSize as the value could be different
        }

        if (this.settings.maxByteSize &&
            (this.byteSize + envelope.byteSize > this.settings.maxByteSize)) {

            throw new Boom.Boom('Cache size limit reached');
        }

        this._scheduleCleanup(ttl);
        segment.set(key.id, envelope);
        this.byteSize += envelope.byteSize;
    }

    drop(key) {

        if (!this.cache) {
            throw new Boom.Boom('Connection not started');
        }

        const segment = this.cache.get(key.segment);
        if (segment) {
            const item = segment.get(key.id);
            if (item) {
                this.byteSize -= item.byteSize;
                segment.delete(key.id);
            }
        }
    }
};


internals.MemoryCacheEntry = class {

    constructor(key, value, ttl) {

        let valueByteSize = 0;

        if (Buffer.isBuffer(value)) {
            this.item = Buffer.alloc(value.length);
            value.copy(this.item);                                  // Copy buffer to prevent value from changing while in the cache
            valueByteSize = this.item.length;
        }
        else {
            this.item = JSON.stringify(value);                      // stringify() to prevent value from changing while in the cache
            valueByteSize = Buffer.byteLength(this.item);
        }

        this.stored = Date.now();
        this.ttl = ttl;
        this.byteSize = internals.entrySize + valueByteSize + Buffer.byteLength(key.segment) + Buffer.byteLength(key.id);
        this.timeoutId = null;
    }
};
