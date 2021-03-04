'use strict';

const Crypto = require('crypto');
const Stream = require('stream');
const Util = require('util');

const Boom = require('@hapi/boom');
const Bounce = require('@hapi/bounce');
const LruCache = require('lru-cache');


const internals = {
    pendings: new Map(),
    streamEnd: Util.promisify(Stream.finished)
};


internals.computeHashed = async function (response, stat) {

    const etags = response.request.server.plugins.inert._etags;
    if (!etags) {
        return null;
    }

    // Use stat info for an LRU cache key.

    const path = response.source.path;
    const cachekey = [path, stat.ino, stat.size, stat.mtime.getTime()].join('-');

    // The etag hashes the file contents in order to be consistent across distributed deployments

    const cachedEtag = etags.get(cachekey);
    if (cachedEtag) {
        return cachedEtag;
    }

    let promise = internals.pendings.get(cachekey);
    if (promise) {
        return await promise;
    }

    // Start hashing

    const compute = async () => {

        try {
            const hash = await internals.hashFile(response);
            etags.set(cachekey, hash);

            return hash;
        }
        finally {
            internals.pendings.delete(cachekey);
        }
    };

    internals.pendings.set(cachekey, promise = compute());

    return await promise;
};


internals.hashFile = async function (response) {

    const hash = Crypto.createHash('sha1');
    hash.setEncoding('hex');

    const fileStream = response.source.file.createReadStream({ autoClose: false });
    fileStream.pipe(hash);

    try {
        await internals.streamEnd(fileStream);
        return hash.read();
    }
    catch (err) {
        Bounce.rethrow(err, 'system');
        throw Boom.boomify(err, { message: 'Failed to hash file', data: { path: response.source.path } });
    }
};


internals.computeSimple = function (response, stat) {

    const size = stat.size.toString(16);
    const mtime = stat.mtime.getTime().toString(16);

    return size + '-' + mtime;
};


exports.apply = async function (response, stat) {

    const etagMethod = response.source.settings.etagMethod;
    if (etagMethod === false) {
        return;
    }

    let etag;
    if (etagMethod === 'simple') {
        etag = internals.computeSimple(response, stat);
    }
    else {
        etag = await internals.computeHashed(response, stat);
    }

    if (etag !== null) {
        response.etag(etag, { vary: true });
    }
};


exports.Cache = LruCache;
