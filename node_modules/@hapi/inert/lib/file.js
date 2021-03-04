'use strict';

const Path = require('path');

const Ammo = require('@hapi/ammo');
const Boom = require('@hapi/boom');
const Bounce = require('@hapi/bounce');
const Hoek = require('@hapi/hoek');
const Validate = require('@hapi/validate');

const Etag = require('./etag');
const Fs = require('./fs');


const internals = {};


internals.defaultMap = {
    gzip: '.gz'
};


internals.schema = Validate.alternatives([
    Validate.string(),
    Validate.func(),
    Validate.object({
        path: Validate.alternatives(Validate.string(), Validate.func()).required(),
        confine: Validate.alternatives(Validate.string(), Validate.boolean()).default(true),
        filename: Validate.string(),
        mode: Validate.string().valid('attachment', 'inline').allow(false),
        lookupCompressed: Validate.boolean(),
        lookupMap: Validate.object().min(1).pattern(/.+/, Validate.string()),
        etagMethod: Validate.string().valid('hash', 'simple').allow(false),
        start: Validate.number().integer().min(0).default(0),
        end: Validate.number().integer().min(Validate.ref('start'))
    })
        .with('filename', 'mode')
]);


exports.handler = function (route, options) {

    let settings = Validate.attempt(options, internals.schema, 'Invalid file handler options (' + route.path + ')');
    settings = (typeof options !== 'object' ? { path: options, confine: '.' } : settings);
    settings.confine = settings.confine === true ? '.' : settings.confine;
    Hoek.assert(typeof settings.path !== 'string' || settings.path[settings.path.length - 1] !== '/', 'File path cannot end with a \'/\':', route.path);

    const handler = (request) => {

        const path = (typeof settings.path === 'function' ? settings.path(request) : settings.path);
        return exports.response(path, settings, request);
    };

    return handler;
};


exports.load = function (path, request, options) {

    const response = exports.response(path, options, request, true);
    return internals.prepare(response);
};


exports.response = function (path, options, request, _preloaded) {

    Hoek.assert(!options.mode || ['attachment', 'inline'].indexOf(options.mode) !== -1, 'options.mode must be either false, attachment, or inline');

    if (options.confine) {
        const confineDir = Path.resolve(request.route.settings.files.relativeTo, options.confine);
        path = Path.isAbsolute(path) ? Path.normalize(path) : Path.join(confineDir, path);

        // Verify that resolved path is within confineDir
        if (path.lastIndexOf(confineDir, 0) !== 0) {
            path = null;
        }
    }
    else {
        path = Path.isAbsolute(path) ? Path.normalize(path) : Path.join(request.route.settings.files.relativeTo, path);
    }

    const source = {
        path,
        settings: options,
        stat: null,
        file: null
    };

    const prepare = _preloaded ? null : internals.prepare;

    return request.generateResponse(source, { variety: 'file', marshal: internals.marshal, prepare, close: internals.close });
};


internals.prepare = async function (response) {

    const { request, source } = response;
    const { settings, path } = source;

    if (path === null) {
        throw Boom.forbidden(null, { code: 'EACCES' });
    }

    const file = source.file = new Fs.File(path);

    try {
        const stat = await file.openStat('r');

        const start = settings.start || 0;
        if (settings.end !== undefined) {
            response.bytes(settings.end - start + 1);
        }
        else {
            response.bytes(stat.size - start);
        }

        if (!response.headers['content-type']) {
            response.type(request.server.mime.path(path).type || 'application/octet-stream');
        }

        response.header('last-modified', stat.mtime.toUTCString());

        if (settings.mode) {
            const fileName = settings.filename || Path.basename(path);
            response.header('content-disposition', settings.mode + '; filename=' + encodeURIComponent(fileName));
        }

        await Etag.apply(response, stat);

        return response;
    }
    catch (err) {
        internals.close(response);
        throw err;
    }
};


internals.marshal = async function (response) {

    const { request, source } = response;
    const { settings } = source;

    if (settings.lookupCompressed &&
        !settings.start &&
        settings.end === undefined &&
        request.server.settings.compression !== false) {

        const lookupMap = settings.lookupMap || internals.defaultMap;
        const encoding = request.info.acceptEncoding;
        const extension = lookupMap.hasOwnProperty(encoding) ? lookupMap[encoding] : null;
        if (extension) {
            const precompressed = new Fs.File(`${source.path}${extension}`);
            try {
                var stat = await precompressed.openStat('r');
            }
            catch (err) {
                precompressed.close();
                Bounce.ignore(err, 'boom');
            }

            if (stat) {
                source.file.close();
                source.file = precompressed;

                response.bytes(stat.size);
                response.header('content-encoding', encoding);
                response.vary('accept-encoding');
            }
        }
    }

    return internals.createStream(response);
};


internals.addContentRange = function (response) {

    const { request } = response;
    let range = null;

    if (request.route.settings.response.ranges) {
        const length = response.headers['content-length'];

        if (request.headers.range && length) {

            // Check If-Range

            if (!request.headers['if-range'] ||
                request.headers['if-range'] === response.headers.etag) {            // Ignoring last-modified date (weak)

                // Check that response is not encoded once transmitted

                const mime = request.server.mime.type(response.headers['content-type'] || 'application/octet-stream');
                const encoding = (request.server.settings.compression && mime.compressible && !response.headers['content-encoding'] ? request.info.acceptEncoding : null);

                if (encoding === 'identity' || !encoding) {

                    // Parse header

                    const ranges = Ammo.header(request.headers.range, length);
                    if (!ranges) {
                        const error = Boom.rangeNotSatisfiable();
                        error.output.headers['content-range'] = 'bytes */' + length;
                        throw error;
                    }

                    // Prepare transform

                    if (ranges.length === 1) {                                          // Ignore requests for multiple ranges
                        range = ranges[0];
                        response.code(206);
                        response.bytes(range.to - range.from + 1);
                        response.header('content-range', 'bytes ' + range.from + '-' + range.to + '/' + length);
                    }
                }
            }
        }

        response.header('accept-ranges', 'bytes');
    }

    return range;
};


internals.createStream = function (response) {

    const { settings, file } = response.source;

    Hoek.assert(file !== null);

    const range = internals.addContentRange(response);
    const options = {
        start: settings.start || 0,
        end: settings.end
    };

    if (range) {
        options.end = range.to + options.start;
        options.start = range.from + options.start;
    }

    return file.createReadStream(options);
};


internals.close = function (response) {

    const { source } = response;

    if (source.file !== null) {
        source.file.close();
        source.file = null;
    }
};
