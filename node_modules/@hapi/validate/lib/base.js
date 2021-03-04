'use strict';

const Assert = require('@hapi/hoek/lib/assert');
const Clone = require('@hapi/hoek/lib/clone');
const DeepEqual = require('@hapi/hoek/lib/deepEqual');
const Merge = require('@hapi/hoek/lib/merge');

const Common = require('./common');
const Compile = require('./compile');
const Errors = require('./errors');
const Extend = require('./extend');
const Messages = require('./messages');
const Modify = require('./modify');
const Ref = require('./ref');
const Validator = require('./validator');
const Values = require('./values');


const internals = {};


internals.Base = class {

    constructor(type) {

        // Naming: public, _private, $_extension, $_mutate{action}

        this.type = type;

        this.$_root = null;
        this._definition = {};
        this._ids = new Modify.Ids();
        this._preferences = null;
        this._refs = new Ref.Manager();
        this._cache = null;

        this._valids = null;
        this._invalids = null;

        this._flags = {};
        this._rules = [];
        this._singleRules = new Map();              // The rule options passed for non-multi rules

        this.$_terms = {};                          // Hash of arrays of immutable objects (extended by other types)

        this.$_temp = {                             // Runtime state (not cloned)
            whens: {}                               // Runtime cache of generated whens
        };
    }

    // Rules

    allow(...values) {

        Common.verifyFlat(values, 'allow');
        return this._values(values, '_valids');
    }

    cast(to) {

        Assert(to === false || typeof to === 'string', 'Invalid to value');
        Assert(to === false || this._definition.cast[to], 'Type', this.type, 'does not support casting to', to);

        return this.$_setFlag('cast', to === false ? undefined : to);
    }

    default(value, options) {

        return this._default('default', value, options);
    }

    empty(schema) {

        const obj = this.clone();

        if (schema !== undefined) {
            schema = obj.$_compile(schema, { override: false });
        }

        return obj.$_setFlag('empty', schema, { clone: false });
    }

    error(err) {

        Assert(err, 'Missing error');
        Assert(err instanceof Error || typeof err === 'function', 'Must provide a valid Error object or a function');

        return this.$_setFlag('error', err);
    }

    failover(value, options) {

        return this._default('failover', value, options);
    }

    forbidden() {

        return this.presence('forbidden');
    }

    id(id) {

        if (!id) {
            return this.$_setFlag('id', undefined);
        }

        Assert(typeof id === 'string', 'id must be a non-empty string');
        Assert(/^[^\.]+$/.test(id), 'id cannot contain period character');

        return this.$_setFlag('id', id);
    }

    invalid(...values) {

        return this._values(values, '_invalids');
    }

    only(mode = true) {

        Assert(typeof mode === 'boolean', 'Invalid mode:', mode);

        return this.$_setFlag('only', mode);
    }

    optional() {

        return this.presence('optional');
    }

    prefs(prefs) {

        Assert(prefs, 'Missing preferences');
        Assert(prefs.context === undefined, 'Cannot override context');

        Common.checkPreferences(prefs);

        const obj = this.clone();
        obj._preferences = Common.preferences(obj._preferences, prefs);
        return obj;
    }

    presence(mode) {

        Assert(['optional', 'required', 'forbidden'].includes(mode), 'Unknown presence mode', mode);

        return this.$_setFlag('presence', mode);
    }

    raw(enabled = true) {

        return this.$_setFlag('result', enabled ? 'raw' : undefined);
    }

    required() {

        return this.presence('required');
    }

    strict(enabled) {

        const obj = this.clone();

        const convert = enabled === undefined ? false : !enabled;
        obj._preferences = Common.preferences(obj._preferences, { convert });
        return obj;
    }

    strip(enabled = true) {

        return this.$_setFlag('result', enabled ? 'strip' : undefined);
    }

    valid(...values) {

        Common.verifyFlat(values, 'valid');

        const obj = this.allow(...values);
        obj.$_setFlag('only', !!obj._valids, { clone: false });
        return obj;
    }

    when(condition, options) {

        const obj = this.clone();

        if (!obj.$_terms.whens) {
            obj.$_terms.whens = [];
        }

        const when = Compile.when(obj, condition, options);
        if (!['any', 'link'].includes(obj.type)) {
            const conditions = when.is ? [when] : when.switch;
            for (const item of conditions) {
                Assert(!item.then || item.then.type === 'any' || item.then.type === obj.type, 'Cannot combine', obj.type, 'with', item.then && item.then.type);
                Assert(!item.otherwise || item.otherwise.type === 'any' || item.otherwise.type === obj.type, 'Cannot combine', obj.type, 'with', item.otherwise && item.otherwise.type);

            }
        }

        obj.$_terms.whens.push(when);
        return obj.$_mutateRebuild();
    }

    // Helpers

    clone() {

        const obj = Object.create(Object.getPrototypeOf(this));
        return this._assign(obj);
    }

    concat(source) {

        Assert(Common.isSchema(source), 'Invalid schema object');
        Assert(this.type === 'any' || source.type === 'any' || source.type === this.type, 'Cannot merge type', this.type, 'with another type:', source.type);

        let obj = this.clone();

        if (this.type === 'any' &&
            source.type !== 'any') {

            // Change obj to match source type

            const tmpObj = source.clone();
            for (const key of Object.keys(obj)) {
                if (key !== 'type') {
                    tmpObj[key] = obj[key];
                }
            }

            obj = tmpObj;
        }

        obj._ids.concat(source._ids);
        obj._refs.register(source, Ref.toSibling);

        obj._preferences = obj._preferences ? Common.preferences(obj._preferences, source._preferences) : source._preferences;
        obj._valids = Values.merge(obj._valids, source._valids, source._invalids);
        obj._invalids = Values.merge(obj._invalids, source._invalids, source._valids);

        // Remove unique rules present in source

        for (const name of source._singleRules.keys()) {
            if (obj._singleRules.has(name)) {
                obj._rules = obj._rules.filter((target) => target.name !== name);
                obj._singleRules.delete(name);
            }
        }

        // Rules

        for (const test of source._rules) {
            if (!source._definition.rules[test.method].multi) {
                obj._singleRules.set(test.name, test);
            }

            obj._rules.push(test);
        }

        // Flags

        if (obj._flags.empty &&
            source._flags.empty) {

            obj._flags.empty = obj._flags.empty.concat(source._flags.empty);
            const flags = Object.assign({}, source._flags);
            delete flags.empty;
            Merge(obj._flags, flags);
        }
        else if (source._flags.empty) {
            obj._flags.empty = source._flags.empty;
            const flags = Object.assign({}, source._flags);
            delete flags.empty;
            Merge(obj._flags, flags);
        }
        else {
            Merge(obj._flags, source._flags);
        }

        // Terms

        for (const key in source.$_terms) {
            const terms = source.$_terms[key];
            if (!terms) {
                if (!obj.$_terms[key]) {
                    obj.$_terms[key] = terms;
                }

                continue;
            }

            if (!obj.$_terms[key]) {
                obj.$_terms[key] = terms.slice();
                continue;
            }

            obj.$_terms[key] = obj.$_terms[key].concat(terms);
        }

        // Rebuild

        return obj.$_mutateRebuild();
    }

    validate(value, options) {

        return Validator.entry(value, this, options);
    }

    validateAsync(value, options) {

        const result = this.validate(value, options);
        if (result.error) {
            throw result.error;
        }

        return result.value;
    }

    // Extensions

    $_addRule(options) {

        // Normalize rule

        if (typeof options === 'string') {
            options = { name: options };
        }

        Assert(options && typeof options === 'object', 'Invalid options');
        Assert(options.name && typeof options.name === 'string', 'Invalid rule name');

        for (const key in options) {
            Assert(key[0] !== '_', 'Cannot set private rule properties');
        }

        const rule = Object.assign({}, options);        // Shallow cloned
        rule._resolve = [];
        rule.method = rule.method || rule.name;

        const definition = this._definition.rules[rule.method];
        const args = rule.args;

        Assert(definition, 'Unknown rule', rule.method);

        // Args

        const obj = this.clone();

        if (args) {
            Assert(Object.keys(args).length === 1 || Object.keys(args).length === this._definition.rules[rule.name].args.length, 'Invalid rule definition for', this.type, rule.name);

            for (const key in args) {
                let arg = args[key];
                if (arg === undefined) {
                    delete args[key];
                    continue;
                }

                if (definition.argsByName) {
                    const resolver = definition.argsByName.get(key);

                    if (resolver.ref &&
                        Common.isResolvable(arg)) {

                        rule._resolve.push(key);
                        obj.$_mutateRegister(arg);
                    }
                    else {
                        if (resolver.normalize) {
                            arg = resolver.normalize(arg);
                            args[key] = arg;
                        }

                        if (resolver.assert) {
                            const error = Common.validateArg(arg, key, resolver);
                            Assert(!error, error, 'or reference');
                        }
                    }
                }

                args[key] = arg;
            }
        }

        // Unique rules

        if (!definition.multi) {
            obj._ruleRemove(rule.name);
            obj._singleRules.set(rule.name, rule);
        }

        if (definition.priority) {
            obj._rules.unshift(rule);
        }
        else {
            obj._rules.push(rule);
        }

        return obj;
    }

    $_compile(schema, options) {

        return Compile.schema(this.$_root, schema, options);
    }

    $_createError(code, value, local, state, prefs, options = {}) {

        const flags = options.flags !== false ? this._flags : {};
        const messages = options.messages ? Messages.merge(this._definition.messages, options.messages) : this._definition.messages;
        return new Errors.Report(code, value, local, flags, messages, state, prefs);
    }

    $_getRule(name) {

        return this._singleRules.get(name);
    }

    $_match(value, state, prefs, overrides) {

        prefs = Object.assign({}, prefs);       // Shallow cloned
        prefs.abortEarly = true;
        prefs._externals = false;

        state.snapshot();
        const result = !Validator.validate(value, this, state, prefs, overrides).errors;
        state.restore();

        return result;
    }

    $_modify(options) {

        Common.assertOptions(options, ['each', 'once', 'ref', 'schema']);
        return Modify.schema(this, options) || this;
    }

    $_mutateRebuild() {

        this._refs.reset();
        this._ids.reset();

        const each = (item, { source, name, path, key }) => {

            const family = this._definition[source][name] && this._definition[source][name].register;
            if (family !== false) {
                this.$_mutateRegister(item, { family, key });
            }
        };

        this.$_modify({ each });

        if (this._definition.rebuild) {
            this._definition.rebuild(this);
        }

        return this;
    }

    $_mutateRegister(schema, { family, key } = {}) {

        this._refs.register(schema, family);
        this._ids.register(schema, { key });
    }

    $_property(name) {

        return this._definition.properties[name];
    }

    $_reach(path) {

        return this._ids.reach(path);
    }

    $_rootReferences() {

        return this._refs.roots();
    }

    $_setFlag(name, value, options = {}) {

        const flag = this._definition.flags[name] || {};
        if (DeepEqual(value, flag.default)) {
            value = undefined;
        }

        if (DeepEqual(value, this._flags[name])) {
            return this;
        }

        const obj = options.clone !== false ? this.clone() : this;

        if (value !== undefined) {
            obj._flags[name] = value;
            obj.$_mutateRegister(value);
        }
        else {
            delete obj._flags[name];
        }

        return obj;
    }

    $_parent(method, ...args) {

        return this[method][Common.symbols.parent].call(this, ...args);
    }

    $_validate(value, state, prefs) {

        return Validator.validate(value, this, state, prefs);
    }

    // Internals

    _assign(target) {

        target.type = this.type;

        target.$_root = this.$_root;

        target.$_temp = Object.assign({}, this.$_temp);
        target.$_temp.whens = {};

        target._ids = this._ids.clone();
        target._preferences = this._preferences;
        target._valids = this._valids && this._valids.clone();
        target._invalids = this._invalids && this._invalids.clone();
        target._rules = this._rules.slice();
        target._singleRules = Clone(this._singleRules, { shallow: true });
        target._refs = this._refs.clone();
        target._flags = Object.assign({}, this._flags);
        target._cache = null;

        target.$_terms = {};
        for (const key in this.$_terms) {
            target.$_terms[key] = this.$_terms[key] ? this.$_terms[key].slice() : null;
        }

        // Backwards compatibility

        target.$_super = {};
        for (const override in this.$_super) {
            target.$_super[override] = this._super[override].bind(target);
        }

        return target;
    }

    _default(flag, value, options = {}) {

        Common.assertOptions(options, 'literal');

        Assert(value !== undefined, 'Missing', flag, 'value');
        Assert(typeof value === 'function' || !options.literal, 'Only function value supports literal option');

        if (typeof value === 'function' &&
            options.literal) {

            value = {
                [Common.symbols.literal]: true,
                literal: value
            };
        }

        const obj = this.$_setFlag(flag, value);
        return obj;
    }

    _extend(options) {

        Assert(!options.base, 'Cannot extend type with another base');

        return Extend.type(this, options);
    }

    _generate(value, state, prefs) {

        if (!this.$_terms.whens) {
            return { schema: this };
        }

        // Collect matching whens

        const whens = [];
        const ids = [];
        for (let i = 0; i < this.$_terms.whens.length; ++i) {
            const when = this.$_terms.whens[i];

            if (when.concat) {
                whens.push(when.concat);
                ids.push(`${i}.concat`);
                continue;
            }

            const input = when.ref ? when.ref.resolve(value, state, prefs) : value;
            const tests = when.is ? [when] : when.switch;
            const before = ids.length;

            for (let j = 0; j < tests.length; ++j) {
                const { is, then, otherwise } = tests[j];

                const baseId = `${i}${when.switch ? '.' + j : ''}`;
                if (is.$_match(input, state.nest(is, `${baseId}.is`), prefs)) {
                    if (then) {
                        const localState = state.localize([...state.path, `${baseId}.then`], state.ancestors, state.schemas);
                        const { schema: generated, id } = then._generate(value, localState, prefs);
                        whens.push(generated);
                        ids.push(`${baseId}.then${id ? `(${id})` : ''}`);
                        break;
                    }
                }
                else if (otherwise) {
                    const localState = state.localize([...state.path, `${baseId}.otherwise`], state.ancestors, state.schemas);
                    const { schema: generated, id } = otherwise._generate(value, localState, prefs);
                    whens.push(generated);
                    ids.push(`${baseId}.otherwise${id ? `(${id})` : ''}`);
                    break;
                }
            }

            if (when.break &&
                ids.length > before) {          // Something matched

                break;
            }
        }

        // Check cache

        const id = ids.join(', ');

        if (!id) {
            return { schema: this };
        }

        if (this.$_temp.whens[id]) {
            return { schema: this.$_temp.whens[id], id };
        }

        // Generate dynamic schema

        let obj = this;                                             // eslint-disable-line consistent-this
        if (this._definition.generate) {
            obj = this._definition.generate(this, value, state, prefs);
        }

        // Apply whens

        for (const when of whens) {
            obj = obj.concat(when);
        }

        // Cache result

        this.$_temp.whens[id] = obj;
        return { schema: obj, id };
    }

    _ruleRemove(name) {

        if (!this._singleRules.has(name)) {
            return this;
        }

        this._singleRules.delete(name);

        const filtered = [];
        for (let i = 0; i < this._rules.length; ++i) {
            const test = this._rules[i];
            if (test.name === name) {
                continue;
            }

            filtered.push(test);
        }

        this._rules = filtered;
    }

    _values(values, key) {

        Common.verifyFlat(values, key.slice(1, -1));

        const obj = this.clone();

        const override = values[0] === Common.symbols.override;
        if (override) {
            values = values.slice(1);
        }

        if (!obj[key] &&
            values.length) {

            obj[key] = new Values();
        }
        else if (override) {
            obj[key] = values.length ? new Values() : null;
            obj.$_mutateRebuild();
        }

        if (!obj[key]) {
            return obj;
        }

        if (override) {
            obj[key].override();
        }

        for (const value of values) {
            Assert(value !== undefined, 'Cannot call allow/valid/invalid with undefined');
            Assert(value !== Common.symbols.override, 'Override must be the first value');

            const other = key === '_invalids' ? '_valids' : '_invalids';
            if (obj[other]) {
                obj[other].remove(value);
                if (!obj[other].length) {
                    Assert(key === '_valids' || !obj._flags.only, 'Setting invalid value', value, 'leaves schema rejecting all values due to previous valid rule');
                    obj[other] = null;
                }
            }

            obj[key].add(value, obj._refs);
        }

        return obj;
    }
};


internals.Base.prototype[Common.symbols.any] = {
    version: Common.version,
    compile: Compile.compile,
    root: '$_root'
};


internals.Base.prototype.isImmutable = true;                // Prevents Hoek from deep cloning schema objects (must be on prototype)


// Aliases

internals.Base.prototype.deny = internals.Base.prototype.invalid;
internals.Base.prototype.disallow = internals.Base.prototype.invalid;
internals.Base.prototype.equal = internals.Base.prototype.valid;
internals.Base.prototype.exist = internals.Base.prototype.required;
internals.Base.prototype.not = internals.Base.prototype.invalid;
internals.Base.prototype.options = internals.Base.prototype.prefs;
internals.Base.prototype.preferences = internals.Base.prototype.prefs;


module.exports = new internals.Base();
