'use strict';

const Crypto = require('crypto');
const Path = require('path');


const internals = {};


exports.uniqueFilename = function (path, extension) {

    if (extension) {
        extension = extension[0] !== '.' ? '.' + extension : extension;
    }
    else {
        extension = '';
    }

    path = Path.resolve(path);
    const name = [Date.now(), process.pid, Crypto.randomBytes(8).toString('hex')].join('-') + extension;
    return Path.join(path, name);
};
