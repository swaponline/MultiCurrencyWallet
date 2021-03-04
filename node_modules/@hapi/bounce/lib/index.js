'use strict';

const Assert = require('assert');

const Boom = require('@hapi/boom');
const Hoek = require('@hapi/hoek');


const internals = {
    system: [

        // JavaScript

        EvalError,
        RangeError,
        ReferenceError,
        SyntaxError,
        TypeError,
        URIError,

        // Node

        Assert.AssertionError,

        // Hoek

        Hoek.Error
    ]
};


exports.rethrow = function (err, types, options = {}) {

    return internals.catch(err, types, options, true);
};


exports.ignore = function (err, types, options = {}) {

    return internals.catch(err, types, options, false);
};


internals.catch = function (err, types, options, match) {

    if (internals.match(err, types) !== match) {
        return;
    }

    // Error replacement

    if (options.override) {
        err = options.override;
    }

    // Error decorations

    if (options.decorate) {
        Object.assign(err, options.decorate);
    }

    if (options.return) {
        return err;
    }

    throw err;
};


exports.background = async function (operation, action = 'rethrow', types = 'system', options = {}) {

    try {
        if (typeof operation === 'function') {
            await operation();
        }
        else {
            await operation;
        }
    }
    catch (err) {
        exports[action](err, types, options);
    }
};


exports.isBoom = function (err) {

    return Boom.isBoom(err);
};


exports.isError = function (err) {

    return err instanceof Error;
};


exports.isSystem = function (err) {

    if (!err) {
        return false;
    }

    if (err.isBoom) {
        return false;
    }

    for (const system of internals.system) {
        if (err instanceof system) {
            return true;
        }
    }

    return false;
};


internals.rules = {
    system: exports.isSystem,
    boom: exports.isBoom
};


internals.match = function (err, types) {

    if (!types) {
        return true;
    }

    types = Array.isArray(types) ? types : [types];
    for (const type of types) {
        if (typeof type === 'string') {
            if (internals.rules[type](err)) {
                return true;
            }
        }
        else if (typeof type === 'object') {
            if (Hoek.contain(err, type, { deep: true, part: true })) {
                return true;
            }
        }
        else if (err instanceof type) {
            return true;
        }
    }

    return false;
};
