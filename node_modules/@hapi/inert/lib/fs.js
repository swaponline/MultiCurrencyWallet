'use strict';

const Fs = require('fs');
const Util = require('util');

const Boom = require('@hapi/boom');
const Bounce = require('@hapi/bounce');
const Hoek = require('@hapi/hoek');


const internals = {
    methods: {
        promised: ['open', 'close', 'fstat', 'readdir'],
        raw: ['createReadStream']
    }
};


exports.File = class {

    constructor(path) {

        this.path = path;
        this.fd = null;
    }

    async open(mode) {

        Hoek.assert(this.fd === null);

        try {
            this.fd = await exports.open(this.path, mode);
        }
        catch (err) {
            const data = { path: this.path };

            if (this.path.indexOf('\u0000') !== -1 || err.code === 'ENOENT') {
                throw Boom.notFound(null, data);
            }

            if (err.code === 'EACCES' || err.code === 'EPERM') {
                data.code = err.code;
                throw Boom.forbidden(null, data);
            }

            throw Boom.boomify(err, { message: 'Failed to open file', data });
        }
    }

    close() {

        if (this.fd !== null) {
            Bounce.background(exports.close(this.fd));
            this.fd = null;
        }
    }

    async stat() {

        Hoek.assert(this.fd !== null);

        try {
            const stat = await exports.fstat(this.fd);

            if (stat.isDirectory()) {
                throw Boom.forbidden(null, { code: 'EISDIR', path: this.path });
            }

            return stat;
        }
        catch (err) {
            this.close(this.fd);

            Bounce.rethrow(err, ['boom', 'system']);
            throw Boom.boomify(err, { message: 'Failed to stat file', data: { path: this.path } });
        }
    }

    async openStat(mode) {

        await this.open(mode);
        return this.stat();
    }

    createReadStream(options) {

        Hoek.assert(this.fd !== null);

        options = Object.assign({ fd: this.fd, start: 0 }, options);

        const stream = exports.createReadStream(this.path, options);

        if (options.autoClose !== false) {
            this.fd = null;           // The stream now owns the fd
        }

        return stream;
    }
};

// Export Fs methods

for (const method of internals.methods.raw) {
    exports[method] = Fs[method].bind(Fs);
}

for (const method of internals.methods.promised) {
    exports[method] = Util.promisify(Fs[method]);
}
