'use strict';

const Hoek = require('@hapi/hoek');
const Validate = require('@hapi/validate');

const Request = require('./request');
const Response = require('./response');
const Symbols = require('./symbols');


const internals = {};


internals.options = Validate.object().keys({
    url: Validate.alternatives([
        Validate.string(),
        Validate.object().keys({
            protocol: Validate.string(),
            hostname: Validate.string(),
            port: Validate.any(),
            pathname: Validate.string().required(),
            query: Validate.any()
        })
    ])
        .required(),
    headers: Validate.object(),
    payload: Validate.any(),
    simulate: {
        end: Validate.boolean(),
        split: Validate.boolean(),
        error: Validate.boolean(),
        close: Validate.boolean()
    },
    authority: Validate.string(),
    remoteAddress: Validate.string(),
    method: Validate.string(),
    validate: Validate.boolean()
});


exports.inject = function (dispatchFunc, options) {

    options = (typeof options === 'string' ? { url: options } : options);

    if (options.validate !== false) {                                                           // Defaults to true
        try {
            Hoek.assert(typeof dispatchFunc === 'function', 'Invalid dispatch function');
            Validate.assert(options, internals.options);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }

    return new Promise((resolve) => {

        const req = new Request(options);
        const res = new Response(req, resolve);

        req.prepare(() => dispatchFunc(req, res));
    });
};


exports.isInjection = function (obj) {

    return !!obj[Symbols.injection];
};
