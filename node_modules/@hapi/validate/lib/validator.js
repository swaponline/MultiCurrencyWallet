'use strict';

const Assert = require('@hapi/hoek/lib/assert');
const Clone = require('@hapi/hoek/lib/clone');

const Common = require('./common');
const Errors = require('./errors');
const State = require('./state');


const internals = {
    result: Symbol('result')
};


exports.entry = function (value, schema, prefs) {

    let settings = Common.defaults;
    if (prefs) {
        settings = Common.preferences(Common.defaults, prefs);
    }

    const result = internals.entry(value, schema, settings);
    const outcome = { value: result.value };

    if (result.error) {
        outcome.error = result.error;
    }

    return outcome;
};


internals.entry = function (value, schema, prefs) {

    // Prepare state

    const links = schema._ids._schemaChain ? new Map() : null;
    const mainstay = { links };
    const schemas = schema._ids._schemaChain ? [{ schema }] : null;
    const state = new State([], [], { mainstay, schemas });

    // Validate value

    const result = exports.validate(value, schema, state, prefs);

    // Process value and errors

    const error = Errors.process(result.errors, value, prefs);
    return { value: result.value, error, mainstay };
};


exports.validate = function (value, schema, state, prefs, overrides = {}) {

    if (schema.$_terms.whens) {
        schema = schema._generate(value, state, prefs).schema;
    }

    // Setup state and settings

    if (schema._preferences) {
        prefs = internals.prefs(schema, prefs);
    }

    // Helpers

    const createError = (code, local, localState) => schema.$_createError(code, value, local, localState || state, prefs);
    const helpers = {
        original: value,
        prefs,
        schema,
        state,
        error: createError,
        errorsArray: internals.errorsArray,
        message: (messages, local) => schema.$_createError('custom', value, local, state, prefs, { messages })
    };

    // Type coercion

    const def = schema._definition;
    if (def.coerce &&
        value !== undefined &&
        prefs.convert &&
        (!def.coerce.from || def.coerce.from.includes(typeof value))) {

        const coerced = def.coerce.method(value, helpers);
        if (coerced) {
            if (coerced.errors) {
                return internals.finalize(coerced.value, [].concat(coerced.errors), helpers);           // Coerce error always aborts early
            }

            value = coerced.value;
        }
    }

    // Empty value

    const empty = schema._flags.empty;
    if (empty &&
        empty.$_match(internals.trim(value, schema), state.nest(empty), Common.defaults)) {

        value = undefined;
    }

    // Presence requirements (required, optional, forbidden)

    const presence = overrides.presence || schema._flags.presence || (schema._flags._endedSwitch ? null : prefs.presence);
    if (value === undefined) {
        if (presence === 'forbidden') {
            return internals.finalize(value, null, helpers);
        }

        if (presence === 'required') {
            return internals.finalize(value, [schema.$_createError('any.required', value, null, state, prefs)], helpers);
        }

        if (presence === 'optional') {
            if (schema._flags.default !== Common.symbols.deepDefault) {
                return internals.finalize(value, null, helpers);
            }

            value = {};
        }
    }
    else if (presence === 'forbidden') {
        return internals.finalize(value, [schema.$_createError('any.unknown', value, null, state, prefs)], helpers);
    }

    // Allowed values

    const errors = [];

    if (schema._valids) {
        const match = schema._valids.get(value, state, prefs, schema._flags.insensitive);
        if (match) {
            if (prefs.convert) {
                value = match.value;
            }

            return internals.finalize(value, null, helpers);
        }

        if (schema._flags.only) {
            const report = schema.$_createError('any.only', value, { valids: schema._valids.values({ display: true }) }, state, prefs);
            if (prefs.abortEarly) {
                return internals.finalize(value, [report], helpers);
            }

            errors.push(report);
        }
    }

    // Denied values

    if (schema._invalids) {
        const match = schema._invalids.get(value, state, prefs, schema._flags.insensitive);
        if (match) {
            const report = schema.$_createError('any.invalid', value, { invalids: schema._invalids.values({ display: true }) }, state, prefs);
            if (prefs.abortEarly) {
                return internals.finalize(value, [report], helpers);
            }

            errors.push(report);
        }
    }

    // Base type

    if (def.validate) {
        const base = def.validate(value, helpers);
        if (base) {
            value = base.value;

            if (base.errors) {
                if (!Array.isArray(base.errors)) {
                    errors.push(base.errors);
                    return internals.finalize(value, errors, helpers);          // Base error always aborts early
                }

                if (base.errors.length) {
                    errors.push(...base.errors);
                    return internals.finalize(value, errors, helpers);          // Base error always aborts early
                }
            }
        }
    }

    // Validate tests

    if (!schema._rules.length) {
        return internals.finalize(value, errors, helpers);
    }

    return internals.rules(value, errors, helpers);
};


internals.rules = function (value, errors, helpers) {

    const { schema, state, prefs } = helpers;

    for (const rule of schema._rules) {
        const definition = schema._definition.rules[rule.method];

        // Skip rules that are also applied in coerce step

        if (definition.convert &&
            prefs.convert) {

            continue;
        }

        // Resolve references

        let ret;
        let args = rule.args;
        if (rule._resolve.length) {
            args = Object.assign({}, args);                                     // Shallow copy
            for (const key of rule._resolve) {
                const resolver = definition.argsByName.get(key);

                const resolved = args[key].resolve(value, state, prefs);
                const normalized = resolver.normalize ? resolver.normalize(resolved) : resolved;

                const invalid = Common.validateArg(normalized, null, resolver);
                if (invalid) {
                    ret = schema.$_createError('any.ref', resolved, { arg: key, ref: args[key], reason: invalid }, state, prefs);
                    break;
                }

                args[key] = normalized;
            }
        }

        // Test rule

        ret = ret || definition.validate(value, helpers, args, rule);           // Use ret if already set to reference error

        const result = internals.rule(ret, rule);
        if (result.errors) {
            if (prefs.abortEarly) {
                return internals.finalize(value, result.errors, helpers);
            }

            errors.push(...result.errors);
        }
        else {
            value = result.value;
        }
    }

    return internals.finalize(value, errors, helpers);
};


internals.rule = function (ret, rule) {

    if (ret instanceof Errors.Report) {
        return { errors: [ret], value: null };
    }

    if (Array.isArray(ret) &&
        ret[Common.symbols.errors]) {

        return { errors: ret, value: null };
    }

    return { errors: null, value: ret };
};


internals.finalize = function (value, errors, helpers) {

    errors = errors || [];
    const { schema, state } = helpers;

    // Failover value

    if (errors.length) {
        const failover = internals.default('failover', undefined, errors, helpers);
        if (failover !== undefined) {
            value = failover;
            errors = [];
        }
    }

    // Error override

    if (errors.length &&
        schema._flags.error) {

        if (typeof schema._flags.error === 'function') {
            errors = schema._flags.error(errors);
            if (!Array.isArray(errors)) {
                errors = [errors];
            }

            for (const error of errors) {
                Assert(error instanceof Error || error instanceof Errors.Report, 'error() must return an Error object');
            }
        }
        else {
            errors = [schema._flags.error];
        }
    }

    // Default

    if (value === undefined) {
        const defaulted = internals.default('default', value, errors, helpers);
        value = defaulted;
    }

    // Cast

    if (schema._flags.cast &&
        value !== undefined) {

        const caster = schema._definition.cast[schema._flags.cast];
        if (caster.from(value)) {
            const casted = caster.to(value, helpers);
            value = casted;
        }
    }

    // Result

    const result = { value, errors: errors.length ? errors : null };

    if (schema._flags.result) {
        result.value = schema._flags.result === 'strip' ? undefined : /* raw */ helpers.original;
        state.shadow(value, schema._flags.result);
    }

    return result;
};


internals.prefs = function (schema, prefs) {

    const isDefaultOptions = prefs === Common.defaults;
    if (isDefaultOptions &&
        schema._preferences[Common.symbols.prefs]) {

        return schema._preferences[Common.symbols.prefs];
    }

    prefs = Common.preferences(prefs, schema._preferences);
    if (isDefaultOptions) {
        schema._preferences[Common.symbols.prefs] = prefs;
    }

    return prefs;
};


internals.default = function (flag, value, errors, helpers) {

    const { schema, state, prefs } = helpers;
    const source = schema._flags[flag];
    if (prefs.noDefaults ||
        source === undefined) {

        return value;
    }

    if (!source) {
        return source;
    }

    if (typeof source === 'function') {
        const args = source.length ? [Clone(state.ancestors[0]), helpers] : [];

        try {
            return source(...args);
        }
        catch (err) {
            errors.push(schema.$_createError(`any.${flag}`, null, { error: err }, state, prefs));
            return;
        }
    }

    if (typeof source !== 'object') {
        return source;
    }

    if (source[Common.symbols.literal]) {
        return source.literal;
    }

    if (Common.isResolvable(source)) {
        return source.resolve(value, state, prefs);
    }

    return Clone(source);
};


internals.trim = function (value, schema) {

    if (typeof value !== 'string') {
        return value;
    }

    const trim = schema.$_getRule('trim');
    if (!trim ||
        !trim.args.enabled) {

        return value;
    }

    return value.trim();
};


internals.errorsArray = function () {

    const errors = [];
    errors[Common.symbols.errors] = true;
    return errors;
};
