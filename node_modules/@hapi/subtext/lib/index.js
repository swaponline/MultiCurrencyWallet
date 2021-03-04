'use strict';

const Fs = require('fs');
const Os = require('os');
const Querystring = require('querystring');
const Stream = require('stream');
const Zlib = require('zlib');

const Boom = require('@hapi/boom');
const Bourne = require('@hapi/bourne');
const Content = require('@hapi/content');
const File = require('@hapi/file');
const Hoek = require('@hapi/hoek');
const Pez = require('@hapi/pez');
const Wreck = require('@hapi/wreck');


const internals = {
    decoders: {
        gzip: (options) => Zlib.createGunzip(options),
        deflate: (options) => Zlib.createInflate(options)
    }
};


exports.parse = async function (req, tap, options) {

    Hoek.assert(options, 'Missing options');
    Hoek.assert(options.parse !== undefined, 'Missing parse option setting');
    Hoek.assert(options.output !== undefined, 'Missing output option setting');

    // Content size

    const contentLength = req.headers['content-length'];
    if (options.maxBytes !== undefined &&
        contentLength &&
        parseInt(contentLength, 10) > options.maxBytes) {

        throw Boom.entityTooLarge('Payload content length greater than maximum allowed: ' + options.maxBytes);
    }

    // Content type

    const contentType = Content.type(options.override || req.headers['content-type'] || options.defaultContentType || 'application/octet-stream');
    try {
        if (options.allow &&
            options.allow.indexOf(contentType.mime) === -1) {

            throw Boom.unsupportedMediaType();
        }

        const parsed = { mime: contentType.mime };

        // Parse: true

        if (options.parse === true) {
            parsed.payload = await internals.parse(req, tap, options, contentType);
            return parsed;
        }

        // Parse: false, 'gunzip'

        parsed.payload = await internals.raw(req, tap, options);
        return parsed;
    }
    catch (err) {
        err.mime = contentType.mime;
        throw err;
    }
};


internals.parse = async function (req, tap, options, contentType) {

    const output = options.output;        // Output: 'data', 'stream', 'file'
    let source = internals.decoder(req, options);

    // Tap request

    if (tap) {
        source = internals.pipe(source, tap);
    }

    // Multipart

    if (contentType.mime === 'multipart/form-data') {
        if (options.multipart === false) {                            // Defaults to true
            throw Boom.unsupportedMediaType();
        }

        return await internals.multipart(req, options, source, contentType);
    }

    // Output: 'stream'

    if (output === 'stream') {
        return source;
    }

    // Output: 'file'

    if (output === 'file') {
        const file = await internals.writeFile(req, options, source);
        return file.item;
    }

    // Output: 'data'

    const payload = await Wreck.read(source, { timeout: options.timeout, maxBytes: options.maxBytes });
    return internals.object(options, payload, contentType.mime);
};


internals.decoder = function (source, options) {

    const contentEncoding = source.headers['content-encoding'];
    const decoders = options.decoders || internals.decoders;
    if (!decoders.hasOwnProperty(contentEncoding)) {
        return source;
    }

    const decoderOptions = options.compression && options.compression[contentEncoding] || null;
    const stream = decoders[contentEncoding](decoderOptions);

    const orig = stream.emit;
    stream.emit = (event, ...args) => {

        if (event === 'error') {
            args = [Boom.badRequest('Invalid compressed payload', args[0])];
        }

        return orig.call(stream, event, ...args);
    };

    return internals.pipe(source, stream);
};


internals.raw = async function (req, tap, options) {

    const output = options.output;      // Output: 'data', 'stream', 'file'
    let source = req;

    // Content-encoding (optional)

    if (options.parse === 'gunzip') {
        source = internals.decoder(source, options);
    }

    // Setup source

    if (tap) {
        source = internals.pipe(source, tap);
    }

    // Output: 'stream'

    if (output === 'stream') {
        return source;
    }

    // Output: 'file'

    if (output === 'file') {
        const file = await internals.writeFile(req, options, source);
        return file.item;
    }

    // Output: 'data'

    return await Wreck.read(source, { timeout: options.timeout, maxBytes: options.maxBytes });
};


internals.object = function (options, payload, mime) {

    // Binary

    if (mime === 'application/octet-stream') {
        return payload.length ? payload : null;
    }

    // Text

    if (mime.match(/^text\/.+$/)) {
        return payload.toString('utf8');
    }

    // JSON

    if (/^application\/(?:.+\+)?json$/.test(mime)) {
        if (!payload.length) {
            return null;
        }

        try {
            return Bourne.parse(payload.toString('utf8'), { protoAction: options.protoAction });
        }
        catch (err) {
            const error = Boom.badRequest('Invalid request payload JSON format', err);
            error.raw = payload;
            throw error;
        }
    }

    // Form-encoded

    if (mime === 'application/x-www-form-urlencoded') {
        const parse = options.querystring || Querystring.parse;
        return payload.length ? parse(payload.toString('utf8')) : {};
    }

    const error = Boom.unsupportedMediaType();
    error.raw = payload;
    throw error;
};


internals.multipart = function (req, options, source, contentType) {

    return new Promise((resolve, reject) => {

        // Set stream timeout

        const clientTimeout = options.timeout;
        const clientTimeoutId = clientTimeout ? setTimeout(() => reject(Boom.clientTimeout()), clientTimeout) : null;

        // Create parser

        const dispenserOptions = Hoek.applyToDefaults(contentType, { maxBytes: options.maxBytes });
        const dispenser = new Pez.Dispenser(dispenserOptions);

        const onError = (err) => reject(Boom.badRequest('Invalid multipart payload format', err));
        dispenser.once('error', onError);

        const data = {};
        const pendingFiles = [];

        const set = (name, value) => {

            if (!data.hasOwnProperty(name)) {
                data[name] = value;
            }
            else if (Array.isArray(data[name])) {
                data[name].push(value);
            }
            else {
                data[name] = [data[name], value];
            }
        };

        const finalize = async () => {

            // Clean up

            clearTimeout(clientTimeoutId);
            dispenser.removeListener('error', onError);
            dispenser.removeListener('part', onPart);
            dispenser.removeListener('field', onField);
            dispenser.removeListener('close', onClose);

            // Wait for files

            try {
                const files = await Promise.all(pendingFiles);
                for (const { item, name } of files) {
                    set(name, item);
                }
            }
            catch (err) {
                reject(err);
                return;
            }

            resolve(data);
        };

        const output = typeof options.multipart === 'object' ? options.multipart.output : options.output;       // options.multipart can be true or object

        const onPart = (part) => {

            if (output === 'file') {                                                                // Output: 'file'
                pendingFiles.push(internals.writeFile(req, options, part));
            }
            else {
                internals.part(part, output, set, options);                                         // Output: 'data' / 'stream'
            }
        };

        dispenser.on('part', onPart);

        const onField = (name, value) => set(name, value);
        dispenser.on('field', onField);

        const onClose = () => finalize();
        dispenser.once('close', onClose);

        source.pipe(dispenser);
    });
};


internals.writeFile = function (req, options, stream) {

    const promise = new Promise((resolve, reject) => {

        const path = File.uniqueFilename(options.uploads || Os.tmpdir());
        const file = Fs.createWriteStream(path, { flags: 'wx' });
        const counter = new internals.Counter(options);

        const finalize = (err) => {

            req.removeListener('aborted', onAbort);
            file.removeListener('close', finalize);
            file.removeListener('error', finalize);

            if (err) {
                stream.unpipe(counter);
                counter.unpipe(file);

                file.destroy();
                Fs.unlink(path, (/* fsErr */) => reject(err));      // Ignore unlink errors
                return;
            }

            const result = {
                item: {
                    path,
                    bytes: counter.bytes
                }
            };

            if (stream.name) {                                      // Multipart
                result.name = stream.name;
                result.item.filename = stream.filename;
                result.item.headers = stream.headers;
            }

            resolve(result);
        };

        file.once('close', finalize);
        file.once('error', finalize);

        const onAbort = () => finalize(Boom.badRequest('Client connection aborted'));
        req.once('aborted', onAbort);

        internals.pipe(stream, counter);
        internals.pipe(counter, file);
    });

    promise.catch(Hoek.ignore);     // Prevent triggering node's PromiseRejectionHandledWarning
    return promise;
};


internals.part = async function (part, output, set, options) {

    const payload = await Wreck.read(part);             // Error handled by dispenser.once('error')

    if (output === 'stream') {                          // Output: 'stream'
        const item = Wreck.toReadableStream(payload);
        item.hapi = {
            filename: part.filename,
            headers: part.headers
        };

        return set(part.name, item);
    }

    const ct = part.headers['content-type'] || '';      // Output: 'data'
    const mime = ct.split(';')[0].trim().toLowerCase();
    const annotate = (value) => set(part.name, output === 'annotated' ? { filename: part.filename, headers: part.headers, payload: value } : value);

    if (!mime) {
        return annotate(payload);
    }

    if (!payload.length) {
        return annotate({});
    }

    try {
        const object = internals.object(options, payload, mime);
        annotate(object);
    }
    catch (err) {
        annotate(payload);
    }
};


internals.pipe = function (from, to) {

    from.once('error', (err) => {

        from.unpipe(to);
        to.emit('error', err);
    });

    return from.pipe(to);
};


internals.Counter = class extends Stream.Transform {

    constructor(options) {

        super();
        this.bytes = 0;
        this._maxBytes = options.maxBytes;
    }

    _transform(chunk, encoding, next) {

        this.bytes = this.bytes + chunk.length;

        if (this._maxBytes !== undefined &&
            this.bytes > this._maxBytes) {

            return next(Boom.entityTooLarge('Payload content length greater than maximum allowed: ' + this._maxBytes));
        }

        return next(null, chunk);
    }
};
