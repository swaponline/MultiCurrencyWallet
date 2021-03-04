/*!
 * nano-cache
 * Copyright (c) 2017 Cxense Inc
 * Authors:  aziz.khoury@cxense.com, greg.kindel@cxense.com
 * MIT license https://opensource.org/licenses/MIT
 */

var extend = require("extend");
var zlib = require('zlib');
var os = require('os');
var EventEmitter = require('events').EventEmitter;

var NanoCache = function (options) {
    this.init(options);
};

NanoCache.SIZE = {
    GB :  Math.pow(2, 30),
    MB :  Math.pow(2, 20),
    KB :  Math.pow(2, 10)
};

NanoCache.DEFAULTS = {
    ttl: null,   // msec
    limit: null, // hits
    bytes: Infinity,
    compress: true,
    minFreeMem : 0,
    maxEvictBytes : os.totalmem() * .05
};

NanoCache.prototype = extend(true, {}, Object.create(EventEmitter.prototype), {
    init : function (opt) {
        this.options = extend({}, NanoCache.DEFAULTS, opt);
        this.hits = 0;
        this.evictions = 0;
        this.misses = 0;
        this._lastAccess = [];
        this.clear();
    },

    get: function (key) {
        this._checkExpired(key);

        var datum = this._data[key];
        if (!datum) {
            this.misses++;
            return null;
        }

        var value = this._value(key);

        this.hits++;
        datum.hits++;
        datum.accessed = this.now();
        this._updateActiveIndex(datum.key);

        this.asyncExpireCheck();

        this.emit('get', key);
        return value;
    },

    _updateActiveIndex : function (key) {
        this._removeFromActive(key);
        this._lastAccess.push(key);
    },

    _removeFromActive : function (key){
        var la = this._lastAccess;
        for(var i = la.length - 1; i >= 0; i--){
            if(la[i] === key){
                la.splice(i, 1);
                break;
            }
        }
    },

    asyncExpireCheck : function () {
        var self = this;
        clearTimeout(this._asyncCheck);
        this._asyncCheck = setTimeout(function () {
            self._asyncCheck = null;
            self.clearExpired();
        }, 0);
    },

    set: function (key, value, options) {
        var opt = extend({}, this.options, options);

        this.del(key);

        var epoch = this.now();
        var json = JSON.stringify(value);

        var store_value = opt.compress
            ? zlib.deflateRawSync(json)
            : json;

        var store_buffer = Buffer.from(store_value);
        var bytes = Buffer.byteLength(store_buffer, 'utf8');

        var datum = {
            key: key,
            hits : 0,
            accessed : epoch,
            updated : epoch,
            expires :  null,
            value : store_buffer,
            bytes : bytes,
            ttl: opt.ttl,
            compressed: opt.compress,
            cost: opt.cost || 1,
            limit: opt.limit
        };

        this._data[key] = datum;

        this.bytes += datum.bytes;

        var ttl = parseInt(datum.ttl, 10);
        if (!isNaN(ttl)) {
            datum.expires = epoch + ttl;
        }

        if (opt.expires instanceof Date) {
            opt.expires = opt.expires.getTime();
        }

        if (opt.expires > 0) {
            datum.expires = opt.expires;
        }

        this._updateActiveIndex(datum.key);
        this._checkLimits();

        this.emit('set', key);
        return value;
    },

    info : function (key) {
        var datum = this._data[key];
        if (!datum) {
            return null;
        }
        return extend({}, datum, {
            value: this._value(key)
        });
    },

    _value : function (key) {
        var datum =  this._data[key];
        if (!datum.value) {
            return null;
        }
        var value = (datum.compressed)
            ? zlib.inflateRawSync(datum.value)
            : datum.value;

        return datum && JSON.parse(value);
    },

    del: function (key) {
        var info  = this.info(key);
        if (!info) {
            return null;
        }
        this.bytes -= info.bytes;
        delete this._data[key];
        this._removeFromActive(key);
        this.emit('del', key);
        return info.value;
    },

    clear: function () {
        this._data = {};
        this.bytes = 0;
        this.emit('clear');
    },

    clearExpired: function () {
        Object.keys(this._data).forEach(this._checkExpired.bind(this));
    },

    _checkExpired : function (key) {
        if (this.isExpired(key)) {
            this.del(key);
        }
    },

    _checkLimits : function () {
        this.clearExpired();

        if (this.options.maxBytes) {
            this._doEviction(function () {
                var stats = this.stats();
                return stats.bytes > this.options.maxBytes;
            }.bind(this));
        }

        // check hard memory constraints
        this._doEviction(function () {
            return os.freemem() < this.options.minFreeMem;
        }.bind(this));

        // manual garbage collection can be enabled with `node --expose-gc`
        if( global.gc ){
            global.gc();
        }
    },

    isExpired : function (key) {
        return this.isTTLExpired(key) || this.isLimitReached(key);
    },

    isTTLExpired: function (key) {
        var datum = this._data[key];
        return datum && datum.expires > 0 && datum.expires <= this.now();
    },

    isLimitReached: function (key) {
        var datum = this._data[key];
        return datum && datum.limit > 0 && datum.limit <= datum.hits;
    },

    now : function () {
        return (new Date()).getTime();
    },

    stats : function () {
        var oldest = this._data[this._lastAccess[0]];
        return {
            count: this._lastAccess.length,
            age : oldest && this.now() - oldest.accessed,
            hits : this.hits,
            evictions: this.evictions,
            misses : this.misses,
            bytes: this.bytes
        };
    },

    _doEviction : function (callback) {
        var keepGoing = callback();
        if (!keepGoing) {
            return;
        }

        var sorted  = this._lastAccess;
        var maxEvictBytes = this.options.maxEvictBytes;
        var bytes;
        while (keepGoing && sorted.length && maxEvictBytes > 0 ) {
            var key = sorted.shift();
            bytes = this._data[key].bytes;
            maxEvictBytes -= bytes;
            this.evictions++;
            this.del( key );
            keepGoing = callback();
        }
    }
});

// make it usable even without creating an instance of it.
// basically creating an instance, then copying all non-underscore-starting-functions to the factory
NanoCache.singleton = new NanoCache();
Object.keys(NanoCache.prototype).forEach(function (key) {
    if (typeof NanoCache.singleton[key] === 'function' && key.indexOf('_') !== 0) {
        NanoCache[key] = NanoCache.prototype[key].bind(NanoCache.singleton);
    }
});

module.exports = NanoCache;
