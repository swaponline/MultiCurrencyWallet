'use strict';

const Assert = require('@hapi/hoek/lib/assert');
const Clone = require('@hapi/hoek/lib/clone');
const EscapeHtml = require('@hapi/hoek/lib/escapeHtml');

const Common = require('./common');
const Ref = require('./ref');


const internals = {
    symbol: Symbol('template'),

    opens: new Array(1000).join('\u0000'),
    closes: new Array(1000).join('\u0001'),

    dateFormat: {
        date: Date.prototype.toDateString,
        iso: Date.prototype.toISOString,
        string: Date.prototype.toString,
        time: Date.prototype.toTimeString,
        utc: Date.prototype.toUTCString
    }
};


module.exports = exports = internals.Template = class {

    constructor(source, options) {

        Assert(typeof source === 'string', 'Template source must be a string');
        Assert(!source.includes('\u0000') && !source.includes('\u0001'), 'Template source cannot contain reserved control characters');

        this.source = source;
        this.rendered = source;

        this._template = null;
        this._settings = Clone(options);

        this._parse();
    }

    _parse() {

        // 'text {raw} {{ref}} \\{{ignore}} {{ignore\\}} {{ignore {{ignore}'

        if (!this.source.includes('{')) {
            return;
        }

        // Encode escaped \\{{{{{

        const encoded = internals.encode(this.source);

        // Split on first { in each set

        const parts = internals.split(encoded);

        // Process parts

        const processed = [];
        const head = parts.shift();
        if (head) {
            processed.push(head);
        }

        for (const part of parts) {
            const raw = part[0] !== '{';
            const ender = raw ? '}' : '}}';
            const end = part.indexOf(ender);

            let variable = part.slice(raw ? 0 : 1, end);
            const wrapped = variable[0] === ':';
            if (wrapped) {
                variable = variable.slice(1);
            }

            const dynamic = this._ref(internals.decode(variable), { raw, wrapped });
            processed.push(dynamic);

            const rest = part.slice(end + ender.length);
            if (rest) {
                processed.push(internals.decode(rest));
            }
        }

        this._template = processed;
    }

    static date(date, prefs) {

        return internals.dateFormat[prefs.dateFormat].call(date);
    }

    isDynamic() {

        return !!this._template;
    }

    static isTemplate(template) {

        return template ? !!template[Common.symbols.template] : false;
    }

    render(value, state, prefs, local, options = {}) {

        if (!this.isDynamic()) {
            return this.rendered;
        }

        const parts = [];
        for (const part of this._template) {
            if (typeof part === 'string') {
                parts.push(part);
            }
            else {
                const rendered = part.ref.resolve(value, state, prefs, local, options);
                const string = internals.stringify(rendered, prefs, options.errors);
                const result = part.raw || (options.errors && options.errors.escapeHtml) === false ? string : EscapeHtml(string);
                parts.push(internals.wrap(result, part.wrapped && prefs.errors.wrap.label));
            }
        }

        return parts.join('');
    }

    _ref(content, { raw, wrapped }) {

        const ref = Ref.create(content, this._settings);
        return { ref, raw, wrapped: wrapped || ref.type === 'local' && ref.key === 'label' };
    }

    toString() {

        return this.source;
    }
};


internals.Template.prototype[Common.symbols.template] = true;
internals.Template.prototype.isImmutable = true;                // Prevents Hoek from deep cloning schema objects


internals.encode = function (string) {

    return string
        .replace(/\\(\{+)/g, ($0, $1) => {

            return internals.opens.slice(0, $1.length);
        })
        .replace(/\\(\}+)/g, ($0, $1) => {

            return internals.closes.slice(0, $1.length);
        });
};


internals.decode = function (string) {

    return string
        .replace(/\u0000/g, '{')
        .replace(/\u0001/g, '}');
};


internals.split = function (string) {

    const parts = [];
    let current = '';

    for (let i = 0; i < string.length; ++i) {
        const char = string[i];

        if (char === '{') {
            let next = '';
            while (i + 1 < string.length &&
                string[i + 1] === '{') {

                next += '{';
                ++i;
            }

            parts.push(current);
            current = next;
        }
        else {
            current += char;
        }
    }

    parts.push(current);
    return parts;
};


internals.wrap = function (value, ends) {

    if (!ends) {
        return value;
    }

    if (ends.length === 1) {
        return `${ends}${value}${ends}`;
    }

    return `${ends[0]}${value}${ends[1]}`;
};


internals.stringify = function (value, prefs, options) {

    const type = typeof value;

    if (value === null) {
        return 'null';
    }

    if (value === undefined) {
        return '';
    }

    if (type === 'string') {
        return value;
    }

    if (type === 'number' ||
        type === 'function' ||
        type === 'symbol') {

        return value.toString();
    }

    if (type !== 'object') {
        return JSON.stringify(value);
    }

    if (value instanceof Date) {
        return internals.Template.date(value, prefs);
    }

    if (value instanceof Map) {
        const pairs = [];
        for (const [key, sym] of value.entries()) {
            pairs.push(`${key.toString()} -> ${sym.toString()}`);
        }

        value = pairs;
    }

    if (!Array.isArray(value)) {
        return value.toString();
    }

    let partial = '';
    for (const item of value) {
        partial = partial + (partial.length ? ', ' : '') + internals.stringify(item, prefs, options);
    }

    return internals.wrap(partial, prefs.errors.wrap.array);
};
