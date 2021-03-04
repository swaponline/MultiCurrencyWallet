'use strict';

const Url = require('url');

const Assert = require('@hapi/hoek/lib/assert');
const EscapeRegex = require('@hapi/hoek/lib/escapeRegex');

const Any = require('./any');
const Common = require('../common');


const internals = {
    base64Regex: {
        // paddingRequired
        true: {
            // urlSafe
            true: /^(?:[\w\-]{2}[\w\-]{2})*(?:[\w\-]{2}==|[\w\-]{3}=)?$/,
            false: /^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/
        },
        false: {
            true: /^(?:[\w\-]{2}[\w\-]{2})*(?:[\w\-]{2}(==)?|[\w\-]{3}=?)?$/,
            false: /^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}(==)?|[A-Za-z0-9+\/]{3}=?)?$/
        }
    },
    dataUriRegex: /^data:[\w+.-]+\/[\w+.-]+;((charset=[\w-]+|base64),)?(.*)$/,
    hexRegex: /^[a-f0-9]+$/i,
    isoDurationRegex: /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?$/,

    guidBrackets: {
        '{': '}', '[': ']', '(': ')', '': ''
    },
    guidVersions: {
        uuidv1: '1',
        uuidv2: '2',
        uuidv3: '3',
        uuidv4: '4',
        uuidv5: '5'
    },
    guidSeparators: new Set([undefined, true, false, '-', ':']),

    normalizationForms: ['NFC', 'NFD', 'NFKC', 'NFKD'],

    domainControlRx: /[\x00-\x20@\:\/]/,                                                // Control + space + separators
    domainSegmentRx: /^[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?$/,
    finalSegmentAdditionalRx: /[^0-9]/                                                  // Domain segment which is additionally not all-numeric
};


module.exports = Any._extend({

    type: 'string',

    flags: {

        insensitive: { default: false },
        truncate: { default: false }
    },

    terms: {

        replacements: { init: null }
    },

    coerce: {
        from: 'string',
        method(value, { schema, state, prefs }) {

            const normalize = schema.$_getRule('normalize');
            if (normalize) {
                value = value.normalize(normalize.args.form);
            }

            const casing = schema.$_getRule('case');
            if (casing) {
                value = casing.args.direction === 'upper' ? value.toLocaleUpperCase() : value.toLocaleLowerCase();
            }

            const trim = schema.$_getRule('trim');
            if (trim &&
                trim.args.enabled) {

                value = value.trim();
            }

            if (schema.$_terms.replacements) {
                for (const replacement of schema.$_terms.replacements) {
                    value = value.replace(replacement.pattern, replacement.replacement);
                }
            }

            const hex = schema.$_getRule('hex');
            if (hex &&
                hex.args.options.byteAligned &&
                value.length % 2 !== 0) {

                value = `0${value}`;
            }

            if (schema.$_getRule('isoDate')) {
                const iso = internals.isoDate(value);
                if (iso) {
                    value = iso;
                }
            }

            if (schema._flags.truncate) {
                const rule = schema.$_getRule('max');
                if (rule) {
                    let limit = rule.args.limit;
                    if (Common.isResolvable(limit)) {
                        limit = limit.resolve(value, state, prefs);
                        if (!Common.limit(limit)) {
                            return { value, errors: schema.$_createError('any.ref', limit, { ref: rule.args.limit, arg: 'limit', reason: 'must be a positive integer' }, state, prefs) };
                        }
                    }

                    value = value.slice(0, limit);
                }
            }

            return { value };
        }
    },

    validate(value, { error }) {

        if (typeof value !== 'string') {
            return { value, errors: error('string.base') };
        }

        if (value === '') {
            return { value, errors: error('string.empty') };
        }
    },

    rules: {

        alphanum: {
            method() {

                return this.$_addRule('alphanum');
            },
            validate(value, helpers) {

                if (/^[a-zA-Z0-9]+$/.test(value)) {
                    return value;
                }

                return helpers.error('string.alphanum');
            }
        },

        base64: {
            method(options = {}) {

                Common.assertOptions(options, ['paddingRequired', 'urlSafe']);

                options = { urlSafe: false, paddingRequired: true, ...options };
                Assert(typeof options.paddingRequired === 'boolean', 'paddingRequired must be boolean');
                Assert(typeof options.urlSafe === 'boolean', 'urlSafe must be boolean');

                return this.$_addRule({ name: 'base64', args: { options } });
            },
            validate(value, helpers, { options }) {

                const regex = internals.base64Regex[options.paddingRequired][options.urlSafe];
                if (regex.test(value)) {
                    return value;
                }

                return helpers.error('string.base64');
            }
        },

        case: {
            method(direction) {

                Assert(['lower', 'upper'].includes(direction), 'Invalid case:', direction);

                return this.$_addRule({ name: 'case', args: { direction } });
            },
            validate(value, helpers, { direction }) {

                if (direction === 'lower' && value === value.toLocaleLowerCase() ||
                    direction === 'upper' && value === value.toLocaleUpperCase()) {

                    return value;
                }

                return helpers.error(`string.${direction}case`);
            },
            convert: true
        },

        creditCard: {
            method() {

                return this.$_addRule('creditCard');
            },
            validate(value, helpers) {

                let i = value.length;
                let sum = 0;
                let mul = 1;

                while (i--) {
                    const char = value.charAt(i) * mul;
                    sum = sum + (char - (char > 9) * 9);
                    mul = mul ^ 3;
                }

                if (sum > 0 &&
                    sum % 10 === 0) {

                    return value;
                }

                return helpers.error('string.creditCard');
            }
        },

        dataUri: {
            method(options = {}) {

                Common.assertOptions(options, ['paddingRequired']);

                options = { paddingRequired: true, ...options };
                Assert(typeof options.paddingRequired === 'boolean', 'paddingRequired must be boolean');

                return this.$_addRule({ name: 'dataUri', args: { options } });
            },
            validate(value, helpers, { options }) {

                const matches = value.match(internals.dataUriRegex);

                if (matches) {
                    if (!matches[2]) {
                        return value;
                    }

                    if (matches[2] !== 'base64') {
                        return value;
                    }

                    const base64regex = internals.base64Regex[options.paddingRequired].false;
                    if (base64regex.test(matches[3])) {
                        return value;
                    }
                }

                return helpers.error('string.dataUri');
            }
        },

        guid: {
            alias: 'uuid',
            method(options = {}) {

                Common.assertOptions(options, ['version', 'separator']);

                let versionNumbers = '';

                if (options.version) {
                    const versions = [].concat(options.version);

                    Assert(versions.length >= 1, 'version must have at least 1 valid version specified');
                    const set = new Set();

                    for (let i = 0; i < versions.length; ++i) {
                        const version = versions[i];
                        Assert(typeof version === 'string', 'version at position ' + i + ' must be a string');
                        const versionNumber = internals.guidVersions[version.toLowerCase()];
                        Assert(versionNumber, 'version at position ' + i + ' must be one of ' + Object.keys(internals.guidVersions).join(', '));
                        Assert(!set.has(versionNumber), 'version at position ' + i + ' must not be a duplicate');

                        versionNumbers += versionNumber;
                        set.add(versionNumber);
                    }
                }

                Assert(internals.guidSeparators.has(options.separator), 'separator must be one of true, false, "-", or ":"');
                const separator = options.separator === undefined ? '[:-]?' :
                    options.separator === true ? '[:-]' :
                        options.separator === false ? '[]?' : `\\${options.separator}`;

                const regex = new RegExp(`^([\\[{\\(]?)[0-9A-F]{8}(${separator})[0-9A-F]{4}\\2?[${versionNumbers || '0-9A-F'}][0-9A-F]{3}\\2?[${versionNumbers ? '89AB' : '0-9A-F'}][0-9A-F]{3}\\2?[0-9A-F]{12}([\\]}\\)]?)$`, 'i');

                return this.$_addRule({ name: 'guid', args: { options }, regex });
            },
            validate(value, helpers, args, { regex }) {

                const results = regex.exec(value);

                if (!results) {
                    return helpers.error('string.guid');
                }

                // Matching braces

                if (internals.guidBrackets[results[1]] !== results[results.length - 1]) {
                    return helpers.error('string.guid');
                }

                return value;
            }
        },

        hex: {
            method(options = {}) {

                Common.assertOptions(options, ['byteAligned']);

                options = { byteAligned: false, ...options };
                Assert(typeof options.byteAligned === 'boolean', 'byteAligned must be boolean');

                return this.$_addRule({ name: 'hex', args: { options } });
            },
            validate(value, helpers, { options }) {

                if (!internals.hexRegex.test(value)) {
                    return helpers.error('string.hex');
                }

                if (options.byteAligned &&
                    value.length % 2 !== 0) {

                    return helpers.error('string.hexAlign');
                }

                return value;
            }
        },

        hostname: {
            method() {

                return this.$_addRule('hostname');
            },
            validate(value, helpers) {

                if (internals.isDomainValid(value) ||
                    internals.ipRegex.test(value)) {

                    return value;
                }

                return helpers.error('string.hostname');
            }
        },

        insensitive: {
            method() {

                return this.$_setFlag('insensitive', true);
            }
        },

        isoDate: {
            method() {

                return this.$_addRule('isoDate');
            },
            validate(value, { error }) {

                if (internals.isoDate(value)) {
                    return value;
                }

                return error('string.isoDate');
            }
        },

        isoDuration: {
            method() {

                return this.$_addRule('isoDuration');
            },
            validate(value, helpers) {

                if (internals.isoDurationRegex.test(value)) {
                    return value;
                }

                return helpers.error('string.isoDuration');
            }
        },

        length: {
            method(limit, encoding) {

                return internals.length(this, 'length', limit, '=', encoding);
            },
            validate(value, helpers, { limit, encoding }, { name, operator, args }) {

                const length = encoding ? Buffer && Buffer.byteLength(value, encoding) : value.length;      // $lab:coverage:ignore$
                if (Common.compare(length, limit, operator)) {
                    return value;
                }

                return helpers.error('string.' + name, { limit: args.limit, value, encoding });
            },
            args: [
                {
                    name: 'limit',
                    ref: true,
                    assert: Common.limit,
                    message: 'must be a positive integer'
                },
                'encoding'
            ]
        },

        lowercase: {
            method() {

                return this.case('lower');
            }
        },

        max: {
            method(limit, encoding) {

                return internals.length(this, 'max', limit, '<=', encoding);
            },
            args: ['limit', 'encoding']
        },

        min: {
            method(limit, encoding) {

                return internals.length(this, 'min', limit, '>=', encoding);
            },
            args: ['limit', 'encoding']
        },

        normalize: {
            method(form = 'NFC') {

                Assert(internals.normalizationForms.includes(form), 'normalization form must be one of ' + internals.normalizationForms.join(', '));

                return this.$_addRule({ name: 'normalize', args: { form } });
            },
            validate(value, { error }, { form }) {

                if (value === value.normalize(form)) {
                    return value;
                }

                return error('string.normalize', { value, form });
            },
            convert: true
        },

        pattern: {
            alias: 'regex',
            method(regex, options = {}) {

                Assert(regex instanceof RegExp, 'regex must be a RegExp');
                Assert(!regex.flags.includes('g') && !regex.flags.includes('y'), 'regex should not use global or sticky mode');

                if (typeof options === 'string') {
                    options = { name: options };
                }

                Common.assertOptions(options, ['invert', 'name']);

                const errorCode = ['string.pattern', options.invert ? '.invert' : '', options.name ? '.name' : '.base'].join('');
                return this.$_addRule({ name: 'pattern', args: { regex, options }, errorCode });
            },
            validate(value, helpers, { regex, options }, { errorCode }) {

                const patternMatch = regex.test(value);

                if (patternMatch ^ options.invert) {
                    return value;
                }

                return helpers.error(errorCode, { name: options.name, regex, value });
            },
            args: ['regex', 'options'],
            multi: true
        },

        replace: {
            method(pattern, replacement) {

                if (typeof pattern === 'string') {
                    pattern = new RegExp(EscapeRegex(pattern), 'g');
                }

                Assert(pattern instanceof RegExp, 'pattern must be a RegExp');
                Assert(typeof replacement === 'string', 'replacement must be a String');

                const obj = this.clone();

                if (!obj.$_terms.replacements) {
                    obj.$_terms.replacements = [];
                }

                obj.$_terms.replacements.push({ pattern, replacement });
                return obj;
            }
        },

        token: {
            method() {

                return this.$_addRule('token');
            },
            validate(value, helpers) {

                if (/^\w+$/.test(value)) {
                    return value;
                }

                return helpers.error('string.token');
            }
        },

        trim: {
            method(enabled = true) {

                Assert(typeof enabled === 'boolean', 'enabled must be a boolean');

                return this.$_addRule({ name: 'trim', args: { enabled } });
            },
            validate(value, helpers, { enabled }) {

                if (!enabled ||
                    value === value.trim()) {

                    return value;
                }

                return helpers.error('string.trim');
            },
            convert: true
        },

        truncate: {
            method(enabled = true) {

                Assert(typeof enabled === 'boolean', 'enabled must be a boolean');

                return this.$_setFlag('truncate', enabled);
            }
        },

        uppercase: {
            method() {

                return this.case('upper');
            }
        }
    },

    messages: {
        'string.alphanum': '{{#label}} must only contain alpha-numeric characters',
        'string.base': '{{#label}} must be a string',
        'string.base64': '{{#label}} must be a valid base64 string',
        'string.creditCard': '{{#label}} must be a credit card',
        'string.dataUri': '{{#label}} must be a valid dataUri string',
        'string.empty': '{{#label}} is not allowed to be empty',
        'string.guid': '{{#label}} must be a valid GUID',
        'string.hex': '{{#label}} must only contain hexadecimal characters',
        'string.hexAlign': '{{#label}} hex decoded representation must be byte aligned',
        'string.hostname': '{{#label}} must be a valid hostname',
        'string.isoDate': '{{#label}} must be in iso format',
        'string.isoDuration': '{{#label}} must be a valid ISO 8601 duration',
        'string.length': '{{#label}} length must be {{#limit}} characters long',
        'string.lowercase': '{{#label}} must only contain lowercase characters',
        'string.max': '{{#label}} length must be less than or equal to {{#limit}} characters long',
        'string.min': '{{#label}} length must be at least {{#limit}} characters long',
        'string.normalize': '{{#label}} must be unicode normalized in the {{#form}} form',
        'string.token': '{{#label}} must only contain alpha-numeric and underscore characters',
        'string.pattern.base': '{{#label}} with value {:.} fails to match the required pattern: {{#regex}}',
        'string.pattern.name': '{{#label}} with value {:.} fails to match the {{#name}} pattern',
        'string.pattern.invert.base': '{{#label}} with value {:.} matches the inverted pattern: {{#regex}}',
        'string.pattern.invert.name': '{{#label}} with value {:.} matches the inverted {{#name}} pattern',
        'string.trim': '{{#label}} must not have leading or trailing whitespace',
        'string.uppercase': '{{#label}} must only contain uppercase characters'
    }
});


// Helpers

internals.isoDate = function (value) {

    if (!Common.isIsoDate(value)) {
        return null;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
};


internals.length = function (schema, name, limit, operator, encoding) {

    Assert(!encoding || Buffer && Buffer.isEncoding(encoding), 'Invalid encoding:', encoding);      // $lab:coverage:ignore$

    return schema.$_addRule({ name, method: 'length', args: { limit, encoding }, operator });
};


internals.rfc3986 = function () {

    const rfc3986 = {};

    const hexDigit = '\\dA-Fa-f';                                               // HEXDIG = DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
    const hexDigitOnly = '[' + hexDigit + ']';

    const unreserved = '\\w-\\.~';                                              // unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"
    const subDelims = '!\\$&\'\\(\\)\\*\\+,;=';                                 // sub-delims = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
    const decOctect = '(?:0{0,2}\\d|0?[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])';     // dec-octet = DIGIT / %x31-39 DIGIT / "1" 2DIGIT / "2" %x30-34 DIGIT / "25" %x30-35  ; 0-9 / 10-99 / 100-199 / 200-249 / 250-255

    rfc3986.ipv4 = '(?:' + decOctect + '\\.){3}' + decOctect;            // IPv4address = dec-octet "." dec-octet "." dec-octet "." dec-octet

    /*
        h16 = 1*4HEXDIG ; 16 bits of address represented in hexadecimal
        ls32 = ( h16 ":" h16 ) / IPv4address ; least-significant 32 bits of address
        IPv6address =                            6( h16 ":" ) ls32
                    /                       "::" 5( h16 ":" ) ls32
                    / [               h16 ] "::" 4( h16 ":" ) ls32
                    / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
                    / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
                    / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
                    / [ *4( h16 ":" ) h16 ] "::"              ls32
                    / [ *5( h16 ":" ) h16 ] "::"              h16
                    / [ *6( h16 ":" ) h16 ] "::"
    */

    const h16 = hexDigitOnly + '{1,4}';
    const ls32 = '(?:' + h16 + ':' + h16 + '|' + rfc3986.ipv4 + ')';
    const IPv6SixHex = '(?:' + h16 + ':){6}' + ls32;
    const IPv6FiveHex = '::(?:' + h16 + ':){5}' + ls32;
    const IPv6FourHex = '(?:' + h16 + ')?::(?:' + h16 + ':){4}' + ls32;
    const IPv6ThreeHex = '(?:(?:' + h16 + ':){0,1}' + h16 + ')?::(?:' + h16 + ':){3}' + ls32;
    const IPv6TwoHex = '(?:(?:' + h16 + ':){0,2}' + h16 + ')?::(?:' + h16 + ':){2}' + ls32;
    const IPv6OneHex = '(?:(?:' + h16 + ':){0,3}' + h16 + ')?::' + h16 + ':' + ls32;
    const IPv6NoneHex = '(?:(?:' + h16 + ':){0,4}' + h16 + ')?::' + ls32;
    const IPv6NoneHex2 = '(?:(?:' + h16 + ':){0,5}' + h16 + ')?::' + h16;
    const IPv6NoneHex3 = '(?:(?:' + h16 + ':){0,6}' + h16 + ')?::';

    rfc3986.v4Cidr = '(?:\\d|[1-2]\\d|3[0-2])';                                           // IPv4 cidr = DIGIT / %x31-32 DIGIT / "3" %x30-32  ; 0-9 / 10-29 / 30-32
    rfc3986.v6Cidr = '(?:0{0,2}\\d|0?[1-9]\\d|1[01]\\d|12[0-8])';                         // IPv6 cidr = DIGIT / %x31-39 DIGIT / "1" %x0-1 DIGIT / "12" %x0-8;   0-9 / 10-99 / 100-119 / 120-128
    rfc3986.ipv6 = '(?:' + IPv6SixHex + '|' + IPv6FiveHex + '|' + IPv6FourHex + '|' + IPv6ThreeHex + '|' + IPv6TwoHex + '|' + IPv6OneHex + '|' + IPv6NoneHex + '|' + IPv6NoneHex2 + '|' + IPv6NoneHex3 + ')';
    rfc3986.ipvfuture = 'v' + hexDigitOnly + '+\\.[' + unreserved + subDelims + ':]+';      // IPvFuture = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )
    return rfc3986;
};


internals.ipRegex = (function () {

    const versions = ['ipv4', 'ipv6', 'ipvfuture'];

    // Regex

    const rfc3986 = internals.rfc3986();
    const parts = versions.map((version) => {

        const cidrpart = `\\/${version === 'ipv4' ? rfc3986.v4Cidr : rfc3986.v6Cidr}`;

        return `${rfc3986[version]}(?:${cidrpart})?`;
    });

    const raw = `(?:${parts.join('|')})`;
    return new RegExp(`^${raw}$`);
})();


internals.isDomainValid = function (domain) {

    if (domain.length > 256) {
        return false;
    }

    domain = domain.normalize('NFC');

    if (internals.domainControlRx.test(domain)) {
        return false;
    }

    domain = internals.punycode(domain);

    const segments = domain.split('.');

    for (let i = 0; i < segments.length; ++i) {
        const segment = segments[i];

        if (!segment.length) {
            return false;
        }

        if (segment.length > 63) {
            return false;
        }

        // Here we're following RFC 1035 and 1123, plus 3696's clarification
        // that the final segment may contain numbers but not be all-numeric.
        // Docker containers, for example, are assigned hostnames which are hex
        // strings (no dots) that may start with a numeric digit.

        if (!internals.domainSegmentRx.test(segment)) {
            return false;
        }

        const isFinalSegment = i === segments.length - 1;

        if (isFinalSegment && !internals.finalSegmentAdditionalRx.test(segment)) {
            return false;
        }
    }

    return true;
};


internals.punycode = function (domain) {

    try {
        return new Url.URL(`http://${domain}`).host;
    }
    catch (err) {
        return domain;
    }
};
