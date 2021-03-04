'use strict';

const Stream = require('stream');

const Hoek = require('@hapi/hoek');


const internals = {};


// RFC 7233 (https://tools.ietf.org/html/rfc7233#appendix-D)
//
// Range = "bytes" "=" byte-range-set
// byte-range-set = *( "," OWS ) byte-range-spec *( OWS "," [ OWS byte-range-spec ] )
// byte-range-spec = ( 1*DIGIT "-" [ 1*DIGIT ] ) / ( "-" 1*DIGIT )


//                                12  3          3 4       425         6  7          7 8       865 1
internals.headerRx = /^bytes=[\s,]*((?:(?:\d+\-\d*)|(?:\-\d+))(?:\s*,\s*(?:(?:\d+\-\d*)|(?:\-\d+)))*)$/i;


exports.header = function (header, length) {

    // Parse header

    const parts = internals.headerRx.exec(header);
    if (!parts) {
        return null;
    }

    const lastPos = length - 1;

    const result = [];
    const ranges = parts[1].match(/\d*\-\d*/g);

    // Handle headers with multiple ranges

    for (let range of ranges) {
        let from;
        let to;
        range = range.split('-');
        if (range[0]) {
            from = parseInt(range[0], 10);
        }

        if (range[1]) {
            to = parseInt(range[1], 10);
            if (from !== undefined) {      // Can be 0
                // From-To
                if (to > lastPos) {
                    to = lastPos;
                }
            }
            else {
                // -To
                from = length - to;
                to = lastPos;
            }
        }
        else {
            // From-
            to = lastPos;
        }

        if (from > to) {
            return null;
        }

        result.push(new internals.Range(from, to));
    }

    if (result.length === 1) {
        return result;
    }

    // Sort and consolidate ranges

    result.sort((a, b) => a.from - b.from);

    const consolidated = [];
    for (let i = result.length - 1; i > 0; --i) {
        const current = result[i];
        const before = result[i - 1];
        if (current.from <= before.to + 1) {
            before.to = current.to;
        }
        else {
            consolidated.unshift(current);
        }
    }

    consolidated.unshift(result[0]);

    return consolidated;
};


internals.Range = class {

    constructor(from, to) {

        this.from = from;
        this.to = to;
    }
};


exports.Clip = class extends Stream.Transform {

    constructor(range) {

        if (!(range instanceof internals.Range)) {
            Hoek.assert(typeof range === 'object', 'Expected "range" object');

            const from = range.from || 0;
            Hoek.assert(typeof from === 'number', '"range.from" must be falsy, or a number');
            Hoek.assert(from === parseInt(from, 10) && from >= 0, '"range.from" must be a positive integer');

            const to = range.to || 0;
            Hoek.assert(typeof to === 'number', '"range.to" must be falsy, or a number');
            Hoek.assert(to === parseInt(to, 10) && to >= 0, '"range.to" must be a positive integer');

            Hoek.assert(to >= from, '"range.to" must be greater than or equal to "range.from"');

            range = new internals.Range(from, to);
        }

        super();

        this._range = range;
        this._next = 0;

        this._pipes = new Set();
        this.on('pipe', (pipe) => this._pipes.add(pipe));
        this.on('unpipe', (pipe) => this._pipes.delete(pipe));
    }

    _transform(chunk, encoding, done) {

        try {
            internals.processChunk(this, chunk);
        }
        catch (err) {
            return done(err);
        }

        return done();
    }

    _flush(done) {

        this._pipes.clear();
        done();
    }
};


internals.processChunk = function (stream, chunk) {

    // Read desired range from a stream

    const pos = stream._next;
    stream._next = stream._next + chunk.length;

    if (stream._next <= stream._range.from) {           // Before range
        return;
    }

    if (pos > stream._range.to) {                       // After range
        for (const pipe of stream._pipes) {
            pipe.unpipe(stream);
        }

        stream._pipes.clear();
        stream.end();
        return;
    }

    // Calculate bounds of chunk to read

    const from = Math.max(0, stream._range.from - pos);
    const to = Math.min(chunk.length, stream._range.to - pos + 1);

    stream.push(chunk.slice(from, to));
};
