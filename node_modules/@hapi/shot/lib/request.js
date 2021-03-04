'use strict';

const Stream = require('stream');
const Url = require('url');

const Symbols = require('./symbols');


const internals = {};


exports = module.exports = internals.Request = class extends Stream.Readable {

    constructor(options) {

        super({
            emitClose: !!(options.simulate && options.simulate.close),
            autoDestroy: true        // This is the default in node 14+
        });

        // options: method, url, payload, headers, remoteAddress

        let url = options.url;
        if (typeof url === 'object') {
            url = Url.format(url);
        }

        const uri = Url.parse(url);
        this.url = uri.path;

        this.httpVersion = '1.1';
        this.method = (options.method ? options.method.toUpperCase() : 'GET');

        this.headers = {};
        const headers = options.headers || {};
        const fields = Object.keys(headers);
        fields.forEach((field) => {

            this.headers[field.toLowerCase()] = headers[field];
        });

        this.headers['user-agent'] = this.headers['user-agent'] || 'shot';

        const hostHeaderFromUri = function () {

            if (uri.port) {
                return uri.host;
            }

            if (uri.protocol) {
                return uri.hostname + (uri.protocol === 'https:' ? ':443' : ':80');
            }

            return null;
        };

        this.headers.host = this.headers.host || hostHeaderFromUri() || options.authority || 'localhost:80';

        this.connection = {
            remoteAddress: options.remoteAddress || '127.0.0.1'
        };

        let payload = options.payload || null;
        if (payload &&
            typeof payload !== 'string' &&
            !(payload instanceof Stream) &&
            !Buffer.isBuffer(payload)) {

            payload = JSON.stringify(payload);
            this.headers['content-type'] = this.headers['content-type'] || 'application/json';
        }

        // Set the content-length for the corresponding payload if none set

        if (payload &&
            !(payload instanceof Stream) &&
            !this.headers.hasOwnProperty('content-length')) {

            this.headers['content-length'] = (Buffer.isBuffer(payload) ? payload.length : Buffer.byteLength(payload)).toString();
        }

        // Use _shot namespace to avoid collision with Node

        this._shot = {
            payload,
            isDone: false,
            simulate: options.simulate || {}
        };

        return this;
    }

    prepare(next) {

        if (this._shot.payload instanceof Stream === false) {
            return next();
        }

        const chunks = [];

        this._shot.payload.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

        this._shot.payload.on('end', () => {

            const payload = Buffer.concat(chunks);
            this.headers['content-length'] = this.headers['content-length'] || payload.length;
            this._shot.payload = payload;
            return next();
        });
    }

    _read(size) {

        setImmediate(() => {

            if (this._shot.isDone) {
                /* $lab:coverage:off$ */
                if (this._shot.simulate.end !== false) {        // 'end' defaults to true
                    this.push(null);
                }
                /* $lab:coverage:on$ */

                return;
            }

            this._shot.isDone = true;

            if (this._shot.payload) {
                if (this._shot.simulate.split) {
                    this.push(this._shot.payload.slice(0, 1));
                    this.push(this._shot.payload.slice(1));
                }
                else {
                    this.push(this._shot.payload);
                }
            }

            if (this._shot.simulate.error) {
                this.destroy(new Error('Simulated'));
            }
            else if (this._shot.simulate.end !== false) {        // 'end' defaults to true
                this.push(null);
            }
            else if (this._shot.simulate.close) {                // manually close (out of spec)
                this.emit('close');
            }
        });
    }
};


internals.Request.prototype[Symbols.injection] = true;
