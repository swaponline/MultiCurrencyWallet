'use strict';

const Hoek = require('@hapi/hoek');

const Decoder = require('./decoder');
const Encoder = require('./encoder');


exports.decode = Decoder.decode;

exports.encode = Encoder.encode;

exports.Decoder = Decoder.Decoder;

exports.Encoder = Encoder.Encoder;


// Base64url (RFC 4648) encode

exports.base64urlEncode = function (value, encoding) {

    Hoek.assert(typeof value === 'string' || Buffer.isBuffer(value), 'value must be string or buffer');
    const buf = (Buffer.isBuffer(value) ? value : Buffer.from(value, encoding || 'binary'));
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
};


// Base64url (RFC 4648) decode

exports.base64urlDecode = function (value, encoding) {

    if (typeof value !== 'string') {

        throw new Error('Value not a string');
    }

    if (!/^[\w\-]*$/.test(value)) {

        throw new Error('Invalid character');
    }

    const buf = Buffer.from(value, 'base64');
    return (encoding === 'buffer' ? buf : buf.toString(encoding || 'binary'));
};
