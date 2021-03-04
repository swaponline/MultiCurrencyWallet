'use strict';

const Stream = require('stream');

const Hoek = require('@hapi/hoek');
const Vise = require('@hapi/vise');


const internals = {};


exports.compile = function (needle) {

    Hoek.assert(needle && needle.length, 'Missing needle');
    Hoek.assert(Buffer.isBuffer(needle), 'Needle must be a buffer');

    const profile = {
        value: needle,
        lastPos: needle.length - 1,
        last: needle[needle.length - 1],
        length: needle.length,
        badCharShift: Buffer.alloc(256)                  // Lookup table of how many characters can be skipped for each match
    };

    for (let i = 0; i < 256; ++i) {
        profile.badCharShift[i] = profile.length;       // Defaults to the full length of the needle
    }

    const last = profile.length - 1;
    for (let i = 0; i < last; ++i) {                    // For each character in the needle (skip last since its position is already the default)
        profile.badCharShift[profile.value[i]] = last - i;
    }

    return profile;
};


exports.horspool = function (haystack, needle, start) {

    Hoek.assert(haystack, 'Missing haystack');

    needle = (needle.badCharShift ? needle : exports.compile(needle));
    start = start || 0;

    for (let i = start; i <= haystack.length - needle.length;) {       // Has enough room to fit the entire needle
        const lastChar = haystack.readUInt8(i + needle.lastPos);
        if (lastChar === needle.last &&
            internals.startsWith(haystack, needle, i)) {

            return i;
        }

        i += needle.badCharShift[lastChar];           // Jump to the next possible position based on last character location in needle
    }

    return -1;
};


internals.startsWith = function (haystack, needle, pos) {

    if (haystack.startsWith) {
        return haystack.startsWith(needle.value, pos, needle.lastPos);
    }

    for (let i = 0; i < needle.lastPos; ++i) {
        if (needle.value[i] !== haystack.readUInt8(pos + i)) {
            return false;
        }
    }

    return true;
};


exports.all = function (haystack, needle, start) {

    needle = exports.compile(needle);
    start = start || 0;

    const matches = [];
    for (let i = start; i !== -1 && i < haystack.length;) {

        i = exports.horspool(haystack, needle, i);
        if (i !== -1) {
            matches.push(i);
            i += needle.length;
        }
    }

    return matches;
};


internals._indexOf = function (haystack, needle) {

    Hoek.assert(haystack, 'Missing haystack');

    for (let i = 0; i <= haystack.length - needle.length; ++i) {       // Has enough room to fit the entire needle
        if (haystack.startsWith(needle.value, i)) {
            return i;
        }
    }

    return -1;
};


exports.Stream = internals.Stream = class extends Stream.Writable {

    constructor(needle) {

        super({ autoDestroy: true });

        this.needle(needle);
        this._haystack = new Vise();
        this._indexOf = this._needle.length > 2 ? exports.horspool : internals._indexOf;

        this.on('finish', () => {

            // Flush out the remainder

            const chunks = this._haystack.chunks();
            for (let i = 0; i < chunks.length; ++i) {
                this.emit('haystack', chunks[i]);
            }
        });
    }

    needle(needle) {

        this._needle = exports.compile(needle);
    }

    _write(chunk, encoding, next) {

        this._haystack.push(chunk);

        let match = this._indexOf(this._haystack, this._needle);
        if (match === -1 &&
            chunk.length >= this._needle.length) {

            this._flush(this._haystack.length - chunk.length);
        }

        while (match !== -1) {
            this._flush(match);
            this._haystack.shift(this._needle.length);
            this.emit('needle');

            match = this._indexOf(this._haystack, this._needle);
        }

        if (this._haystack.length) {
            const notChecked = this._haystack.length - this._needle.length + 1;       // Not enough space for Horspool
            let i = notChecked;
            for (; i < this._haystack.length; ++i) {
                if (this._haystack.startsWith(this._needle.value, i, this._haystack.length - i)) {
                    break;
                }
            }

            this._flush(i);
        }

        return next();
    }

    _flush(pos) {

        const chunks = this._haystack.shift(pos);
        for (let i = 0; i < chunks.length; ++i) {
            this.emit('haystack', chunks[i]);
        }
    }

    flush() {

        const chunks = this._haystack.shift(this._haystack.length);
        for (let i = 0; i < chunks.length; ++i) {
            this.emit('haystack', chunks[i]);
        }
    }
};
