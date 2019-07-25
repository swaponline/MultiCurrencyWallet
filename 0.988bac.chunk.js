webpackJsonp([0],{

/***/ 3267:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(19);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = __webpack_require__(179);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ecc = __webpack_require__(276);
var Fcbuffer = __webpack_require__(3268);
var EosApi = __webpack_require__(3270);
var assert = __webpack_require__(23);

var Structs = __webpack_require__(3269);
var AbiCache = __webpack_require__(3293);
var writeApiGen = __webpack_require__(3294);
var format = __webpack_require__(3273);
var schema = __webpack_require__(3272);

var token = __webpack_require__(3295);
var system = __webpack_require__(3296);
var eosio_null = __webpack_require__(3297);

var Eos = function Eos() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var configDefaults = {
    httpEndpoint: 'http://127.0.0.1:8888',
    debug: false,
    verbose: false,
    broadcast: true,
    logger: {
      log: function log() {
        var _console;

        return config.verbose ? (_console = console).log.apply(_console, arguments) : null;
      },
      error: function error() {
        var _console2;

        return config.verbose ? (_console2 = console).error.apply(_console2, arguments) : null;
      }
    },
    sign: true
  };

  function applyDefaults(target, defaults) {
    Object.keys(defaults).forEach(function (key) {
      if (target[key] === undefined) {
        target[key] = defaults[key];
      }
    });
  }

  applyDefaults(config, configDefaults);
  applyDefaults(config.logger, configDefaults.logger);
  return createEos(config);
};

module.exports = Eos;

Object.assign(Eos, {
  version: '16.0.0',
  modules: {
    format: format,
    api: EosApi,
    ecc: ecc,
    json: {
      api: EosApi.api,
      schema: schema
    },
    Fcbuffer: Fcbuffer
  },

  /** @deprecated */
  Testnet: function Testnet(config) {
    console.error('deprecated, change Eos.Testnet(..) to just Eos(..)');
    return Eos(config);
  },

  /** @deprecated */
  Localnet: function Localnet(config) {
    console.error('deprecated, change Eos.Localnet(..) to just Eos(..)');
    return Eos(config);
  }
});

function createEos(config) {
  var network = config.httpEndpoint != null ? EosApi(config) : null;
  config.network = network;

  var abis = [];
  var abiCache = AbiCache(network, config);
  abis.push(abiCache.abi('eosio.null', eosio_null));
  abis.push(abiCache.abi('eosio.token', token));
  abis.push(abiCache.abi('eosio', system));

  if (!config.chainId) {
    config.chainId = 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f';
  }

  if (network) {
    checkChainId(network, config.chainId, config.logger);
  }

  if (config.mockTransactions != null) {
    if (typeof config.mockTransactions === 'string') {
      var mock = config.mockTransactions;
      config.mockTransactions = function () {
        return mock;
      };
    }
    assert.equal((0, _typeof3.default)(config.mockTransactions), 'function', 'config.mockTransactions');
  }

  var _Structs = Structs(config),
      structs = _Structs.structs,
      types = _Structs.types,
      fromBuffer = _Structs.fromBuffer,
      toBuffer = _Structs.toBuffer;

  var eos = mergeWriteFunctions(config, EosApi, structs, abis);

  Object.assign(eos, {
    config: safeConfig(config),
    fc: {
      structs: structs,
      types: types,
      fromBuffer: fromBuffer,
      toBuffer: toBuffer,
      abiCache: abiCache
    },
    // Repeat of static Eos.modules, help apps that use dependency injection
    modules: {
      format: format
    }
  });

  if (!config.signProvider) {
    config.signProvider = defaultSignProvider(eos, config);
  }

  return eos;
}

/**
  Set each property as read-only, read-write, no-access.  This is shallow
  in that it applies only to the root object and does not limit access
  to properties under a given object.
*/
function safeConfig(config) {
  // access control is shallow references only
  var readOnly = new Set(['httpEndpoint', 'abiCache', 'chainId', 'expireInSeconds']);
  var readWrite = new Set(['verbose', 'debug', 'broadcast', 'logger', 'sign']);
  var protectedConfig = {};

  Object.keys(config).forEach(function (key) {
    Object.defineProperty(protectedConfig, key, {
      set: function set(value) {
        if (readWrite.has(key)) {
          config[key] = value;
          return;
        }
        throw new Error('Access denied');
      },

      get: function get() {
        if (readOnly.has(key) || readWrite.has(key)) {
          return config[key];
        }
        throw new Error('Access denied');
      }
    });
  });
  return protectedConfig;
}

/**
  Merge in write functions (operations).  Tested against existing methods for
  name conflicts.

  @arg {object} config.network - read-only api calls
  @arg {object} EosApi - api[EosApi] read-only api calls
  @return {object} - read and write method calls (create and sign transactions)
  @throw {TypeError} if a funciton name conflicts
*/
function mergeWriteFunctions(config, EosApi, structs, abis) {
  var network = config.network;


  var merge = Object.assign({}, network);

  var writeApi = writeApiGen(EosApi, network, structs, config, abis);
  throwOnDuplicate(merge, writeApi, 'Conflicting methods in EosApi and Transaction Api');
  Object.assign(merge, writeApi);

  return merge;
}

function throwOnDuplicate(o1, o2, msg) {
  for (var key in o1) {
    if (o2[key]) {
      throw new TypeError(msg + ': ' + key);
    }
  }
}

/**
  The default sign provider is designed to interact with the available public
  keys (maybe just one), the transaction, and the blockchain to figure out
  the minimum set of signing keys.

  If only one key is available, the blockchain API calls are skipped and that
  key is used to sign the transaction.
*/
var defaultSignProvider = function defaultSignProvider(eos, config) {
  return function _callee(_ref) {
    var sign = _ref.sign,
        buf = _ref.buf,
        transaction = _ref.transaction,
        optionsKeyProvider = _ref.optionsKeyProvider;

    var keyProvider, keys, pvt, sigs, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key, keyMap, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _key, isPrivate, isPublic, pubkeys;

    return _regenerator2.default.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // optionsKeyProvider is a per-action key: await eos.someAction('user2' .., {keyProvider: privateKey2})
            keyProvider = optionsKeyProvider ? optionsKeyProvider : config.keyProvider;

            if (keyProvider) {
              _context.next = 3;
              break;
            }

            throw new TypeError('This transaction requires a keyProvider for signing');

          case 3:
            keys = keyProvider;

            if (typeof keyProvider === 'function') {
              keys = keyProvider({ transaction: transaction });
            }

            // keyProvider may return keys or Promise<keys>
            _context.next = 7;
            return _regenerator2.default.awrap(Promise.resolve(keys));

          case 7:
            keys = _context.sent;


            if (!Array.isArray(keys)) {
              keys = [keys];
            }

            keys = keys.map(function (key) {
              try {
                // normalize format (WIF => PVT_K1_base58privateKey)
                return { private: ecc.PrivateKey(key).toString() };
              } catch (e) {
                // normalize format (EOSKey => PUB_K1_base58publicKey)
                return { public: ecc.PublicKey(key).toString() };
              }
              assert(false, 'expecting public or private keys from keyProvider');
            });

            if (keys.length) {
              _context.next = 12;
              break;
            }

            throw new Error('missing key, check your keyProvider');

          case 12:
            if (!(keys.length === 1 && keys[0].private)) {
              _context.next = 15;
              break;
            }

            pvt = keys[0].private;
            return _context.abrupt('return', sign(buf, pvt));

          case 15:
            if (!(config.httpEndpoint == null)) {
              _context.next = 37;
              break;
            }

            sigs = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 20;

            for (_iterator = keys[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              key = _step.value;

              sigs.push(sign(buf, key.private));
            }
            _context.next = 28;
            break;

          case 24:
            _context.prev = 24;
            _context.t0 = _context['catch'](20);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 28:
            _context.prev = 28;
            _context.prev = 29;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 31:
            _context.prev = 31;

            if (!_didIteratorError) {
              _context.next = 34;
              break;
            }

            throw _iteratorError;

          case 34:
            return _context.finish(31);

          case 35:
            return _context.finish(28);

          case 36:
            return _context.abrupt('return', sigs);

          case 37:
            keyMap = new Map();

            // keys are either public or private keys

            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 41;
            for (_iterator2 = keys[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              _key = _step2.value;
              isPrivate = _key.private != null;
              isPublic = _key.public != null;


              if (isPrivate) {
                keyMap.set(ecc.privateToPublic(_key.private), _key.private);
              } else {
                keyMap.set(_key.public, null);
              }
            }

            _context.next = 49;
            break;

          case 45:
            _context.prev = 45;
            _context.t1 = _context['catch'](41);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t1;

          case 49:
            _context.prev = 49;
            _context.prev = 50;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 52:
            _context.prev = 52;

            if (!_didIteratorError2) {
              _context.next = 55;
              break;
            }

            throw _iteratorError2;

          case 55:
            return _context.finish(52);

          case 56:
            return _context.finish(49);

          case 57:
            pubkeys = Array.from(keyMap.keys());
            return _context.abrupt('return', eos.getRequiredKeys(transaction, pubkeys).then(function (_ref2) {
              var required_keys = _ref2.required_keys;

              if (!required_keys.length) {
                throw new Error('missing required keys for ' + JSON.stringify(transaction));
              }

              var pvts = [],
                  missingKeys = [];

              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                for (var _iterator3 = required_keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  var requiredKey = _step3.value;

                  // normalize (EOSKey.. => PUB_K1_Key..)
                  requiredKey = ecc.PublicKey(requiredKey).toString();

                  var wif = keyMap.get(requiredKey);
                  if (wif) {
                    pvts.push(wif);
                  } else {
                    missingKeys.push(requiredKey);
                  }
                }
              } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                  }
                } finally {
                  if (_didIteratorError3) {
                    throw _iteratorError3;
                  }
                }
              }

              if (missingKeys.length !== 0) {
                assert(typeof keyProvider === 'function', 'keyProvider function is needed for private key lookup');

                // const pubkeys = missingKeys.map(key => ecc.PublicKey(key).toStringLegacy())
                keyProvider({ pubkeys: missingKeys }).forEach(function (pvt) {
                  pvts.push(pvt);
                });
              }

              var sigs = [];
              var _iteratorNormalCompletion4 = true;
              var _didIteratorError4 = false;
              var _iteratorError4 = undefined;

              try {
                for (var _iterator4 = pvts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                  var _pvt = _step4.value;

                  sigs.push(sign(buf, _pvt));
                }
              } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                  }
                } finally {
                  if (_didIteratorError4) {
                    throw _iteratorError4;
                  }
                }
              }

              return sigs;
            }));

          case 59:
          case 'end':
            return _context.stop();
        }
      }
    }, null, this, [[20, 24, 28, 36], [29,, 31, 35], [41, 45, 49, 57], [50,, 52, 56]]);
  };
};

function checkChainId(network, chainId, logger) {
  network.getInfo({}).then(function (info) {
    if (info.chain_id !== chainId) {
      if (logger.log) {
        logger.log('chainId mismatch, signatures will not match transaction authority. ' + ('expected ' + chainId + ' !== actual ' + info.chain_id));
      }
    }
  }).catch(function (error) {
    if (logger.error) {
      logger.error('Warning, unable to validate chainId: ' + error.message);
    }
  });
}

/***/ }),

/***/ 3268:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Types = __webpack_require__(3274);
var Fcbuffer = __webpack_require__(3276);
var assert = __webpack_require__(23);

var create = Fcbuffer.create;

/**
  @typedef {object} SerializerConfig
  @property {boolean} [SerializerConfig.defaults = false] - Insert in defaults (like 0, false, '000...', or '') for any missing values.  This helps test and inspect what a definition should look like.  Do not enable in production.
  @property {boolean} [SerializerConfig.debug = false] - Prints lots of HEX and field-level information to help debug binary serialization.
  @property {object} [customTypes] - Add or overwrite low level types (see ./src/types.js `const types = {...}`).
*/

/**
  @typedef {object} CreateStruct
  @property {Array<String>} CreateStruct.errors - If any errors exists, no struts will be created.
  @property {Object} CreateStruct.struct - Struct objects keyed by definition name.
  @property {String} CreateStruct.struct.structName - Struct object that will serialize this type.
  @property {Struct} CreateStruct.struct.struct - Struct object that will serialize this type (see ./src/struct.js).
*/

/**
  @arg {object} definitions - examples https://github.com/EOSIO/eosjs-json/blob/master/schema
  @arg {SerializerConfig} config
  @return {CreateStruct}
*/

module.exports = function (definitions) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if ((typeof definitions === 'undefined' ? 'undefined' : _typeof(definitions)) !== 'object') {
    throw new TypeError('definitions is a required parameter');
  }

  if (config.customTypes) {
    definitions = Object.assign({}, definitions); //clone
    for (var key in config.customTypes) {
      // custom types overwrite definitions
      delete definitions[key];
    }
  }

  var types = Types(config);

  var _create = create(definitions, types),
      errors = _create.errors,
      structs = _create.structs;

  /** Extend with more JSON schema and type definitions */


  var _extend = function _extend(parent, child) {
    var combined = Object.assign({}, parent, child);

    var _create2 = create(combined, types),
        structs = _create2.structs,
        errors = _create2.errors;

    return {
      errors: errors,
      structs: structs,
      extend: function extend(child) {
        return _extend(combined, child);
      },
      fromBuffer: fromBuffer(types, structs),
      toBuffer: toBuffer(types, structs)
    };
  };

  return {
    errors: errors,
    structs: structs,
    types: types,
    extend: function extend(child) {
      return _extend(definitions, child);
    },

    /**
      @arg {string} typeName lookup struct or type by name
      @arg {Buffer} buf serialized data to be parsed
      @return {object} deserialized object
    */
    fromBuffer: fromBuffer(types, structs),

    /**
      @arg {string} typeName lookup struct or type by name
      @arg {Object} object for serialization
      @return {Buffer} serialized object
    */
    toBuffer: toBuffer(types, structs)
  };
};

var fromBuffer = function fromBuffer(types, structs) {
  return function (typeName, buf) {
    assert.equal(typeof typeName === 'undefined' ? 'undefined' : _typeof(typeName), 'string', 'typeName (type or struct name)');
    if (typeof buf === 'string') {
      buf = Buffer.from(buf, 'hex');
    }
    assert(Buffer.isBuffer(buf), 'expecting buf<hex|Buffer>');

    var type = types[typeName];
    if (type) {
      type = type();
    } else {
      type = structs[typeName];
    }
    assert(type, 'missing type or struct: ' + typeName);
    return Fcbuffer.fromBuffer(type, buf);
  };
};

var toBuffer = function toBuffer(types, structs) {
  return function (typeName, object) {
    assert.equal(typeof typeName === 'undefined' ? 'undefined' : _typeof(typeName), 'string', 'typeName (type or struct name)');
    assert.equal(typeof object === 'undefined' ? 'undefined' : _typeof(object), 'object', 'object');

    var type = types[typeName];
    if (type) {
      type = type();
    } else {
      type = structs[typeName];
    }
    assert(type, 'missing type or struct: ' + typeName);
    return Fcbuffer.toBuffer(type, object);
  };
};

module.exports.fromBuffer = Fcbuffer.fromBuffer;
module.exports.toBuffer = Fcbuffer.toBuffer;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),

/***/ 3269:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var _slicedToArray2 = __webpack_require__(452);

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _typeof2 = __webpack_require__(179);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = __webpack_require__(276),
    Signature = _require.Signature,
    PublicKey = _require.PublicKey;

var Fcbuffer = __webpack_require__(3268);
var ByteBuffer = __webpack_require__(1184);
var assert = __webpack_require__(23);

var schema = __webpack_require__(3272);

var _require2 = __webpack_require__(3273),
    isName = _require2.isName,
    encodeName = _require2.encodeName,
    decodeName = _require2.decodeName,
    DecimalPad = _require2.DecimalPad,
    DecimalImply = _require2.DecimalImply,
    DecimalUnimply = _require2.DecimalUnimply,
    printAsset = _require2.printAsset,
    parseAsset = _require2.parseAsset;

/** Configures Fcbuffer for EOS specific structs and types. */


module.exports = function () {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var extendedSchema = arguments[1];

  var structLookup = function structLookup(lookupName, account) {
    var cache = config.abiCache.abi(account);

    // Lookup by ABI action "name"
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = cache.abi.actions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var action = _step.value;

        if (action.name === lookupName) {
          var _struct = cache.structs[action.type];
          if (_struct != null) {
            return _struct;
          }
        }
      }

      // Lookup struct by "type"
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var struct = cache.structs[lookupName];
    if (struct != null) {
      return struct;
    }

    throw new Error('Missing ABI action: ' + lookupName);
  };

  // If nodeos does not have an ABI setup for a certain action.type, it will throw
  // an error: `Invalid cast from object_type to string` .. forceActionDataHex
  // may be used to until native ABI is added or fixed.
  var forceActionDataHex = config.forceActionDataHex != null ? config.forceActionDataHex : true;

  var override = Object.assign({}, authorityOverride(config), abiOverride(structLookup), wasmCodeOverride(config), actionDataOverride(structLookup, forceActionDataHex), config.override);

  var eosTypes = {
    name: function name() {
      return [Name];
    },
    public_key: function public_key() {
      return [variant(PublicKeyEcc)];
    },

    symbol: function symbol() {
      return [_Symbol];
    },
    symbol_code: function symbol_code() {
      return [SymbolCode];
    },
    extended_symbol: function extended_symbol() {
      return [ExtendedSymbol];
    },

    asset: function asset() {
      return [Asset];
    }, // After Symbol: amount, precision, symbol, contract
    extended_asset: function extended_asset() {
      return [ExtendedAsset];
    }, // After Asset: amount, precision, symbol, contract

    signature: function signature() {
      return [variant(SignatureType)];
    }
  };

  var customTypes = Object.assign({}, eosTypes, config.customTypes);
  config = Object.assign({ override: override }, { customTypes: customTypes }, config);

  // Do not sort transaction actions
  config.sort = Object.assign({}, config.sort);
  config.sort['action.authorization'] = true;
  config.sort['signed_transaction.signature'] = true;
  config.sort['authority.accounts'] = true;
  config.sort['authority.keys'] = true;

  var fullSchema = Object.assign({}, schema, extendedSchema);

  var _Fcbuffer = Fcbuffer(fullSchema, config),
      structs = _Fcbuffer.structs,
      types = _Fcbuffer.types,
      errors = _Fcbuffer.errors,
      fromBuffer = _Fcbuffer.fromBuffer,
      toBuffer = _Fcbuffer.toBuffer;

  if (errors.length !== 0) {
    throw new Error(JSON.stringify(errors, null, 4));
  }

  return { structs: structs, types: types, fromBuffer: fromBuffer, toBuffer: toBuffer };
};

/**
  Name eos::types native.hpp
*/
var Name = function Name(validation) {
  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var n = decodeName(b.readUint64(), false); // b is already in littleEndian
      // if(validation.debug) {
      //   console.error(`${n}`, '(Name.fromByteBuffer)')
      // }
      return n;
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      // if(validation.debug) {
      //   console.error(`${value}`, (Name.appendByteBuffer))
      // }
      b.writeUint64(encodeName(value, false)); // b is already in littleEndian
    },
    fromObject: function fromObject(value) {
      return value;
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return '';
      }
      return value;
    }
  };
};

/**
  A variant is like having a version of an object.  A varint comes
  first and identifies which type of object this is.

  @arg {Array} variantArray array of types
*/
var variant = function variant() {
  for (var _len = arguments.length, variantArray = Array(_len), _key = 0; _key < _len; _key++) {
    variantArray[_key] = arguments[_key];
  }

  return function (validation, baseTypes, customTypes) {
    var variants = variantArray.map(function (Type) {
      return Type(validation, baseTypes, customTypes);
    });
    var staticVariant = baseTypes.static_variant(variants);

    return {
      fromByteBuffer: function fromByteBuffer(b) {
        return staticVariant.fromByteBuffer(b);
      },
      appendByteBuffer: function appendByteBuffer(b, value) {
        if (!Array.isArray(value)) {
          value = [0, value];
        }
        staticVariant.appendByteBuffer(b, value);
      },
      fromObject: function fromObject(value) {
        if (!Array.isArray(value)) {
          value = [0, value];
        }
        return staticVariant.fromObject(value)[1];
      },
      toObject: function toObject(value) {
        if (!Array.isArray(value)) {
          value = [0, value];
        }
        return staticVariant.toObject(value)[1];
      }
    };
  };
};

var PublicKeyEcc = function PublicKeyEcc(validation) {
  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var bcopy = b.copy(b.offset, b.offset + 33);
      b.skip(33);
      var pubbuf = Buffer.from(bcopy.toBinary(), 'binary');
      return PublicKey.fromBuffer(pubbuf).toString(validation.keyPrefix);
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      // if(validation.debug) {
      //   console.error(`${value}`, 'PublicKeyType.appendByteBuffer')
      // }
      var buf = PublicKey.fromStringOrThrow(value, validation.keyPrefix).toBuffer();
      b.append(buf.toString('binary'), 'binary');
    },
    fromObject: function fromObject(value) {
      return value;
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        var keyPrefix = validation.keyPrefix ? validation.keyPrefix : 'EOS';
        return keyPrefix + '6MRy..';
      }
      return value;
    }
  };
};

/**
  Internal: precision, symbol
  External: symbol
  @example 'SYS'
*/
var _Symbol = function _Symbol(validation) {
  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var bcopy = b.copy(b.offset, b.offset + 8);
      b.skip(8);

      var precision = bcopy.readUint8();
      var bin = bcopy.toBinary();

      var symbol = '';
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = bin[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var code = _step2.value;

          if (code == '\0') {
            break;
          }
          symbol += code;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return precision + ',' + symbol;
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      var _parseAsset = parseAsset(value),
          symbol = _parseAsset.symbol,
          precision = _parseAsset.precision;

      assert(precision != null, 'Precision unknown for symbol: ' + value);
      var pad = '\0'.repeat(7 - symbol.length);
      b.append(String.fromCharCode(precision) + symbol + pad);
    },
    fromObject: function fromObject(value) {
      assert(value != null, 'Symbol is required: ' + value);

      var _parseAsset2 = parseAsset(value),
          symbol = _parseAsset2.symbol,
          precision = _parseAsset2.precision;

      if (precision == null) {
        return symbol;
      } else {
        // Internal object, this can have the precision prefix
        return precision + ',' + symbol;
      }
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return 'SYS';
      }
      // symbol only (without precision prefix)
      return parseAsset(value).symbol;
    }
  };
};

/** Symbol type without the precision */
var SymbolCode = function SymbolCode(validation) {
  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var bcopy = b.copy(b.offset, b.offset + 8);
      b.skip(8);

      var bin = bcopy.toBinary();

      var symbol = '';
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = bin[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var code = _step3.value;

          if (code == '\0') {
            break;
          }
          symbol += code;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return '' + symbol;
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      var _parseAsset3 = parseAsset(value),
          symbol = _parseAsset3.symbol;

      var pad = '\0'.repeat(8 - symbol.length);
      b.append(symbol + pad);
    },
    fromObject: function fromObject(value) {
      assert(value != null, 'Symbol is required: ' + value);

      var _parseAsset4 = parseAsset(value),
          symbol = _parseAsset4.symbol;

      return symbol;
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return 'SYS';
      }
      return parseAsset(value).symbol;
    }
  };
};

/**
  Internal: precision, symbol, contract
  External: symbol, contract
  @example 'SYS@contract'
*/
var ExtendedSymbol = function ExtendedSymbol(validation, baseTypes, customTypes) {
  var symbolType = customTypes.symbol(validation);
  var contractName = customTypes.name(validation);

  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var symbol = symbolType.fromByteBuffer(b);
      var contract = contractName.fromByteBuffer(b);
      return symbol + '@' + contract;
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      assert.equal(typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value), 'string', 'Invalid extended symbol: ' + value);

      var _value$split = value.split('@'),
          _value$split2 = (0, _slicedToArray3.default)(_value$split, 2),
          symbol = _value$split2[0],
          contract = _value$split2[1];

      assert(contract != null, 'Missing @contract suffix in extended symbol: ' + value);

      symbolType.appendByteBuffer(b, symbol);
      contractName.appendByteBuffer(b, contract);
    },
    fromObject: function fromObject(value) {
      return value;
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return 'SYS@contract';
      }
      return value;
    }
  };
};

/**
  Internal: amount, precision, symbol, contract
  @example '1.0000 SYS'
*/
var Asset = function Asset(validation, baseTypes, customTypes) {
  var amountType = baseTypes.int64(validation);
  var symbolType = customTypes.symbol(validation);

  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var amount = amountType.fromByteBuffer(b);
      assert(amount != null, 'amount');

      var sym = symbolType.fromByteBuffer(b);

      var _parseAsset5 = parseAsset('' + sym),
          precision = _parseAsset5.precision,
          symbol = _parseAsset5.symbol;

      assert(precision != null, 'precision');
      assert(symbol != null, 'symbol');

      return DecimalUnimply(amount, precision) + ' ' + symbol;
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      var _parseAsset6 = parseAsset(value),
          amount = _parseAsset6.amount,
          precision = _parseAsset6.precision,
          symbol = _parseAsset6.symbol;

      assert(amount != null, 'amount');
      assert(precision != null, 'precision');
      assert(symbol != null, 'symbol');

      amountType.appendByteBuffer(b, DecimalImply(amount, precision));
      symbolType.appendByteBuffer(b, precision + ',' + symbol);
    },
    fromObject: function fromObject(value) {
      var _parseAsset7 = parseAsset(value),
          amount = _parseAsset7.amount,
          precision = _parseAsset7.precision,
          symbol = _parseAsset7.symbol;

      assert(amount != null, 'amount');
      assert(precision != null, 'precision');
      assert(symbol != null, 'symbol');

      return DecimalPad(amount, precision) + ' ' + symbol;
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return '0.0001 SYS';
      }

      var _parseAsset8 = parseAsset(value),
          amount = _parseAsset8.amount,
          precision = _parseAsset8.precision,
          symbol = _parseAsset8.symbol;

      assert(amount != null, 'amount');
      assert(precision != null, 'precision');
      assert(symbol != null, 'symbol');

      return DecimalPad(amount, precision) + ' ' + symbol;
    }
  };
};

/**
  @example '1.0000 SYS@contract'
*/
var ExtendedAsset = function ExtendedAsset(validation, baseTypes, customTypes) {
  var assetType = customTypes.asset(validation);
  var contractName = customTypes.name(validation);

  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var asset = assetType.fromByteBuffer(b);
      var contract = contractName.fromByteBuffer(b);
      return parseAsset(asset + '@' + contract);
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      assert.equal(typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value), 'object', 'expecting extended_asset object, got ' + (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)));

      var asset = printAsset(value);

      var _asset$split = asset.split('@'),
          _asset$split2 = (0, _slicedToArray3.default)(_asset$split, 2),
          contract = _asset$split2[1];

      assert.equal(typeof contract === 'undefined' ? 'undefined' : (0, _typeof3.default)(contract), 'string', 'Invalid extended asset: ' + value);

      // asset includes contract (assetType needs this)
      assetType.appendByteBuffer(b, asset);
      contractName.appendByteBuffer(b, contract);
    },
    fromObject: function fromObject(value) {
      // like: 1.0000 SYS@contract or 1 SYS@contract
      var asset = {};
      if (typeof value === 'string') {
        Object.assign(asset, parseAsset(value));
      } else if ((typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object') {
        Object.assign(asset, value);
      } else {
        assert(false, 'expecting extended_asset<object|string>, got: ' + (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)));
      }

      var amount = asset.amount,
          precision = asset.precision,
          symbol = asset.symbol,
          contract = asset.contract;

      assert(amount != null, 'missing amount');
      assert(precision != null, 'missing precision');
      assert(symbol != null, 'missing symbol');
      assert(contract != null, 'missing contract');

      return { amount: amount, precision: precision, symbol: symbol, contract: contract };
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return {
          amount: '1.0000',
          precision: 4,
          symbol: 'SYS',
          contract: 'eosio.token'
        };
      }

      assert.equal(typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value), 'object', 'expecting extended_asset object');
      var amount = value.amount,
          precision = value.precision,
          symbol = value.symbol,
          contract = value.contract;


      return {
        amount: DecimalPad(amount, precision),
        precision: precision,
        symbol: symbol,
        contract: contract
      };
    }
  };
};

var SignatureType = function SignatureType(validation, baseTypes) {
  var signatureType = baseTypes.fixed_bytes65(validation);
  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var signatureBuffer = signatureType.fromByteBuffer(b);
      var signature = Signature.from(signatureBuffer);
      return signature.toString();
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      var signature = Signature.from(value);
      signatureType.appendByteBuffer(b, signature.toBuffer());
    },
    fromObject: function fromObject(value) {
      var signature = Signature.from(value);
      return signature.toString();
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return 'SIG_K1_bas58signature..';
      }
      var signature = Signature.from(value);
      return signature.toString();
    }
  };
};

var authorityOverride = function authorityOverride(config) {
  return {
    /** shorthand `EOS6MRyAj..` */
    'authority.fromObject': function authorityFromObject(value) {
      if (PublicKey.fromString(value, config.keyPrefix)) {
        return {
          threshold: 1,
          keys: [{ key: value, weight: 1 }]
        };
      }
      if (typeof value === 'string') {
        var _value$split3 = value.split('@'),
            _value$split4 = (0, _slicedToArray3.default)(_value$split3, 2),
            account = _value$split4[0],
            _value$split4$ = _value$split4[1],
            permission = _value$split4$ === undefined ? 'active' : _value$split4$;

        return {
          threshold: 1,
          accounts: [{
            permission: {
              actor: account,
              permission: permission
            },
            weight: 1
          }]
        };
      }
    }
  };
};

var abiOverride = function abiOverride(structLookup) {
  return {
    'abi_def.fromObject': function abi_defFromObject(value) {
      if (typeof value === 'string') {
        var json = Buffer.from(value, 'hex').toString();
        if (json.length === 0) {
          json = Buffer.from(value).toString();
        }
        return JSON.parse(json);
      }
      if (Buffer.isBuffer(value)) {
        return JSON.parse(value.toString());
      }
      return null; // let the default type take care of it
    },

    'setabi.abi.appendByteBuffer': function setabiAbiAppendByteBuffer(_ref) {
      var fields = _ref.fields,
          object = _ref.object,
          b = _ref.b;

      var ser = structLookup('abi_def', 'eosio');
      var b2 = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN);

      if (Buffer.isBuffer(object.abi)) {
        b2.append(object.abi);
      } else if ((0, _typeof3.default)(object.abi) == 'object') {
        ser.appendByteBuffer(b2, object.abi);
      }

      b.writeVarint32(b2.offset); // length prefix
      b.append(b2.copy(0, b2.offset), 'binary');
    }
  };
};

var wasmCodeOverride = function wasmCodeOverride(config) {
  return {
    'setcode.code.fromObject': function setcodeCodeFromObject(_ref2) {
      var object = _ref2.object,
          result = _ref2.result;

      try {
        var code = object.code.toString();
        if (/^\s*\(module/.test(code)) {
          var binaryen = config.binaryen;

          assert(binaryen != null, 'required: config.binaryen = require("binaryen")');
          if (config.debug) {
            console.log('Assembling WASM..');
          }
          var wasm = Buffer.from(binaryen.parseText(code).emitBinary());
          result.code = wasm;
        } else {
          result.code = object.code;
        }
      } catch (error) {
        console.error(error, object.code);
        throw error;
      }
    }
  };
};

/**
  Nested serialized structure.  Nested struct may be in HEX or object format.
*/
var actionDataOverride = function actionDataOverride(structLookup, forceActionDataHex) {
  return {
    'action.data.fromByteBuffer': function actionDataFromByteBuffer(_ref3) {
      var fields = _ref3.fields,
          object = _ref3.object,
          b = _ref3.b,
          config = _ref3.config;

      var ser = (object.name || '') == '' ? fields.data : structLookup(object.name, object.account);
      if (ser) {
        b.readVarint32(); // length prefix (usefull if object.name is unknown)
        object.data = ser.fromByteBuffer(b, config);
      } else {
        // console.log(`Unknown Action.name ${object.name}`)
        var lenPrefix = b.readVarint32();
        var bCopy = b.copy(b.offset, b.offset + lenPrefix);
        b.skip(lenPrefix);
        object.data = Buffer.from(bCopy.toBinary(), 'binary');
      }
    },

    'action.data.appendByteBuffer': function actionDataAppendByteBuffer(_ref4) {
      var fields = _ref4.fields,
          object = _ref4.object,
          b = _ref4.b;

      var ser = (object.name || '') == '' ? fields.data : structLookup(object.name, object.account);
      if (ser) {
        var b2 = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN);
        ser.appendByteBuffer(b2, object.data);
        b.writeVarint32(b2.offset);
        b.append(b2.copy(0, b2.offset), 'binary');
      } else {
        // console.log(`Unknown Action.name ${object.name}`)
        var data = typeof object.data === 'string' ? Buffer.from(object.data, 'hex') : object.data;
        if (!Buffer.isBuffer(data)) {
          throw new TypeError('Unknown struct \'' + object.name + '\' for contract \'' + object.account + '\', locate this struct or provide serialized action.data');
        }
        b.writeVarint32(data.length);
        b.append(data.toString('binary'), 'binary');
      }
    },

    'action.data.fromObject': function actionDataFromObject(_ref5) {
      var fields = _ref5.fields,
          object = _ref5.object,
          result = _ref5.result;
      var data = object.data,
          name = object.name;

      var ser = (name || '') == '' ? fields.data : structLookup(name, object.account);
      if (ser) {
        if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) === 'object') {
          result.data = ser.fromObject(data); // resolve shorthand
        } else if (typeof data === 'string') {
          var buf = Buffer.from(data, 'hex');
          result.data = Fcbuffer.fromBuffer(ser, buf);
        } else {
          throw new TypeError('Expecting hex string or object in action.data');
        }
      } else {
        // console.log(`Unknown Action.name ${object.name}`)
        result.data = data;
      }
    },

    'action.data.toObject': function actionDataToObject(_ref6) {
      var fields = _ref6.fields,
          object = _ref6.object,
          result = _ref6.result,
          config = _ref6.config;

      var _ref7 = object || {},
          data = _ref7.data,
          name = _ref7.name;

      var ser = (name || '') == '' ? fields.data : structLookup(name, object.account);
      if (!ser) {
        // Types without an ABI will accept hex
        result.data = Buffer.isBuffer(data) ? data.toString('hex') : data;
        return;
      }

      if (forceActionDataHex) {
        var b2 = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN);
        if (data) {
          ser.appendByteBuffer(b2, data);
        }
        result.data = b2.copy(0, b2.offset).toString('hex');
        // console.log('result.data', result.data)
        return;
      }

      // Serializable JSON
      result.data = ser.toObject(data, config);
    }
  };
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),

/***/ 3270:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var api = __webpack_require__(3278);
var apiGen = __webpack_require__(3281);
var processArgs = __webpack_require__(3271);

var EosApi = function EosApi(config) {
  return apiGen('v1', api, config);
};

Object.assign(EosApi, {
  processArgs: processArgs,
  api: api,

  /** @deprecated */
  Testnet: function Testnet(config) {
    console.error('deprecated, change EosApi.Testnet(..) to just EosApi(..)');
    return EosApi(config);
  },

  /** @deprecated */
  Localnet: function Localnet(config) {
    console.error('deprecated, change EosApi.Localnet(..) to just EosApi(..)');
    return EosApi(config);
  }
});

module.exports = EosApi;

/***/ }),

/***/ 3271:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = processArgs;

/**
  @typedef {object} processedArgs - Normalized object containing arguments, and
  a chained promise and a callback.

  @property {object} params - normalized args only, parameters by name, no extra options or callback.

  @property {object} options - non-null or non-undefined return value from invocation of
  optionsFormatter(optionsParam).

  @property {function} callback -chained to optional callback provided in args.  Resolves
  or rejects returnPromise.

  @property {Promise} returnPromise - promise is returned when no callback is provided in
  args[args.length - 1].  Undefined when a callback is provided.
*/
/**
  Convert args array or object into a normalized value object.  Suppoorts extra
  options and(or) callback parameters.

  Per the Promise API feature promisifyAll (see also sb-promisify), the callback
  (if provided) must always be last.

  @arg {Array|object} args - User-provided parameter object or array of parameters
  @arg {Array} defParams - Names for the parameters.
  @arg {string} methodName - for error reporting
  @arg {function} [optionsFormatter(extraParam) = null] - optional callback used if an
    extra optional (non-callback) parameter is provided.


  @return {processedArgs} processedArgs
  @throws TypeError - when parameter count is not exact (after adjusting for
  options and callback)

  @example api.processArgs(args, ['account'], 'contract', optionsFormatter)
*/
function processArgs(args, defParams) {
  var methodName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'method';
  var optionsFormatter = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var params = {};
  var options = {};

  var expectedArgCount = defParams.length;

  // Extra callback argument?  Last per promisifyAll standard.
  var callbackArg = void 0;
  if (typeof args[args.length - 1] === 'function') {
    callbackArg = args[args.length - 1];
    args = args.slice(0, args.length - 1);
  }

  var callback = void 0;
  var returnPromise = void 0;
  if (callbackArg) {
    callback = function callback(err, result) {
      if (err) {
        callbackArg(err);
      } else {
        callbackArg(null, result);
      }
    };
  } else {
    returnPromise = new Promise(function (resolve, reject) {
      callback = function callback(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      };
    });
  }

  // Look for the options parameter (after potential callback was removed)
  if (typeof optionsFormatter === 'function' && args.length > 0 && (_typeof(args[0]) === 'object' && args.length === 2 || args.length === expectedArgCount + 1)) {
    //An extra options argument
    options = optionsFormatter(args[args.length - 1]);
    if (options != null) {
      // It is valid, remove it to avoid parameter count an error below
      args = args.slice(0, args.length - 1);
    }
  }

  // Parameteters (args) can be ordered or an object
  if (args.length === 1 && _typeof(args[0]) === 'object') {
    params = args[0];
  } else {
    // give ordered paramaters names

    if (args.length > expectedArgCount) {
      // console.log('typeof defParams[expectedArgCount]', args)
      throw new TypeError(methodName + ' is expecting ' + expectedArgCount + ' parameters but ' + args.length + ' where provided');
    }

    // convert ordered parameters into a value object by parameter name
    var pos = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = defParams[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var defParam = _step.value;

        params[defParam] = args[pos];
        pos++;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  return { params: params, options: options, callback: callback, returnPromise: returnPromise };
}

/***/ }),

/***/ 3272:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var schema = Object.assign({}, __webpack_require__(3292));

module.exports = schema;

/***/ }),

/***/ 3273:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray2 = __webpack_require__(452);

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _typeof2 = __webpack_require__(179);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = __webpack_require__(23);

var _require = __webpack_require__(1184),
    Long = _require.Long;

module.exports = {
  ULong: ULong,
  isName: isName,
  encodeName: encodeName, // encode human readable name to uint64 (number string)
  decodeName: decodeName, // decode from uint64 to human readable
  encodeNameHex: function encodeNameHex(name) {
    return Long.fromString(encodeName(name), true).toString(16);
  },
  decodeNameHex: function decodeNameHex(hex) {
    var littleEndian = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return decodeName(Long.fromString(hex, true, 16).toString(), littleEndian);
  },
  DecimalString: DecimalString,
  DecimalPad: DecimalPad,
  DecimalImply: DecimalImply,
  DecimalUnimply: DecimalUnimply,
  printAsset: printAsset,
  parseAsset: parseAsset

  /** @private */
};var signed = function signed(fn) {
  return function () {};
};

function ULong(value) {
  var unsigned = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var radix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

  if (typeof value === 'number') {
    // Some JSON libs use numbers for values under 53 bits or strings for larger.
    // Accomidate but double-check it..
    if (value > Number.MAX_SAFE_INTEGER) throw new TypeError('value parameter overflow');

    value = Long.fromString(String(value), unsigned, radix);
  } else if (typeof value === 'string') {
    value = Long.fromString(value, unsigned, radix);
  } else if (!Long.isLong(value)) {
    throw new TypeError('value parameter is a requied Long, Number or String');
  }
  return value;
}

function isName(str, err) {
  try {
    encodeName(str);
    return true;
  } catch (error) {
    if (err) {
      err(error);
    }
    return false;
  }
}

var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
var charidx = function charidx(ch) {
  var idx = charmap.indexOf(ch);
  if (idx === -1) throw new TypeError('Invalid character: \'' + ch + '\'');

  return idx;
};

/** Original Name encode and decode logic is in github.com/eosio/eos  native.hpp */

/**
  Encode a name (a base32 string) to a number.

  For performance reasons, the blockchain uses the numerical encoding of strings
  for very common types like account names.

  @see types.hpp string_to_name

  @arg {string} name - A string to encode, up to 12 characters long.
  @arg {string} [littleEndian = true] - Little or Bigendian encoding

  @return {string<uint64>} - compressed string (from name arg).  A string is
    always used because a number could exceed JavaScript's 52 bit limit.
*/
function encodeName(name) {
  var littleEndian = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  if (typeof name !== 'string') throw new TypeError('name parameter is a required string');

  if (name.length > 12) throw new TypeError('A name can be up to 12 characters long');

  var bitstr = '';
  for (var i = 0; i <= 12; i++) {
    // process all 64 bits (even if name is short)
    var c = i < name.length ? charidx(name[i]) : 0;
    var bitlen = i < 12 ? 5 : 4;
    var bits = Number(c).toString(2);
    if (bits.length > bitlen) {
      throw new TypeError('Invalid name ' + name);
    }
    bits = '0'.repeat(bitlen - bits.length) + bits;
    bitstr += bits;
  }

  var value = Long.fromString(bitstr, true, 2);

  // convert to LITTLE_ENDIAN
  var leHex = '';
  var bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = bytes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var b = _step.value;

      var n = Number(b).toString(16);
      leHex += (n.length === 1 ? '0' : '') + n;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var ulName = Long.fromString(leHex, true, 16).toString();

  // console.log('encodeName', name, value.toString(), ulName.toString(), JSON.stringify(bitstr.split(/(.....)/).slice(1)))

  return ulName.toString();
}

/**
  @arg {Long|String|number} value uint64
  @arg {string} [littleEndian = true] - Little or Bigendian encoding

  @return {string}
*/
function decodeName(value) {
  var littleEndian = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  value = ULong(value);

  // convert from LITTLE_ENDIAN
  var beHex = '';
  var bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = bytes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var b = _step2.value;

      var n = Number(b).toString(16);
      beHex += (n.length === 1 ? '0' : '') + n;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  beHex += '0'.repeat(16 - beHex.length);

  var fiveBits = Long.fromNumber(0x1f, true);
  var fourBits = Long.fromNumber(0x0f, true);
  var beValue = Long.fromString(beHex, true, 16);

  var str = '';
  var tmp = beValue;

  for (var i = 0; i <= 12; i++) {
    var c = charmap[tmp.and(i === 0 ? fourBits : fiveBits)];
    str = c + str;
    tmp = tmp.shiftRight(i === 0 ? 4 : 5);
  }
  str = str.replace(/\.+$/, ''); // remove trailing dots (all of them)

  // console.log('decodeName', str, beValue.toString(), value.toString(), JSON.stringify(beValue.toString(2).split(/(.....)/).slice(1)))

  return str;
}

/**
  Normalize and validate decimal string (potentially large values).  Should
  avoid internationalization issues if possible but will be safe and
  throw an error for an invalid number.

  Normalization removes extra zeros or decimal.

  @return {string} value
*/
function DecimalString(value) {
  assert(value != null, 'value is required');
  value = value === 'object' && value.toString ? value.toString() : String(value);

  var neg = /^-/.test(value);
  if (neg) {
    value = value.substring(1);
  }

  if (value[0] === '.') {
    value = '0' + value;
  }

  var part = value.split('.');
  assert(part.length <= 2, 'invalid decimal ' + value);
  assert(/^\d+(,?\d)*\d*$/.test(part[0]), 'invalid decimal ' + value);

  if (part.length === 2) {
    assert(/^\d*$/.test(part[1]), 'invalid decimal ' + value);
    part[1] = part[1].replace(/0+$/, ''); // remove suffixing zeros
    if (part[1] === '') {
      part.pop();
    }
  }

  part[0] = part[0].replace(/^0*/, ''); // remove leading zeros
  if (part[0] === '') {
    part[0] = '0';
  }
  return (neg ? '-' : '') + part.join('.');
}

/**
  Ensure a fixed number of decimal places.  Safe for large numbers.

  @see ./format.test.js

  @example DecimalPad(10.2, 3) === '10.200'

  @arg {number|string|object.toString} num
  @arg {number} [precision = null] - number of decimal places.  Null skips
    padding suffix but still applies number format normalization.
  @return {string} decimal part is added and zero padded to match precision
*/
function DecimalPad(num, precision) {
  var value = DecimalString(num);
  if (precision == null) {
    return value;
  }

  assert(precision >= 0 && precision <= 18, 'Precision should be 18 characters or less');

  var part = value.split('.');

  if (precision === 0 && part.length === 1) {
    return part[0];
  }

  if (part.length === 1) {
    return part[0] + '.' + '0'.repeat(precision);
  } else {
    var pad = precision - part[1].length;
    assert(pad >= 0, 'decimal \'' + value + '\' exceeds precision ' + precision);
    return part[0] + '.' + part[1] + '0'.repeat(pad);
  }
}

/** Ensures proper trailing zeros then removes decimal place. */
function DecimalImply(value, precision) {
  return DecimalPad(value, precision).replace('.', '');
}

/**
  Put the decimal place back in its position and return the normalized number
  string (with any unnecessary zeros or an unnecessary decimal removed).

  @arg {string|number|value.toString} value 10000
  @arg {number} precision 4
  @return {number} 1.0000
*/
function DecimalUnimply(value, precision) {
  assert(value != null, 'value is required');
  value = value === 'object' && value.toString ? value.toString() : String(value);
  var neg = /^-/.test(value);
  if (neg) {
    value = value.substring(1);
  }
  assert(/^\d+$/.test(value), 'invalid whole number ' + value);
  assert(precision != null, 'precision required');
  assert(precision >= 0 && precision <= 18, 'Precision should be 18 characters or less');

  // Ensure minimum length
  var pad = precision - value.length;
  if (pad > 0) {
    value = '' + '0'.repeat(pad) + value;
  }

  var dotIdx = value.length - precision;
  value = value.slice(0, dotIdx) + '.' + value.slice(dotIdx);
  return (neg ? '-' : '') + DecimalPad(value, precision); // Normalize
}

/** @private for now, support for asset strings is limited
*/
function printAsset(_ref) {
  var amount = _ref.amount,
      precision = _ref.precision,
      symbol = _ref.symbol,
      contract = _ref.contract;

  assert.equal(typeof symbol === 'undefined' ? 'undefined' : (0, _typeof3.default)(symbol), 'string', 'symbol is a required string');

  if (amount != null && precision != null) {
    amount = DecimalPad(amount, precision);
  }

  var join = function join(e1, e2) {
    return e1 == null ? '' : e2 == null ? '' : e1 + e2;
  };

  if (amount != null) {
    // the amount contains the precision
    return join(amount, ' ') + symbol + join('@', contract);
  }

  return join(precision, ',') + symbol + join('@', contract);
}

/**
  Attempts to parse all forms of the asset strings (symbol, asset, or extended
  versions).  If the provided string contains any additional or appears to have
  invalid information an error is thrown.

  @return {object} {amount, precision, symbol, contract}
  @throws AssertionError
*/
function parseAsset(str) {
  var _str$split = str.split(' '),
      _str$split2 = (0, _slicedToArray3.default)(_str$split, 1),
      amountRaw = _str$split2[0];

  var amountMatch = amountRaw.match(/^(-?[0-9]+(\.[0-9]+)?)( |$)/);
  var amount = amountMatch ? amountMatch[1] : null;

  var precisionMatch = str.match(/(^| )([0-9]+),([A-Z]+)(@|$)/);
  var precisionSymbol = precisionMatch ? Number(precisionMatch[2]) : null;
  var precisionAmount = amount ? (amount.split('.')[1] || '').length : null;
  var precision = precisionSymbol != null ? precisionSymbol : precisionAmount;

  var symbolMatch = str.match(/(^| |,)([A-Z]+)(@|$)/);
  var symbol = symbolMatch ? symbolMatch[2] : null;

  var _str$split3 = str.split('@'),
      _str$split4 = (0, _slicedToArray3.default)(_str$split3, 2),
      _str$split4$ = _str$split4[1],
      contractRaw = _str$split4$ === undefined ? '' : _str$split4$;

  var contract = /^[a-z0-5]+(\.[a-z0-5]+)*$/.test(contractRaw) ? contractRaw : null;

  var check = printAsset({ amount: amount, precision: precision, symbol: symbol, contract: contract });

  assert.equal(str, check, 'Invalid asset string: ' + str + ' !== ' + check);

  if (precision != null) {
    assert(precision >= 0 && precision <= 18, 'Precision should be 18 characters or less');
  }
  if (symbol != null) {
    assert(symbol.length <= 7, 'Asset symbol is 7 characters or less');
  }
  if (contract != null) {
    assert(contract.length <= 12, 'Contract is 12 characters or less');
  }

  return { amount: amount, precision: precision, symbol: symbol, contract: contract };
}

/***/ }),

/***/ 3274:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var BN = __webpack_require__(32);

var _require = __webpack_require__(1184),
    Long = _require.Long;

var assert = __webpack_require__(23);

var types = {
  bytes: function bytes() {
    return [bytebuf];
  },
  string: function string() {
    return [_string];
  },
  vector: function vector(type) {
    var sorted = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return [_vector, { type: type, sorted: sorted }];
  },
  optional: function optional(type) {
    return [_optional, { type: type }];
  },
  time: function time() {
    return [_time2];
  },
  map: function map(annotation) {
    return [_map, { annotation: annotation }];
  },
  static_variant: function static_variant(types) {
    return [_static_variant, { types: types }];
  },

  fixed_string16: function fixed_string16() {
    return [_string, { maxLen: 16 }];
  },
  fixed_string32: function fixed_string32() {
    return [_string, { maxLen: 32 }];
  },

  fixed_bytes16: function fixed_bytes16() {
    return [bytebuf, { len: 16 }];
  },
  fixed_bytes20: function fixed_bytes20() {
    return [bytebuf, { len: 20 }];
  },
  fixed_bytes28: function fixed_bytes28() {
    return [bytebuf, { len: 28 }];
  },
  fixed_bytes32: function fixed_bytes32() {
    return [bytebuf, { len: 32 }];
  },
  fixed_bytes33: function fixed_bytes33() {
    return [bytebuf, { len: 33 }];
  },
  fixed_bytes64: function fixed_bytes64() {
    return [bytebuf, { len: 64 }];
  },
  fixed_bytes65: function fixed_bytes65() {
    return [bytebuf, { len: 65 }];
  },

  uint8: function uint8() {
    return [intbuf, { bits: 8 }];
  },
  uint16: function uint16() {
    return [intbuf, { bits: 16 }];
  },
  uint32: function uint32() {
    return [intbuf, { bits: 32 }];
  },
  uint64: function uint64() {
    return [intbuf, { bits: 64 }];
  },
  uint128: function uint128() {
    return [bnbuf, { bits: 128 }];
  },
  uint224: function uint224() {
    return [bnbuf, { bits: 224 }];
  },
  uint256: function uint256() {
    return [bnbuf, { bits: 256 }];
  },
  uint512: function uint512() {
    return [bnbuf, { bits: 512 }];
  },

  varuint32: function varuint32() {
    return [intbuf, { bits: 32, variable: true }];
  },

  int8: function int8() {
    return [intbuf, { signed: true, bits: 8 }];
  },
  int16: function int16() {
    return [intbuf, { signed: true, bits: 16 }];
  },
  int32: function int32() {
    return [intbuf, { signed: true, bits: 32 }];
  },
  int64: function int64() {
    return [intbuf, { signed: true, bits: 64 }];
  },
  int128: function int128() {
    return [bnbuf, { signed: true, bits: 128 }];
  },
  int224: function int224() {
    return [bnbuf, { signed: true, bits: 224 }];
  },
  int256: function int256() {
    return [bnbuf, { signed: true, bits: 256 }];
  },
  int512: function int512() {
    return [bnbuf, { signed: true, bits: 512 }];
  },

  varint32: function varint32() {
    return [intbuf, { signed: true, bits: 32, variable: true }];
  },

  float32: function float32() {
    return [float, { bits: 32 }];
  },
  float64: function float64() {
    return [float, { bits: 64 }];
  }

  /*
    @arg {SerializerConfig} config
    @return {object} {[typeName]: function(args)}
  */
};module.exports = function (config) {
  config = Object.assign({ defaults: false, debug: false, customTypes: {} }, config);

  var allTypes = Object.assign({}, types, config.customTypes);

  var createTypeReducer = function createTypeReducer(baseTypes) {
    return function (customTypes, name) {
      customTypes[name] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var type = createType(name, config, args, baseTypes, allTypes, customTypes);
        return type;
      };
      return customTypes;
    };
  };

  var baseTypes = Object.keys(types).reduce(createTypeReducer(), {});

  var customTypes = Object.keys(config.customTypes || {}).reduce(createTypeReducer(baseTypes), {});

  return Object.assign({}, baseTypes, customTypes, { config: config });
};

/**
    @args {string} typeName - matches types[]
    @args {string} config - Additional arguments for types
*/
function createType(typeName, config, args, baseTypes, allTypes, customTypes) {
  var Type = baseTypes ? allTypes[typeName] : types[typeName];

  var _Type = Type.apply(undefined, _toConsumableArray(args)),
      _Type2 = _slicedToArray(_Type, 2),
      fn = _Type2[0],
      _Type2$ = _Type2[1],
      v = _Type2$ === undefined ? {} : _Type2$;

  var validation = Object.assign(v, config);
  validation.typeName = typeName;
  var type = fn(validation, baseTypes, customTypes);
  type.typeName = typeName;
  return type;
}

var _map = function _map(validation) {
  var _validation$annotatio = _slicedToArray(validation.annotation, 2),
      type1 = _validation$annotatio[0],
      type2 = _validation$annotatio[1];

  if (!isSerializer(type1)) {
    throw new TypeError('map<type1, > unknown');
  }
  if (!isSerializer(type2)) {
    throw new TypeError('map<, type2> unknown');
  }

  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var size = b.readVarint32();
      var result = {};
      for (var i = 0; i < size; i++) {
        result[type1.fromByteBuffer(b)] = type2.fromByteBuffer(b);
      }
      if (validation.debug) {
        console.log('0x' + size.toString(16), '(map.fromByteBuffer length)', result);
      }
      return result;
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      validate(value, validation);
      var keys = Object.keys(value);
      b.writeVarint32(keys.length);
      if (validation.debug) {
        console.log('0x' + keys.length.toString(16), '(map.appendByteBuffer length)', keys);
      }
      // if(sorted === true) {
      //   value = sortKeys(type1, Object.assign({}, value))
      // }
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var o = _step.value;

          var value2 = value[o];
          type1.appendByteBuffer(b, o);
          type2.appendByteBuffer(b, value2);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    },
    fromObject: function fromObject(value) {
      validate(value, validation);
      var result = {};
      // if(sorted === true) {
      //   value = sortKeys(type1, Object.assign({}, value))
      // }
      for (var o in value) {
        result[type1.fromObject(o)] = type2.fromObject(value[o]);
      }
      return result;
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return _defineProperty({}, type1.toObject(null), type2.toObject(null));
      }
      validate(value, validation);
      var result = {};
      // if(sorted === true) {
      //   value = sortKey(type1, Object.assign({}, value))
      // }
      for (var o in value) {
        result[type1.toObject(o)] = type2.toObject(value[o]);
      }
      return result;
    }
  };
};

var _static_variant = function _static_variant(validation) {
  var types = validation.types;

  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var typePosition = b.readVarint32();
      var type = types[typePosition];
      if (validation.debug) {
        console.error('static_variant id ' + typePosition + ' (0x' + typePosition.toString(16) + ')');
      }
      assert(type, 'static_variant invalid type position ' + typePosition);
      return [typePosition, type.fromByteBuffer(b)];
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
      assert(Array.isArray(object) && object.length === 2, 'Required tuple');
      var typePosition = object[0];
      var type = types[typePosition];
      assert(type, 'type ' + typePosition);
      b.writeVarint32(typePosition);
      type.appendByteBuffer(b, object[1]);
    },
    fromObject: function fromObject(object) {
      assert(Array.isArray(object) && object.length === 2, 'Required tuple');
      var typePosition = object[0];
      var type = types[typePosition];
      assert(type, 'type ' + typePosition);
      return [typePosition, type.fromObject(object[1])];
    },
    toObject: function toObject(object) {
      if (validation.defaults && object == null) {
        return [0, types[0].toObject(null, debug)];
      }
      assert(Array.isArray(object) && object.length === 2, 'Required tuple');
      var typePosition = object[0];
      var type = types[typePosition];
      assert(type, 'type ' + typePosition);
      return [typePosition, type.toObject(object[1])];
    }
  };
};

var _vector = function _vector(validation) {
  var type = validation.type,
      sorted = validation.sorted;

  if (!isSerializer(type)) {
    throw new TypeError('vector type should be a serializer');
  }

  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var size = b.readVarint32();
      if (validation.debug) {
        console.log('fromByteBuffer vector length', size, '(0x' + size.toString(16) + ')');
      }
      var result = [];
      for (var i = 0; i < size; i++) {
        result.push(type.fromByteBuffer(b));
      }
      return result;
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      if (value == null) {
        value = [];
      }
      validate(value, validation);
      b.writeVarint32(value.length);
      if (sorted === true) {
        value = sort(type, Object.assign([], value));
      }
      if (validation.debug) {
        console.log('0x' + value.length.toString(16), '(vector.appendByteBuffer length)', value);
      }
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = value[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var o = _step2.value;

          type.appendByteBuffer(b, o);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    },
    fromObject: function fromObject(value) {
      if (value == null) {
        value = [];
      }
      validate(value, validation);
      var result = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = value[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var o = _step3.value;

          result.push(type.fromObject(o));
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      if (sorted === true) {
        result = sort(type, Object.assign([], result));
      }
      return result;
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return [type.toObject(value)];
      }
      if (value == null) {
        value = [];
      }
      validate(value, validation);
      if (sorted === true) {
        value = sort(type, Object.assign([], value));
      }
      var result = [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = value[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var o = _step4.value;

          result.push(type.toObject(o));
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return result;
    }
  };
};

var _optional = function _optional(validation) {
  var type = validation.type;

  if (!isSerializer(type)) {
    throw new TypeError('optional parameter should be a serializer');
  }

  return {
    fromByteBuffer: function fromByteBuffer(b) {
      if (!(b.readUint8() === 1)) {
        return null;
      }
      return type.fromByteBuffer(b);
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      if (value != null) {
        b.writeUint8(1);
        type.appendByteBuffer(b, value);
      } else {
        b.writeUint8(0);
      }
    },
    fromObject: function fromObject(value) {
      if (value == null) {
        return null;
      }
      return type.fromObject(value);
    },
    toObject: function toObject(value) {
      // toObject is only null save if defaults is true
      var resultValue = void 0;
      if (value == null && !validation.defaults) {
        resultValue = null;
      } else {
        resultValue = type.toObject(value);
      }
      return resultValue;
    }
  };
};

var intbufType = function intbufType(_ref2) {
  var _ref2$signed = _ref2.signed,
      signed = _ref2$signed === undefined ? false : _ref2$signed,
      bits = _ref2.bits,
      variable = _ref2.variable;
  return variable ? 'Varint' + bits + (signed ? 'ZigZag' : '') : '' + (signed ? 'Int' : 'Uint') + bits;
};

var intbuf = function intbuf(validation) {
  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var value = b['read' + intbufType(validation)]();
      return Long.isLong(value) ? value.toString() : value;
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      // validateInt(value, validation)
      // value = typeof value === 'string' ? Long.fromString(value) : value
      b['write' + intbufType(validation)](value);
    },
    fromObject: function fromObject(value) {
      validateInt(value, validation);
      // if(validation.bits > 53 && typeof value === 'number')
      //     value = String(value)

      return value;
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return validation.bits > 53 ? '0' : 0;
      }

      validateInt(value, validation);
      // if(validation.bits > 53 && typeof value === 'number')
      //     value = String(value)

      return Long.isLong(value) ? value.toString() : value;
    }
  };
};

/** Big Numbers (> 64 bits) */
var bnbuf = function bnbuf(validation) {
  var _validation$signed = validation.signed,
      signed = _validation$signed === undefined ? false : _validation$signed,
      bits = validation.bits;

  var size = bits / 8;
  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var bcopy = b.copy(b.offset, b.offset + size);
      b.skip(size);

      var bn = new BN(bcopy.toHex(), 'hex');
      var buf = bn.toArrayLike(Buffer, 'le', size); // convert to little endian
      bn = new BN(buf.toString('hex'), 'hex');
      if (signed) {
        bn = bn.fromTwos(bits);
      }
      var value = bn.toString();
      validateInt(value, validation);
      return bits > 53 ? value : bn.toNumber();
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      validateInt(value, validation);
      var bn = new BN(value);
      if (signed) {
        bn = bn.toTwos(bits);
      }
      var buf = bn.toArrayLike(Buffer, 'le', size);
      b.append(buf.toString('binary'), 'binary');
    },
    fromObject: function fromObject(value) {
      validateInt(value, validation);
      return value;
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return validation.bits > 53 ? '0' : 0;
      }
      validateInt(value, validation);
      return value;
    }
  };
};

var floatPoint = __webpack_require__(3275);

var float = function float(validation) {
  var bits = validation.bits;

  // assert(bits === 32 || bits === 64, 'unsupported float bit size: ' + bits)

  var sizeName = bits === 32 ? 'Float' : bits === 64 ? 'Double' : null;
  assert(sizeName, 'unsupported float bit size: ' + bits);
  var size = bits / 8;

  return {
    fromByteBuffer: function fromByteBuffer(b) {
      var bcopy = b.copy(b.offset, b.offset + size);
      b.skip(size);
      var fb = Buffer.from(bcopy.toBinary(), 'binary');
      return floatPoint['read' + sizeName + 'LE'](fb);
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      var output = [];
      floatPoint['write' + sizeName + 'LE'](output, value);
      b.append(output);
    },
    fromObject: function fromObject(value) {
      return value;
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return 0.0;
      }
      return value;
    }
  };
};

var bytebuf = function bytebuf(validation) {
  var _bytebuf = {
    fromByteBuffer: function fromByteBuffer(b) {
      var len = validation.len;

      var bCopy = void 0;
      if (len == null) {
        var lenPrefix = b.readVarint32();
        bCopy = b.copy(b.offset, b.offset + lenPrefix);
        b.skip(lenPrefix);
      } else {
        bCopy = b.copy(b.offset, b.offset + len);
        b.skip(len);
      }
      return Buffer.from(bCopy.toBinary(), 'binary');
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      // value = _bytebuf.fromObject(value)

      var len = validation.len;

      if (len == null) {
        b.writeVarint32(value.length);
      }
      b.append(value.toString('binary'), 'binary');
    },
    fromObject: function fromObject(value) {
      if (typeof value === 'string') {
        value = Buffer.from(value, 'hex');
      }

      validate(value, validation);
      return value;
    },
    toObject: function toObject(value) {
      var defaults = validation.defaults,
          len = validation.len;

      if (defaults && value == null) {
        return Array(len ? len + 1 : 1).join('00');
      }
      validate(value, validation);
      return value.toString('hex');
    },
    compare: function compare(a, b) {
      return Buffer.compare(a, b);
    }
  };
  return _bytebuf;
};

var _string = function _string(validation) {
  return {
    fromByteBuffer: function fromByteBuffer(b) {
      return b.readVString();
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      validate(value, validation);
      b.writeVString(value.toString());
    },
    fromObject: function fromObject(value) {
      validate(value, validation);
      return value;
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return '';
      }
      validate(value, validation);
      return value;
    }
  };
};

var _time2 = function _time2(validation) {
  var _time = {
    fromByteBuffer: function fromByteBuffer(b) {
      return b.readUint32();
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      // if(typeof value !== "number")
      //     value = _time.fromObject(value)

      validate(value, validation);
      b.writeUint32(value);
    },
    fromObject: function fromObject(value) {
      validate(value, validation);

      if (typeof value === 'number') {
        return value;
      }

      if (value.getTime) {
        return Math.floor(value.getTime() / 1000);
      }

      if (typeof value !== 'string') {
        throw new Error('Unknown date type: ' + value);
      }

      // Chrome assumes Zulu when missing, Firefox does not
      if (typeof value === 'string' && !/Z$/.test(value)) {
        value += 'Z';
      }

      return Math.floor(new Date(value).getTime() / 1000);
    },
    toObject: function toObject(value) {
      if (validation.defaults && value == null) {
        return new Date(0).toISOString().split('.')[0];
      }

      validate(value, validation);

      // if(typeof value === "string") {
      //     if(!/Z$/.test(value))
      //         value += "Z"
      //
      //     return value
      // }

      // if(value.getTime)
      //     return value.toISOString().split('.')[0] + 'Z'

      validateInt(value, spread(validation, { bits: 32 }));
      var int = parseInt(value);
      return new Date(int * 1000).toISOString().split('.')[0];
    }
  };
  return _time;
};

var validate = function validate(value, validation) {
  if (isEmpty(value)) {
    throw new Error('Required ' + validation.typeName);
  }

  if (validation.len != null) {
    if (value.length == null) {
      throw new Error('len validation requries a "length" property');
    }

    var len = validation.len;

    if (value.length !== len) {
      throw new Error(validation.typeName + ' length ' + value.length + ' does not equal ' + len);
    }
  }

  if (validation.maxLen != null) {
    var maxLen = validation.maxLen;

    if (value.length == null) {
      throw new Error('maxLen validation requries a "length" property');
    }

    if (value.length > maxLen) {
      throw new Error(validation.typeName + ' length ' + value.length + ' exceeds maxLen ' + maxLen);
    }
  }
};

var ZERO = new BN();
var ONE = new BN('1');

function validateInt(value, validation) {
  if (isEmpty(value)) {
    throw new Error('Required ' + validation.typeName);
  }
  var _validation$signed2 = validation.signed,
      signed = _validation$signed2 === undefined ? false : _validation$signed2,
      _validation$bits = validation.bits,
      bits = _validation$bits === undefined ? 54 : _validation$bits;


  value = String(value).trim();
  if (signed && !/^-?[0-9]+$/.test(value) || !signed && !/^[0-9]+$/.test(value)) {
    throw new Error('Number format ' + validation.typeName + ' ' + value);
  }

  var max = signed ? maxSigned(bits) : maxUnsigned(bits);
  var min = signed ? minSigned(bits) : ZERO;
  var i = new BN(value);

  // console.log('i.toString(), min.toString()', i.toString(), min.toString())
  if (i.cmp(min) < 0 || i.cmp(max) > 0) {
    throw new Error('Overflow ' + validation.typeName + ' ' + value + ', ' + ('max ' + max.toString() + ', min ' + min.toString() + ', signed ' + signed + ', bits ' + bits));
  }
}

var isSerializer = function isSerializer(type) {
  return (typeof type === 'undefined' ? 'undefined' : _typeof(type)) === 'object' && typeof type.fromByteBuffer === 'function' && typeof type.appendByteBuffer === 'function' && typeof type.fromObject === 'function' && typeof type.toObject === 'function';
};

var toString = function toString(value, encoding) {
  return value == null ? value : value.toString ? value.toString(encoding) : value;
};

var sort = function sort(type, values) {
  return type.compare ? values.sort(type.compare) : // custom compare
  values.sort();
};

var spread = function spread() {
  return Object.assign.apply(Object, arguments);
};
var isEmpty = function isEmpty(value) {
  return value == null;
};

// 1 << N === Math.pow(2, N)
var maxUnsigned = function maxUnsigned(bits) {
  return new BN(1).ishln(bits).isub(ONE);
};
var maxSigned = function maxSigned(bits) {
  return new BN(1).ishln(bits - 1).isub(ONE);
};
var minSigned = function minSigned(bits) {
  return new BN(1).ishln(bits - 1).ineg();
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),

/***/ 3275:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {/**
 * pure javascript functions to read and write 32-bit and 64-bit IEEE 754 floating-point
 *
 * Copyright (C) 2017 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */



var isBigeCpu = false;
var readFloat32Array, writeFloat32Array, readFloat32ArrayRev, writeFloat32ArrayRev;
var readFloat64Array, writeFloat64Array, readFloat64ArrayRev, writeFloat64ArrayRev;


// test FloatArray existence with && to not throw off code coverage
(typeof Float32Array === 'function') && (function(){
    var _fp32 = new Float32Array(1);
    var _b32 = new Uint8Array(_fp32.buffer);

    _fp32[0] = -1;
    isBigeCpu = _b32[3] === 0;

    readFloat32Array = function readFloat32Array( buf, pos ) {
        pos = pos || 0;
        if (pos < 0 || pos + 4 > buf.length) return 0;
        _b32[0] = buf[pos++]; _b32[1] = buf[pos++]; _b32[2] = buf[pos++];_b32[3] = buf[pos];
        //_b32[0] = buf[pos+0]; _b32[1] = buf[pos+1]; _b32[2] = buf[pos+2]; _b32[3] = buf[pos+3];
        return _fp32[0];
    }

    readFloat32ArrayRev = function readFloat32ArrayRev( buf, pos ) {
        pos = pos || 0;
        if (pos < 0 || pos + 4 > buf.length) return 0;
        _b32[3] = buf[pos++]; _b32[2] = buf[pos++]; _b32[1] = buf[pos++]; _b32[0] = buf[pos];
        //_b32[3] = buf[pos+0]; _b32[2] = buf[pos+1]; _b32[1] = buf[pos+2]; _b32[0] = buf[pos+3];
        return _fp32[0];
    }

    writeFloat32Array = function writeFloat32Array( buf, v, pos ) {
        pos = pos || 0;
        _fp32[0] = v;
        buf[pos++] = _b32[0]; buf[pos++] = _b32[1]; buf[pos++] = _b32[2]; buf[pos] = _b32[3];
        //buf[pos+0] = _b32[0]; buf[pos+1] = _b32[1]; buf[pos+2] = _b32[2]; buf[pos+3] = _b32[3];
    }

    writeFloat32ArrayRev = function writeFloat32ArrayRev( buf, v, pos ) {
        pos = pos || 0;
        _fp32[0] = v;
        buf[pos++] = _b32[3]; buf[pos++] = _b32[2]; buf[pos++] = _b32[1]; buf[pos] = _b32[0];
        //buf[pos+0] = _b32[3]; buf[pos+1] = _b32[2]; buf[pos+2] = _b32[1]; buf[pos+3] = _b32[0];
    }
})();

(typeof Float64Array === 'function') && (function(){
    var _fp64 = new Float64Array(1);
    var _b64 = new Uint8Array(_fp64.buffer);

    readFloat64Array = function readFloat64Array( buf, pos ) {
        pos = pos || 0;
        if (pos < 0 || pos + 8 > buf.length) return 0;
        //_b64[0] = buf[pos++]; _b64[1] = buf[pos++]; _b64[2] = buf[pos++]; _b64[3] = buf[pos++];
        //_b64[4] = buf[pos++]; _b64[5] = buf[pos++]; _b64[6] = buf[pos++]; _b64[7] = buf[pos];
        _b64[0] = buf[pos+0]; _b64[1] = buf[pos+1]; _b64[2] = buf[pos+2]; _b64[3] = buf[pos+3];
        _b64[4] = buf[pos+4]; _b64[5] = buf[pos+5]; _b64[6] = buf[pos+6]; _b64[7] = buf[pos+7];
        return _fp64[0];
    }

    readFloat64ArrayRev = function readFloat64ArrayRev( buf, pos ) {
        pos = pos || 0;
        if (pos < 0 || pos + 8 > buf.length) return 0;
        //_b64[7] = buf[pos++]; _b64[6] = buf[pos++]; _b64[5] = buf[pos++]; _b64[4] = buf[pos++];
        //_b64[3] = buf[pos++]; _b64[2] = buf[pos++]; _b64[1] = buf[pos++]; _b64[0] = buf[pos];
        _b64[7] = buf[pos+0]; _b64[6] = buf[pos+1]; _b64[5] = buf[pos+2]; _b64[4] = buf[pos+3];
        _b64[3] = buf[pos+4]; _b64[2] = buf[pos+5]; _b64[1] = buf[pos+6]; _b64[0] = buf[pos+7];
        return _fp64[0];
    }

    writeFloat64Array = function writeFloat64Array( buf, v, pos ) {
        pos = pos || 0;
        _fp64[0] = v;
        buf[pos + 0] = _b64[0]; buf[pos + 1] = _b64[1]; buf[pos + 2] = _b64[2]; buf[pos + 3] = _b64[3];
        buf[pos + 4] = _b64[4]; buf[pos + 5] = _b64[5]; buf[pos + 6] = _b64[6]; buf[pos + 7] = _b64[7];
    }

    writeFloat64ArrayRev = function writeFloat64ArrayRev( buf, v, pos ) {
        pos = pos || 0;
        _fp64[0] = v;
        buf[pos + 0] = _b64[7]; buf[pos + 1] = _b64[6]; buf[pos + 2] = _b64[5]; buf[pos + 3] = _b64[4];
        buf[pos + 4] = _b64[3]; buf[pos + 5] = _b64[2]; buf[pos + 6] = _b64[1]; buf[pos + 7] = _b64[0];
    }
})();


// arithmetic operations preserve NaN, but logical ops (, >>, etc) convert them to zero
// Assemble the word to generate NaN if any reads are undefined (outside the bounds of the array).
function readWord( buf, offs, dirn ) {
    var a = buf[offs++], b = buf[offs++], c = buf[offs++], d = buf[offs];
    return (dirn === 'bige')
        ? (((((a * 256) + b) * 256) + c) * 256) + d
        : (((((d * 256) + c) * 256) + b) * 256) + a;
}

function writeWord( buf, v, offs, dirn ) {
    var a = (v >>> 24) & 0xff, b = (v >> 16) & 0xff, c = (v >> 8) & 0xff, d = (v) & 0xff;
    (dirn === 'bige')
        ? (buf[offs++] = a, buf[offs++] = b, buf[offs++] = c, buf[offs] = d)
        : (buf[offs++] = d, buf[offs++] = c, buf[offs++] = b, buf[offs] = a)
}

// write the two-word value [hi,lo] where hi holds the 32 msb bits and lo the 32 lsb bits
function writeDoubleWord( buf, hi, lo, offs, dirn ) {
    if (dirn === 'bige') {
        writeWord(buf, hi, offs, dirn);
        writeWord(buf, lo, offs + 4, dirn);
    }
    else {
        writeWord(buf, lo, offs, dirn);
        writeWord(buf, hi, offs + 4, dirn);
    }
}

// given an exponent n, return 2**n
// n is always an integer, faster to shift when possible
// Note that nodejs Math.pow() is faster than a lookup table (may be caching)
var _2eXp = new Array(); for (var i=0; i<1200; i++) _2eXp[i] = Math.pow(2, i);
var _2eXn = new Array(); for (var i=0; i<1200; i++) _2eXn[i] = Math.pow(2, -i);
function pow2( exp ) {
    return (exp >= 0) ? _2eXp[exp] : _2eXn[-exp];
    //return (exp >= 0) ? (exp <  31 ? (1 << exp) :        Math.pow(2, exp))
    //                  : (exp > -31 ? (1 / (1 << -exp)) : Math.pow(2, exp));
}


// getFloat() from qbson, https://github.com/andrasq/node-qbson:
/*
 * extract the 64-bit little-endian ieee 754 floating-point value
 *   see http://en.wikipedia.org/wiki/Double-precision_floating-point_format
 *   1 bit sign + 11 bits exponent + (1 implicit mantissa 1 bit) + 52 mantissa bits
 */
var _rshift32 = (1 / 0x100000000);      // >> 32 for floats
var _rshift20 = (1 / 0x100000);         // >> 20 for floats
var _lshift32 = (1 * 0x100000000);      // << 32
var _rshift52 = (1 * _rshift32 * _rshift20);    // >> 52
var _rshift1023 = pow2(-1023);          // 2^-1023
function readDouble( buf, offset, dirn ) {
    var w0 = readWord(buf, offset, dirn);
    var w1 = readWord(buf, offset + 4, dirn);
    var highWord, lowWord;
    (dirn === 'bige') ? (highWord = w0, lowWord = w1) : (highWord = w1, lowWord = w0);

    var mantissa = (highWord & 0x000FFFFF) * _lshift32 + lowWord;
    var exponent = (highWord & 0x7FF00000) >>> 20;
    var sign = (highWord >> 31) || 1;   // -1, 1, or 1 if NaN

    var value;
    if (exponent === 0x000) {
        // zero if !mantissa, else subnormal (non-normalized reduced precision small value)
        // recover negative zero -0.0 as distinct from 0.0
        // subnormals do not have an implied leading 1 bit and are positioned 1 bit to the left
        value = mantissa ? (mantissa * pow2(-52 + 1 -1023)) : 0.0;
    }
    else if (exponent < 0x7ff) {
        // normalized value with an implied leading 1 bit and 1023 biased exponent
        // test for NaN with (mantissa >= 0), and return 0 if NaN ie read from outside buffer bounds
        value = (mantissa >= 0) ? (1 + mantissa * _rshift52) * pow2(exponent - 1023) : 0.0;
    }
    else {
        // Infinity if zero mantissa (+/- per sign), NaN if nonzero mantissa
        value = mantissa ? NaN : Infinity;
    }

    return sign * value;
}

//
// Note: node-v9 prefers +28% (sign * value), node v6 doesnt care, node v8 likes +16% (-value : value)
//
// float32: 1 sign + 8 exponent + 24 mantissa (23 stored, 1 implied)
// see https://en.wikipedia.org/wiki/Single-precision_floating-point_format
//
// Exponent     Mantissa == 0   Mantissa > 0    Value
// 00           +0, -0          denormalized    2^(  1-127) * (0. + (mantissa / 2^23))
// 00.. FE                      normalized      2^(exp-127) * (1. + (mantissa / 2^23))
// FF           +/-Infinity     NaN             -
//
var _rshift23 = Math.pow(2, -23);      // >> 23 for floats
var _rshift127 = Math.pow(2, -127);    // 2^-127
function readFloat( buf, offset, dirn ) {
    var word = readWord(buf, offset, dirn);
    var mantissa = (word & 0x007FFFFF);
    var exponent = (word & 0x7F800000) >>> 23;
    var sign = (word >> 31) || 1;       // -1, 1, or 1 if NaN

    var value;
    if (exponent === 0x000) {
        value = mantissa ? mantissa * _rshift23 * 2 * _rshift127 : 0.0;
    }
    else if (exponent < 0xff) {
        value = (1 + mantissa * _rshift23) * pow2(exponent - 127) // * _rshift127;
    }
    else {
        value = mantissa ? NaN : Infinity;
    }

    return sign * value;
    //return (word >>> 31) ? -value : value;
}

// given a positive value v, normalize it to between 1 and less than 2 with a binary exponent
// The exponent is the number of bit places it was shifted, positive if v was >= 2.
// The special values 0, -0, NaN, +Infinity and -Infinity are not handled here.
// Looping is faster than (Math.log(v) / Math.LN2) in node-v6, v8, and v9.
// This function can account for half the time taken to write a double.
var _parts = { exp: 0, mant: 0 };
function normalize( v ) {
    var exp = 0;

    if (v >= 2) {
        exp = countDoublings(1, v);
        v *= pow2(-exp);
        // if doubled to exactly v/2, adjust up to v
        if (v >= 2) { v /= 2; exp += 1 }
    }
    else if (v < 1) {
        exp = countDoublings(v, 2);
        // avoid using pow2 exponents > 1023, they overflow to Infinity
        if (exp <= 1023) v *= pow2(exp);
        else { v *= pow2(exp - 100); v *= pow2(100); }
        exp = -exp;
    }

    // TODO: pass in num bits, and normalize straight to mantissa / denorm

    _parts.exp = exp;
    _parts.mant = v;
    return _parts;
}

// count how many doublings of a are needed for it be close to b.
// Returns a shift count that grows (a) to at least (b/2) but less than (b).
// Doubling 1 toward v ensures that (v >> n) >= 1 < 2,
// and doubling from v toward 2 ensures that (v << n) >= 1 < 2.
var _2e192 = Math.pow(2, 192);
function countDoublings( a, b ) {
    var n = 0;

    while (a * _2e192 < b) { a *= _2e192; n += 192 }
    while (a * 0x10000000000000000 < b) { a *= 0x10000000000000000; n += 64 }
    while (a * 0x10000 < b) { a *= 0x10000; n += 16 }
    while (a * 0x40 < b) { a *= 0x40; n += 6 }
    while (a * 2 < b) { a *= 2; n += 1 }

    return n;
}

// round the fraction in v and scale up to scale = 2^n bits
// https://blog.angularindepth.com/how-to-round-binary-fractions-625c8fa3a1af
// Rounding can cause the scaled value to exceed 2^n.
function roundMantissa( v, scale ) {
    v *= scale;
    // round to nearest, but round a 0.5 tie to even (0.5 to 0.0 and 1.5 to 2.0)
    // round all numbers with a fraction other than 1/2, and round up odd numbers with
    return ((v - Math.floor(v) !== 0.5) || (v & 1)) ? v + 0.5 : v;
}

// float32: 1 sign + 8 exponent + (1 implied mantissa 1 bit) + 23 stored mantissa bits
// NaN types: quiet Nan = x.ff.8xxx, signaling NaN = x.ff.0xx1 (msb zero, at least one other bit set)
// JavaScript built-in NaN is the non-signaling 7fc00000, but arithmetic can yield a negative NaN ffc00000.
function writeFloat( buf, v, offset, dirn ) {
    var norm, word, sign = 0;
    if (v < 0) { sign = 0x80000000; v = -v; }

    if (! (v && v < Infinity)) {
        if (v === 0) {                  // -0, +0
            word = (1/v < 0) ? 0x80000000 : 0x00000000;
        }
        else if (v === Infinity) {      // -Infinity, +Infinity
            word = sign | 0x7F800000;
        }
        else {                          // NaN - positive, non-signaling
            word = 0x7FC00000;
        }
        writeWord(buf, word, offset, dirn);
    }
    else {
        norm = normalize(v);            // separate exponent and mantissa
        norm.exp += 127;                // bias exponent

        if (norm.exp <= 0) {            // denormalized number
            if (norm.exp <= -25) {      // too small, underflow to zero.  -24 might round up though.
                norm.mant = 0;
                norm.exp = 0;
            } else {                    // denormalize
                norm.mant = roundMantissa(norm.mant, pow2(22 + norm.exp));
                norm.exp = 0;           // rounding can carry out and re-normalize the number
                if (norm.mant >= 0x800000) { norm.mant -= 0x800000; norm.exp += 1 }
            }
        } else {
            norm.mant = roundMantissa(norm.mant - 1, 0x800000);
            // if rounding overflowed into the hidden 1s place, hide it and adjust the exponent
            if (norm.mant >= 0x800000) { norm.mant -= 0x800000; norm.exp += 1 }
            if (norm.exp > 254) {       // overflow to Infinity
                norm.mant = 0;
                norm.exp = 255;
            }
        }

        word = sign | (norm.exp << 23) | norm.mant;
        writeWord(buf, word, offset, dirn);
    }
}

// double64: 1 bit sign + 11 bits exponent + (1 implied mantissa 1 bit) + 52 stored mantissa bits
// Writing doubles is simpler than floats, because the internal javascript 64-bit floats
// are identical to the stored representation, and thus will not overflow or underflow.
var doubleArray = [0, 0, 0, 0, 0, 0, 0, 0];
var doubleBuf = new Buffer(8);
var _2e52 = Math.pow(2, 52);
function writeDouble( buf, v, offset, dirn ) {
    var norm, highWord, lowWord, sign = 0;
    if (v < 0) { sign = 0x80000000; v = -v; }

    if (! (v && v < Infinity)) {
        if (v === 0) {                  // -0, +0
            highWord = (1/v < 0) ? 0x80000000 : 0;
            lowWord = 0;
        }
        else if (v === Infinity) {      // -Infinity, +Infinity
            highWord = (sign + 0x7FF00000);
            lowWord = 0;
        }
        else {                          // NaN - positive, non-signaling
            highWord = 0x7FF80000;
            lowWord = 0;
        }
        writeDoubleWord(buf, highWord, lowWord, offset, dirn);
    }
    else {
        norm = normalize(v);            // separate exponent and mantissa
        norm.exp += 1023;               // bias exponent

        if (norm.exp <= 0) {            // denormalized
            // JavaScript numbers can not hold values small enough to underflow
            // and no need to round, all bits will be written
            norm.mant *= pow2(51 + norm.exp);
            norm.exp = 0;
        }
        else {
            // no need to round, all bits will be written
            norm.mant = (norm.mant - 1) * _2e52;
        }

        highWord = sign | (norm.exp << 20) | (norm.mant / 0x100000000);
        lowWord = norm.mant >>> 0;
        writeDoubleWord(buf, highWord, lowWord, offset, dirn);
    }
}


;(function install() {
    var exports = typeof module === 'object' && module.exports || this;

    exports.readWord = readWord;
    exports.writeWord = writeWord;
    exports.writeDoubleWord = writeDoubleWord;

    exports.readFloat = readFloat;
    exports.writeFloat = writeFloat;
    exports.readDouble = readDouble;
    exports.writeDouble = writeDouble;

    // expose the implementation to the tests
    exports._useFloatArray = function( yesno ) {
        exports._usingFloatArray = yesno;
        if (yesno) {
            // software conversion is faster for float32 than Float32Array
            // Only read via Float32Array if yesno == 'full'.
            if (yesno == 'full') exports.readFloatLE = isBigeCpu ? readFloat32ArrayRev : readFloat32Array;
            exports.writeFloatLE = isBigeCpu ? writeFloat32ArrayRev : writeFloat32Array;
            if (yesno == 'full') exports.readFloatBE = isBigeCpu ? readFloat32Array : readFloat32ArrayRev;
            exports.writeFloatBE = isBigeCpu ? writeFloat32Array : writeFloat32ArrayRev;

            exports.readDoubleLE = isBigeCpu ? readFloat64ArrayRev : readFloat64Array;
            exports.writeDoubleLE = isBigeCpu ? writeFloat64ArrayRev : writeFloat64Array;
            exports.readDoubleBE = isBigeCpu ? readFloat64Array : readFloat64ArrayRev;
            exports.writeDoubleBE = isBigeCpu ? writeFloat64Array : writeFloat64ArrayRev;
        }
        else {
            exports._usingFloatArray = '';
            exports.readFloatLE = function readFloatLE( buf, offset ) { return exports.readFloat(buf, offset || 0, 'le'); }
            exports.writeFloatLE = function writeFloatLE( buf, v, offset ) { exports.writeFloat(buf, v, offset || 0, 'le'); };
            exports.readFloatBE = function readFloatBE( buf, offset ) { return exports.readFloat(buf, offset || 0, 'bige'); }
            exports.writeFloatBE = function writeFloatBE( buf, v, offset ) { exports.writeFloat(buf, v, offset || 0, 'bige'); }

            exports.readDoubleLE = function readDoubleLE( buf, offset ) { return exports.readDouble(buf, offset || 0, 'le'); }
            exports.writeDoubleLE = function writeDoubleLE( buf, v, offset ) { exports.writeDouble(buf, v, offset || 0, 'le'); }
            exports.readDoubleBE = function readDoubleBE( buf, offset ) { return exports.readDouble(buf, offset || 0, 'bige'); }
            exports.writeDoubleBE = function writeDoubleLE( buf, v, offset ) { exports.writeDouble(buf, v, offset || 0, 'bige'); }
        }
    }

    // expose the cpu endianism to the tests
    exports._getBigeCpu = function() { return isBigeCpu };
    exports._setBigeCpu = function(yesno) { isBigeCpu = yesno };

    // by default export the software conversion functions, then
    // if available, convert by casting a FloatArray to a byte array
    exports._useFloatArray(false);
    exports._useFloatArray(readFloat32Array && readFloat64Array && 'fastest');

    // accelerate access
    install.prototype = exports;

}).call(this);

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),

/***/ 3276:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var ByteBuffer = __webpack_require__(1184);
var Struct = __webpack_require__(3277);

module.exports = {
  create: create,
  toBuffer: toBuffer,
  fromBuffer: fromBuffer

  /**
    @summary Create a serializer for each definition.
    @return {CreateStruct}
  */
};function create(definitions, types) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : types.config;

  var errors = [];
  if (!config.sort) {
    config.sort = {};
  }

  // Basic structure validation
  for (var key in definitions) {
    var value = definitions[key];
    var base = value.base,
        fields = value.fields;

    var typeOfValue = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    if (typeOfValue === 'object') {
      if (!base && !fields) {
        errors.push('Expecting ' + key + '.fields or ' + key + '.base');
        continue;
      }
      if (base && typeof base !== 'string') {
        errors.push('Expecting string ' + key + '.base');
      }
      if (fields) {
        if ((typeof fields === 'undefined' ? 'undefined' : _typeof(fields)) !== 'object') {
          errors.push('Expecting object ' + key + '.fields');
        } else {
          for (var field in fields) {
            if (typeof fields[field] !== 'string') {
              errors.push('Expecting string in ' + key + '.fields.' + field);
            }
          }
        }
      }
    } else if (typeOfValue !== 'string') {
      errors.push('Expecting object or string under ' + key + ', instead got ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)));
      continue;
    }
  }

  // Keys with objects are structs
  var structs = {};
  for (var _key in definitions) {
    var _value = definitions[_key];
    if ((typeof _value === 'undefined' ? 'undefined' : _typeof(_value)) === 'object') {
      structs[_key] = Struct(_key, config);
    }
  }

  // Resolve user-friendly typedef names pointing to a native type (or another typedef)
  for (var _key2 in definitions) {
    var _value2 = definitions[_key2];
    if (typeof _value2 === 'string') {
      var type = types[_value2];
      if (type) {
        types[_key2] = type;
      } else {
        // example: key === 'fields' && value === field[]
        var struct = getTypeOrStruct(_key2, _value2); // type = vector(field)
        if (struct) {
          structs[_key2] = struct;
        } else {
          errors.push('Unrecognized type or struct ' + _key2 + '.' + _value2);
        }
      }
    }
  }

  // Structs can inherit another struct, they will share the same instance
  for (var _key3 in definitions) {
    var thisStruct = structs[_key3];
    if (!thisStruct) continue;
    var _value3 = definitions[_key3];
    if ((typeof _value3 === 'undefined' ? 'undefined' : _typeof(_value3)) === 'object' && _value3.base) {
      var base = _value3.base;
      var baseStruct = structs[base];
      if (!baseStruct) {
        errors.push('Missing ' + base + ' in ' + _key3 + '.base');
        continue;
      }
      thisStruct.add('', structPtr(baseStruct));
    }
  }

  // Create types from a string (ex vector[Type])
  function getTypeOrStruct(key, Type, typeArgs, fieldName) {
    var typeatty = parseType(Type);
    if (!typeatty) return null;
    var name = typeatty.name,
        annotation = typeatty.annotation,
        arrayType = typeatty.arrayType;

    var ret = void 0;
    if (annotation) {
      // any_type<field_name, type_name>
      var _type = types[name];
      if (_type == null) {
        errors.push('Missing ' + name + ' in ' + Type);
        return null;
      }
      var annTypes = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = annotation[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var annTypeName = _step.value;

          var annType = getTypeOrStruct(key, annTypeName, null, fieldName);
          if (!annType) {
            errors.push('Missing ' + annTypeName + ' in ' + Type);
            return null;
          }
          annTypes.push(annType);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      ret = _type(annTypes);
    } else if (arrayType == null) {
      // AnyType
      var fieldStruct = structs[name];
      if (fieldStruct) {
        return fieldStruct;
      }

      var _type2 = types[name];
      if (!_type2) {
        return null;
      }

      // types need to be instantiated
      ret = _type2(typeArgs);
    } else if (arrayType === '') {
      // AnyType[]
      var nameType = getTypeOrStruct(key, typeatty.name, null, fieldName);
      if (!nameType) {
        return null;
      }

      var sort = config.sort[key + '.' + fieldName] || false;
      // console.log('sort?', `${key}.${fieldName}`, sort, config.sort)
      ret = types.vector(nameType, sort);
    } else if (arrayType.length > 0) {
      // vector[Type]
      var arrayTs = getTypeOrStruct(key, typeatty.arrayType, null, fieldName);
      if (!arrayTs) {
        errors.push('Missing ' + typeatty.arrayType + ' in ' + Type);
        return null;
      }
      var baseTs = getTypeOrStruct(key, typeatty.name, arrayTs, fieldName);
      if (!baseTs) {
        errors.push('Missing ' + typeatty.name + ' in ' + Type);
        return null;
      }
      ret = baseTs;
    }
    return typeatty.optional ? types.optional(ret) : ret;
  }

  // Add all the fields.  Thanks to structPtr no need to look at base types.
  for (var _key4 in definitions) {
    var _thisStruct = structs[_key4];
    if (!_thisStruct) continue;
    var _value4 = definitions[_key4];
    if (!_value4.fields) continue;
    var fields = _value4.fields;

    for (var Field in fields) {
      var Type = fields[Field];
      var ts = getTypeOrStruct(_key4, Type, null, Field);
      if (!ts) {
        errors.push('Missing ' + Type + ' in ' + _key4 + '.fields.' + Field);
        continue;
      }
      _thisStruct.add(Field, ts);
    }
  }

  if (errors.length) {
    // 'structs' could contain invalid references
    return { errors: errors };
  }

  return { errors: errors, structs: structs };
}

var parseType = function parseType(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }

  name = name.trim();

  var annotationMatch = name.match(/<(.*)>/);
  if (annotationMatch) {
    var annotation = annotationMatch ? annotationMatch[1].replace(/ /g, '').split(',') : null;

    name = name.replace(annotationMatch[0], '').trim();
    return { name: name, annotation: annotation };
  }

  var arrayMatch = name.match(/\[(.*)\]/);
  var arrayType = arrayMatch ? arrayMatch[1].trim() : null;

  if (arrayMatch) {
    name = name.replace(arrayMatch[0], '').trim();
  }

  var optional = false;
  if (/\?$/.test(name)) {
    name = name.substring(0, name.length - 1);
    optional = true;
  }
  return { name: name, arrayType: arrayType, optional: optional };
};

/**
  Base types all point to the same struct.

  Note, appendByteBuffer has no return type.
*/
var structPtr = function structPtr(type) {
  return {
    fromByteBuffer: function fromByteBuffer(b) {
      return type.fromByteBuffer(b);
    },
    appendByteBuffer: function appendByteBuffer(b, value) {
      type.appendByteBuffer(b, value);
    },
    fromObject: function fromObject(value) {
      return type.fromObject(value);
    },
    toObject: function toObject(value) {
      return type.toObject(value);
    }
  };
};

function toBuffer(type, value) {
  var struct = type.fromObject(value);
  return Buffer.from(toByteBuffer(type, struct).toBinary(), 'binary');
}

function fromBuffer(type, buffer) {
  var toObject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var b = ByteBuffer.fromBinary(buffer.toString('binary'), ByteBuffer.LITTLE_ENDIAN);
  var struct = type.fromByteBuffer(b);
  return toObject ? type.toObject(struct) : struct;
}

function toByteBuffer(type, value) {
  var b = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN);
  type.appendByteBuffer(b, value);
  return b.copy(0, b.offset);
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),

/***/ 3277:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ByteBuffer = __webpack_require__(1184);

/**
  @class Struct

  @arg {object} config.override = {
    'Message.data.appendByteBuffer': ({fields, object, b}) => {..}
  }
  Rare cases where specialized serilization is needed (ex A Message object has
  'type' and 'data' fields where object.type === 'transfer' can define
  serialization time Struct needed for 'data' .. This saves complexity for the
  end-user's working with json.  See override unit test.
*/
module.exports = function (name) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { debug: false };

  config = Object.assign({ override: {} }, config);
  var fields = {};
  var fieldOne = void 0,
      fieldOneName = void 0;

  return {
    compare: function compare(a, b) {
      var v1 = a[fieldOneName];
      var v2 = b[fieldOneName];

      if (!fieldOne || !fieldOne.compare) {
        return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
      }

      return fieldOne.compare(v1, v2);
    },


    /** @private */
    add: function add(fieldName, type) {
      fields[fieldName] = type;
      if (fieldOne == null) {
        fieldOne = type;
        fieldOneName = fieldName;
      }
    },


    // Complete list of fields, after resolving "base" inheritance
    fields: fields,

    fromByteBuffer: function fromByteBuffer(b) {
      var object = {};
      var field = null;
      try {
        for (field in fields) {
          var type = fields[field];
          try {
            var o1 = b.offset;
            if (field === '') {
              // structPtr
              object = type.fromByteBuffer(b, config);
            } else {
              var fromByteBuffer = config.override[name + '.' + field + '.fromByteBuffer'];
              if (fromByteBuffer) {
                fromByteBuffer({ fields: fields, object: object, b: b, config: config });
              } else {
                object[field] = type.fromByteBuffer(b, config);
              }
            }
            if (config.debug) {
              if (type.struct) {
                console.error(type.struct);
              } else {
                var value = void 0;
                try {
                  // human readable text
                  value = type.toObject(field === '' ? object : object[field], config);
                } catch (error) {
                  // console.error('fromByteBuffer debug error:', error)
                  value = '';
                }
                var _b = b.copy(o1, b.offset);
                console.error('fromByteBuffer', name + '.' + field, '\'' + value + '\'', _b.toHex());
              }
            }
          } catch (e) {
            console.error(e + ' in ' + name + '.' + field);
            b.printDebug();
            throw e;
          }
        }
      } catch (error) {
        error.message += ' in ' + name + '.' + field;
        throw error;
      }
      return object;
    },
    appendByteBuffer: function appendByteBuffer(b, object) {
      var field = null;
      try {
        for (field in fields) {
          var type = fields[field];
          if (field === '') {
            // structPtr
            type.appendByteBuffer(b, object);
          } else {
            var appendByteBuffer = config.override[name + '.' + field + '.appendByteBuffer'];
            if (appendByteBuffer) {
              appendByteBuffer({ fields: fields, object: object, b: b });
            } else {
              type.appendByteBuffer(b, object[field]);
            }
          }
        }
      } catch (error) {
        try {
          error.message += ' ' + name + '.' + field + ' = ' + JSON.stringify(object[field]);
        } catch (e) {
          // circular ref
          error.message += ' ' + name + '.' + field + ' = ' + object[field];
        }
        throw error;
      }
    },
    fromObject: function fromObject(serializedObject) {
      var fromObject_struct = config.override[name + '.fromObject'];
      if (fromObject_struct) {
        var ret = fromObject_struct(serializedObject);
        if (ret != null) {
          return ret;
        }
      }

      var result = {};
      var field = null;
      try {
        for (field in fields) {
          // if(config.debug) {
          //   console.error(name, field, '(fromObject)')
          // }
          var type = fields[field];
          if (field === '') {
            // structPtr
            var object = type.fromObject(serializedObject);
            Object.assign(result, object);
          } else {
            var fromObject = config.override[name + '.' + field + '.fromObject'];
            if (fromObject) {
              fromObject({ fields: fields, object: serializedObject, result: result });
            } else {
              var value = serializedObject[field];
              var _object = type.fromObject(value);
              result[field] = _object;
            }
          }
        }
      } catch (error) {
        error.message += ' ' + name + '.' + field;
        throw error;
      }

      return result;
    },
    toObject: function toObject() {
      var serializedObject = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var toObject_struct = config.override[name + '.toObject'];
      if (toObject_struct) {
        var ret = toObject_struct(serializedObject);
        if (ret != null) {
          return ret;
        }
      }

      var result = {};
      var field = null;
      try {
        // if (!fields) { return result }

        for (field in fields) {
          var type = fields[field];

          var toObject = config.override[name + '.' + field + '.toObject'];
          if (toObject) {
            toObject({ fields: fields, object: serializedObject, result: result, config: config });
          } else {
            if (field === '') {
              // structPtr
              var object = type.toObject(serializedObject, config);
              Object.assign(result, object);
            } else {
              var _object2 = type.toObject(serializedObject ? serializedObject[field] : null, config);
              result[field] = _object2;
            }
          }

          if (config.debug) {
            try {
              var b = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN);
              if (serializedObject != null) {
                var value = serializedObject[field];
                if (value) {
                  var appendByteBuffer = config.override[name + '.' + field + '.appendByteBuffer'];
                  if (toObject && appendByteBuffer) {
                    appendByteBuffer({ fields: fields, object: serializedObject, b: b });
                  } else {
                    type.appendByteBuffer(b, value);
                  }
                }
              }
              b = b.copy(0, b.offset);
              console.error('toObject', name + '.' + field, '\'' + result[field] + '\'', b.toHex());
            } catch (error) {
              // work-around to prevent debug time crash
              error.message = name + '.' + field + ' ' + error.message;
              console.error(error);
            }
          }
        }
      } catch (error) {
        error.message += ' ' + name + '.' + field;
        throw error;
      }
      return result;
    }
  };
};

/***/ }),

/***/ 3278:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  chain: __webpack_require__(3279),
  history: __webpack_require__(3280)
};

/***/ }),

/***/ 3279:
/***/ (function(module, exports) {

module.exports = {"get_info":{"brief":"Return general network information.","params":null,"results":"string"},"get_account":{"brief":"Fetch a blockchain account","params":{"account_name":"name"},"results":"string"},"get_code":{"brief":"Fetch smart contract code","params":{"account_name":"name","code_as_wasm":{"type":"bool","default":false}},"results":{"account_name":"name","wast":"string","wasm":"string","code_hash":"sha256","abi":"optional<abi_def>"}},"get_code_hash":{"brief":"","params":{"account_name":"name"},"results":{"account_name":"name","code_hash":"sha256"}},"get_abi":{"params":{"account_name":"name"},"results":{"account_name":"name","abi":"abi_def?"}},"get_raw_code_and_abi":{"params":{"account_name":"name"},"results":{"account_name":"name","wasm":"bytes","abi":"abi_def?"}},"abi_json_to_bin":{"brief":"Manually serialize json into binary hex.  The binayargs is usually stored in Action.data.","params":{"code":"name","action":"name","args":"bytes"},"results":{"binargs":"bytes"}},"abi_bin_to_json":{"brief":"Convert bin hex back into Abi json definition.","params":{"code":"name","action":"name","binargs":"bytes"},"results":{"args":"bytes"}},"get_required_keys":{"params":{"transaction":"transaction","available_keys":"set[public_key]"},"results":"Set[public_key]"},"get_block":{"brief":"Fetch a block from the blockchain.","params":{"block_num_or_id":"string"},"results":"variant","errors":{"unknown block":null}},"get_block_header_state":{"brief":"Fetch the minimum state necessary to validate transaction headers.","params":{"block_num_or_id":"string"},"results":"string","errors":{"block_id_type_exception":"Invalid block ID","unknown_block_exception":"Could not find reversible block"}},"get_table_rows":{"brief":"Fetch smart contract data from an account.","params":{"json":{"type":"bool","default":false},"code":"name","scope":"string","table":"name","table_key":"string","lower_bound":{"type":"string","default":"0"},"upper_bound":{"type":"string","default":"-1"},"limit":{"type":"uint32","default":"10"},"key_type":{"type":"string","doc":"The key type of --index, primary only supports (i64), all others support (i64, i128, i256, float64, float128). Special type 'name' indicates an account name."},"index_position":{"type":"string","doc":"1 - primary (first), 2 - secondary index (in order defined by multi_index), 3 - third index, etc"}},"results":{"rows":{"type":"vector","doc":"One row per item, either encoded as hex String or JSON object"},"more":{"type":"bool","doc":"True if last element in data is not the end and sizeof data() < limit"}}},"get_currency_balance":{"params":{"code":"name","account":"name","symbol":"optional<string>"},"results":"asset[]"},"get_currency_stats":{"params":{"code":"name","symbol":"string"},"results":{"supply":"asset","max_supply":"asset","issuer":"account_name"}},"get_producers":{"brief":"Fetch smart contract data from producer.","params":{"json":{"type":"bool","default":false},"lower_bound":"string","limit":{"type":"uint32","default":"50"}},"results":{"rows":{"type":"vector","doc":"one row per item, either encoded as hex String or JSON object"},"total_producer_vote_weight":{"type":"double","doc":"total vote"},"more":{"type":"string","doc":"fill lower_bound with this value to fetch more rows"}}},"get_producer_schedule":{"brief":"","params":{},"results":{"vector":"proposed"}},"get_scheduled_transactions":{"brief":"","params":{"json":{"type":"bool","default":false},"lower_bound":{"type":"string","doc":"timestamp OR transaction ID"},"limit":{"type":"uint32","default":"50"}},"results":{"vector":"transactions","more":{"type":"string","doc":"fill lower_bound with this to fetch next set of transactions"}}},"push_block":{"brief":"Append a block to the chain database.","params":{"block":"signed_block"},"results":null},"push_transaction":{"brief":"Attempts to push the transaction into the pending queue.","params":{"signed_transaction":"signed_transaction"},"results":{"transaction_id":"fixed_bytes32","processed":"bytes"}},"push_transactions":{"brief":"Attempts to push transactions into the pending queue.","params":{"signed_transaction[]":"signed_transaction"},"results":"vector[push_transaction.results]"}}

/***/ }),

/***/ 3280:
/***/ (function(module, exports) {

module.exports = {"get_actions":{"params":{"account_name":"account_name","pos":{"type":"int32?","doc":"An absolute sequence positon -1 is the end/last action"},"offset":{"type":"int32?","doc":"The number of actions relative to pos, negative numbers return [pos-offset,pos), positive numbers return [pos,pos+offset)"}},"results":{"actions":"ordered_action_result[]","last_irreversible_block":"uint32","time_limit_exceeded_error":"bool?"},"structs":[{"name":"ordered_action_result","fields":{"global_action_seq":"uint64","account_action_seq":"int32","block_num":"uint32","block_time":"block_timestamp_type","action_trace":"variant"}}]},"get_transaction":{"brief":"Retrieve a transaction from the blockchain.","params":{"id":"transaction_id_type","block_num_hint":{"type":"uint32?","default":0,"doc":"A non-zero block number allows shorter transaction IDs (8 hex, 4 bytes)"}},"results":{"id":"transaction_id_type","trx":"variant","block_time":"block_timestamp_type","block_num":"uint32","last_irreversible_block":"uint32","traces":"variant[]"}},"get_key_accounts":{"params":{"public_key":"public_key_type"},"results":{"account_names":"account_name[]"}},"get_controlled_accounts":{"params":{"controlling_account":"account_name"},"results":{"controlled_accounts":"account_name[]"}}}

/***/ }),

/***/ 3281:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(3282);
var camelCase = __webpack_require__(3284);
var helpers = __webpack_require__(3291);
var processArgs = __webpack_require__(3271);

module.exports = apiGen;

function apiGen(version, definitions) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var configDefaults = {
    httpEndpoint: 'http://127.0.0.1:8888',
    verbose: false,
    logger: {
      log: function log() {
        var _console;

        return config.verbose ? (_console = console).log.apply(_console, arguments) : null;
      },
      error: function error() {
        var _console2;

        return config.verbose ? (_console2 = console).error.apply(_console2, arguments) : null;
      }
    }
  };

  function applyDefaults(target, defaults) {
    Object.keys(defaults).forEach(function (key) {
      if (target[key] === undefined) {
        target[key] = defaults[key];
      }
    });
  }

  applyDefaults(config, configDefaults);
  applyDefaults(config.logger, configDefaults.logger);

  var api = {};
  var httpEndpoint = config.httpEndpoint;


  for (var apiGroup in definitions) {
    for (var apiMethod in definitions[apiGroup]) {
      var methodName = camelCase(apiMethod);
      var url = httpEndpoint + '/' + version + '/' + apiGroup + '/' + apiMethod;
      api[methodName] = fetchMethod(methodName, url, definitions[apiGroup][apiMethod], config);
    }
  }

  var _loop = function _loop(helper) {
    // Insert `api` as the first parameter to all API helpers
    api[helper] = function () {
      var _helpers$api;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_helpers$api = helpers.api)[helper].apply(_helpers$api, [api].concat(args));
    };
  };

  for (var helper in helpers.api) {
    _loop(helper);
  }
  return api;
}

function fetchMethod(methodName, url, definition, config) {
  var logger = config.logger;


  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (args.length === 0) {
      console.log(usage(methodName, definition));
      return;
    }

    var optionsFormatter = function optionsFormatter(option) {
      if (typeof option === 'boolean') {
        return { broadcast: option };
      }
    };

    var processedArgs = processArgs(args, Object.keys(definition.params || []), methodName, optionsFormatter);

    var params = processedArgs.params,
        options = processedArgs.options,
        returnPromise = processedArgs.returnPromise;
    var callback = processedArgs.callback;


    var body = JSON.stringify(params);
    if (logger.log) {
      logger.log('api >', 'post', '\t', url, body);
    }
    var fetchConfiguration = { body: body, method: 'POST' };
    Object.assign(fetchConfiguration, config.fetchConfiguration);

    fetch(url, fetchConfiguration).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      } else {
        return response.text().then(function (bodyResp) {
          var error = new Error(bodyResp);
          error.status = response.status;
          error.statusText = response.statusText;
          throw error;
        });
      }
    }).then(function (objectResp) {
      if (logger.log) {
        logger.log('api <', 'response', '\t', url, JSON.stringify(objectResp));
      }
      try {
        callback(null, objectResp);
      } catch (callbackError) {
        if (logger.error) {
          logger.error('api <', 'result callback', ':', callbackError);
        }
      }
    }).catch(function (error) {
      var message = '';
      try {
        // nodeos format (fail safe)
        message = JSON.parse(error.message).error.details[0];
      } catch (e2) {}

      if (logger.error) {
        logger.error('api <', 'error', '\t', message, url, body);
        logger.error(error);
      }

      try {
        callback(error);
      } catch (callbackError) {
        if (logger.error) {
          logger.error('api <', 'error callback', ':', callbackError);
        }
      }
    });

    return returnPromise;
  };
}

function usage(methodName, definition) {
  var usage = '';
  var out = function out(str) {
    usage += str + '\n';
  };

  out('USAGE');
  out(methodName + ' - ' + definition.brief);

  out('\nPARAMETERS');
  if (definition.params) {
    out(JSON.stringify(definition.params, null, 2));
  } else {
    out('none');
  }

  out('\nRETURNS');
  if (definition.results) {
    out('' + JSON.stringify(definition.results, null, 2));
  } else {
    out('no data');
  }

  out('\nERRORS');
  if (definition.errors) {
    for (var error in definition.errors) {
      var errorDesc = definition.errors[error];
      out('' + error + (errorDesc ? ' - ' + errorDesc : ''));
    }
  } else {
    out('nothing special');
  }

  return usage;
}

/***/ }),

/***/ 3282:
/***/ (function(module, exports, __webpack_require__) {

// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
__webpack_require__(3283);
module.exports = self.fetch.bind(self);


/***/ }),

/***/ 3283:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["Headers"] = Headers;
/* harmony export (immutable) */ __webpack_exports__["Request"] = Request;
/* harmony export (immutable) */ __webpack_exports__["Response"] = Response;
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DOMException", function() { return DOMException; });
/* harmony export (immutable) */ __webpack_exports__["fetch"] = fetch;
var support = {
  searchParams: 'URLSearchParams' in self,
  iterable: 'Symbol' in self && 'iterator' in Symbol,
  blob:
    'FileReader' in self &&
    'Blob' in self &&
    (function() {
      try {
        new Blob()
        return true
      } catch (e) {
        return false
      }
    })(),
  formData: 'FormData' in self,
  arrayBuffer: 'ArrayBuffer' in self
}

function isDataView(obj) {
  return obj && DataView.prototype.isPrototypeOf(obj)
}

if (support.arrayBuffer) {
  var viewClasses = [
    '[object Int8Array]',
    '[object Uint8Array]',
    '[object Uint8ClampedArray]',
    '[object Int16Array]',
    '[object Uint16Array]',
    '[object Int32Array]',
    '[object Uint32Array]',
    '[object Float32Array]',
    '[object Float64Array]'
  ]

  var isArrayBufferView =
    ArrayBuffer.isView ||
    function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
}

function normalizeName(name) {
  if (typeof name !== 'string') {
    name = String(name)
  }
  if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
    throw new TypeError('Invalid character in header field name')
  }
  return name.toLowerCase()
}

function normalizeValue(value) {
  if (typeof value !== 'string') {
    value = String(value)
  }
  return value
}

// Build a destructive iterator for the value list
function iteratorFor(items) {
  var iterator = {
    next: function() {
      var value = items.shift()
      return {done: value === undefined, value: value}
    }
  }

  if (support.iterable) {
    iterator[Symbol.iterator] = function() {
      return iterator
    }
  }

  return iterator
}

function Headers(headers) {
  this.map = {}

  if (headers instanceof Headers) {
    headers.forEach(function(value, name) {
      this.append(name, value)
    }, this)
  } else if (Array.isArray(headers)) {
    headers.forEach(function(header) {
      this.append(header[0], header[1])
    }, this)
  } else if (headers) {
    Object.getOwnPropertyNames(headers).forEach(function(name) {
      this.append(name, headers[name])
    }, this)
  }
}

Headers.prototype.append = function(name, value) {
  name = normalizeName(name)
  value = normalizeValue(value)
  var oldValue = this.map[name]
  this.map[name] = oldValue ? oldValue + ', ' + value : value
}

Headers.prototype['delete'] = function(name) {
  delete this.map[normalizeName(name)]
}

Headers.prototype.get = function(name) {
  name = normalizeName(name)
  return this.has(name) ? this.map[name] : null
}

Headers.prototype.has = function(name) {
  return this.map.hasOwnProperty(normalizeName(name))
}

Headers.prototype.set = function(name, value) {
  this.map[normalizeName(name)] = normalizeValue(value)
}

Headers.prototype.forEach = function(callback, thisArg) {
  for (var name in this.map) {
    if (this.map.hasOwnProperty(name)) {
      callback.call(thisArg, this.map[name], name, this)
    }
  }
}

Headers.prototype.keys = function() {
  var items = []
  this.forEach(function(value, name) {
    items.push(name)
  })
  return iteratorFor(items)
}

Headers.prototype.values = function() {
  var items = []
  this.forEach(function(value) {
    items.push(value)
  })
  return iteratorFor(items)
}

Headers.prototype.entries = function() {
  var items = []
  this.forEach(function(value, name) {
    items.push([name, value])
  })
  return iteratorFor(items)
}

if (support.iterable) {
  Headers.prototype[Symbol.iterator] = Headers.prototype.entries
}

function consumed(body) {
  if (body.bodyUsed) {
    return Promise.reject(new TypeError('Already read'))
  }
  body.bodyUsed = true
}

function fileReaderReady(reader) {
  return new Promise(function(resolve, reject) {
    reader.onload = function() {
      resolve(reader.result)
    }
    reader.onerror = function() {
      reject(reader.error)
    }
  })
}

function readBlobAsArrayBuffer(blob) {
  var reader = new FileReader()
  var promise = fileReaderReady(reader)
  reader.readAsArrayBuffer(blob)
  return promise
}

function readBlobAsText(blob) {
  var reader = new FileReader()
  var promise = fileReaderReady(reader)
  reader.readAsText(blob)
  return promise
}

function readArrayBufferAsText(buf) {
  var view = new Uint8Array(buf)
  var chars = new Array(view.length)

  for (var i = 0; i < view.length; i++) {
    chars[i] = String.fromCharCode(view[i])
  }
  return chars.join('')
}

function bufferClone(buf) {
  if (buf.slice) {
    return buf.slice(0)
  } else {
    var view = new Uint8Array(buf.byteLength)
    view.set(new Uint8Array(buf))
    return view.buffer
  }
}

function Body() {
  this.bodyUsed = false

  this._initBody = function(body) {
    this._bodyInit = body
    if (!body) {
      this._bodyText = ''
    } else if (typeof body === 'string') {
      this._bodyText = body
    } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
      this._bodyBlob = body
    } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
      this._bodyFormData = body
    } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
      this._bodyText = body.toString()
    } else if (support.arrayBuffer && support.blob && isDataView(body)) {
      this._bodyArrayBuffer = bufferClone(body.buffer)
      // IE 10-11 can't handle a DataView body.
      this._bodyInit = new Blob([this._bodyArrayBuffer])
    } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
      this._bodyArrayBuffer = bufferClone(body)
    } else {
      this._bodyText = body = Object.prototype.toString.call(body)
    }

    if (!this.headers.get('content-type')) {
      if (typeof body === 'string') {
        this.headers.set('content-type', 'text/plain;charset=UTF-8')
      } else if (this._bodyBlob && this._bodyBlob.type) {
        this.headers.set('content-type', this._bodyBlob.type)
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
      }
    }
  }

  if (support.blob) {
    this.blob = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return Promise.resolve(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(new Blob([this._bodyArrayBuffer]))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as blob')
      } else {
        return Promise.resolve(new Blob([this._bodyText]))
      }
    }

    this.arrayBuffer = function() {
      if (this._bodyArrayBuffer) {
        return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
      } else {
        return this.blob().then(readBlobAsArrayBuffer)
      }
    }
  }

  this.text = function() {
    var rejected = consumed(this)
    if (rejected) {
      return rejected
    }

    if (this._bodyBlob) {
      return readBlobAsText(this._bodyBlob)
    } else if (this._bodyArrayBuffer) {
      return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
    } else if (this._bodyFormData) {
      throw new Error('could not read FormData body as text')
    } else {
      return Promise.resolve(this._bodyText)
    }
  }

  if (support.formData) {
    this.formData = function() {
      return this.text().then(decode)
    }
  }

  this.json = function() {
    return this.text().then(JSON.parse)
  }

  return this
}

// HTTP methods whose capitalization should be normalized
var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

function normalizeMethod(method) {
  var upcased = method.toUpperCase()
  return methods.indexOf(upcased) > -1 ? upcased : method
}

function Request(input, options) {
  options = options || {}
  var body = options.body

  if (input instanceof Request) {
    if (input.bodyUsed) {
      throw new TypeError('Already read')
    }
    this.url = input.url
    this.credentials = input.credentials
    if (!options.headers) {
      this.headers = new Headers(input.headers)
    }
    this.method = input.method
    this.mode = input.mode
    this.signal = input.signal
    if (!body && input._bodyInit != null) {
      body = input._bodyInit
      input.bodyUsed = true
    }
  } else {
    this.url = String(input)
  }

  this.credentials = options.credentials || this.credentials || 'same-origin'
  if (options.headers || !this.headers) {
    this.headers = new Headers(options.headers)
  }
  this.method = normalizeMethod(options.method || this.method || 'GET')
  this.mode = options.mode || this.mode || null
  this.signal = options.signal || this.signal
  this.referrer = null

  if ((this.method === 'GET' || this.method === 'HEAD') && body) {
    throw new TypeError('Body not allowed for GET or HEAD requests')
  }
  this._initBody(body)
}

Request.prototype.clone = function() {
  return new Request(this, {body: this._bodyInit})
}

function decode(body) {
  var form = new FormData()
  body
    .trim()
    .split('&')
    .forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
  return form
}

function parseHeaders(rawHeaders) {
  var headers = new Headers()
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
  preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
    var parts = line.split(':')
    var key = parts.shift().trim()
    if (key) {
      var value = parts.join(':').trim()
      headers.append(key, value)
    }
  })
  return headers
}

Body.call(Request.prototype)

function Response(bodyInit, options) {
  if (!options) {
    options = {}
  }

  this.type = 'default'
  this.status = options.status === undefined ? 200 : options.status
  this.ok = this.status >= 200 && this.status < 300
  this.statusText = 'statusText' in options ? options.statusText : 'OK'
  this.headers = new Headers(options.headers)
  this.url = options.url || ''
  this._initBody(bodyInit)
}

Body.call(Response.prototype)

Response.prototype.clone = function() {
  return new Response(this._bodyInit, {
    status: this.status,
    statusText: this.statusText,
    headers: new Headers(this.headers),
    url: this.url
  })
}

Response.error = function() {
  var response = new Response(null, {status: 0, statusText: ''})
  response.type = 'error'
  return response
}

var redirectStatuses = [301, 302, 303, 307, 308]

Response.redirect = function(url, status) {
  if (redirectStatuses.indexOf(status) === -1) {
    throw new RangeError('Invalid status code')
  }

  return new Response(null, {status: status, headers: {location: url}})
}

var DOMException = self.DOMException
try {
  new DOMException()
} catch (err) {
  DOMException = function(message, name) {
    this.message = message
    this.name = name
    var error = Error(message)
    this.stack = error.stack
  }
  DOMException.prototype = Object.create(Error.prototype)
  DOMException.prototype.constructor = DOMException
}

function fetch(input, init) {
  return new Promise(function(resolve, reject) {
    var request = new Request(input, init)

    if (request.signal && request.signal.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'))
    }

    var xhr = new XMLHttpRequest()

    function abortXhr() {
      xhr.abort()
    }

    xhr.onload = function() {
      var options = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || '')
      }
      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
      var body = 'response' in xhr ? xhr.response : xhr.responseText
      resolve(new Response(body, options))
    }

    xhr.onerror = function() {
      reject(new TypeError('Network request failed'))
    }

    xhr.ontimeout = function() {
      reject(new TypeError('Network request failed'))
    }

    xhr.onabort = function() {
      reject(new DOMException('Aborted', 'AbortError'))
    }

    xhr.open(request.method, request.url, true)

    if (request.credentials === 'include') {
      xhr.withCredentials = true
    } else if (request.credentials === 'omit') {
      xhr.withCredentials = false
    }

    if ('responseType' in xhr && support.blob) {
      xhr.responseType = 'blob'
    }

    request.headers.forEach(function(value, name) {
      xhr.setRequestHeader(name, value)
    })

    if (request.signal) {
      request.signal.addEventListener('abort', abortXhr)

      xhr.onreadystatechange = function() {
        // DONE (success or failure)
        if (xhr.readyState === 4) {
          request.signal.removeEventListener('abort', abortXhr)
        }
      }
    }

    xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
  })
}

fetch.polyfill = true

if (!self.fetch) {
  self.fetch = fetch
  self.Headers = Headers
  self.Request = Request
  self.Response = Response
}


/***/ }),

/***/ 3284:
/***/ (function(module, exports, __webpack_require__) {

var upperCase = __webpack_require__(3285)
var noCase = __webpack_require__(3286)

/**
 * Camel case a string.
 *
 * @param  {string} value
 * @param  {string} [locale]
 * @return {string}
 */
module.exports = function (value, locale, mergeNumbers) {
  var result = noCase(value, locale)

  // Replace periods between numeric entities with an underscore.
  if (!mergeNumbers) {
    result = result.replace(/ (?=\d)/g, '_')
  }

  // Replace spaces between words with an upper cased character.
  return result.replace(/ (.)/g, function (m, $1) {
    return upperCase($1, locale)
  })
}


/***/ }),

/***/ 3285:
/***/ (function(module, exports) {

/**
 * Special language-specific overrides.
 *
 * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
 *
 * @type {Object}
 */
var LANGUAGES = {
  tr: {
    regexp: /[\u0069]/g,
    map: {
      '\u0069': '\u0130'
    }
  },
  az: {
    regexp: /[\u0069]/g,
    map: {
      '\u0069': '\u0130'
    }
  },
  lt: {
    regexp: /[\u0069\u006A\u012F]\u0307|\u0069\u0307[\u0300\u0301\u0303]/g,
    map: {
      '\u0069\u0307': '\u0049',
      '\u006A\u0307': '\u004A',
      '\u012F\u0307': '\u012E',
      '\u0069\u0307\u0300': '\u00CC',
      '\u0069\u0307\u0301': '\u00CD',
      '\u0069\u0307\u0303': '\u0128'
    }
  }
}

/**
 * Upper case a string.
 *
 * @param  {String} str
 * @return {String}
 */
module.exports = function (str, locale) {
  var lang = LANGUAGES[locale]

  str = str == null ? '' : String(str)

  if (lang) {
    str = str.replace(lang.regexp, function (m) { return lang.map[m] })
  }

  return str.toUpperCase()
}


/***/ }),

/***/ 3286:
/***/ (function(module, exports, __webpack_require__) {

var lowerCase = __webpack_require__(3287)

var NON_WORD_REGEXP = __webpack_require__(3288)
var CAMEL_CASE_REGEXP = __webpack_require__(3289)
var CAMEL_CASE_UPPER_REGEXP = __webpack_require__(3290)

/**
 * Sentence case a string.
 *
 * @param  {string} str
 * @param  {string} locale
 * @param  {string} replacement
 * @return {string}
 */
module.exports = function (str, locale, replacement) {
  if (str == null) {
    return ''
  }

  replacement = typeof replacement !== 'string' ? ' ' : replacement

  function replace (match, index, value) {
    if (index === 0 || index === (value.length - match.length)) {
      return ''
    }

    return replacement
  }

  str = String(str)
    // Support camel case ("camelCase" -> "camel Case").
    .replace(CAMEL_CASE_REGEXP, '$1 $2')
    // Support odd camel case ("CAMELCase" -> "CAMEL Case").
    .replace(CAMEL_CASE_UPPER_REGEXP, '$1 $2')
    // Remove all non-word characters and replace with a single space.
    .replace(NON_WORD_REGEXP, replace)

  // Lower case the entire string.
  return lowerCase(str, locale)
}


/***/ }),

/***/ 3287:
/***/ (function(module, exports) {

/**
 * Special language-specific overrides.
 *
 * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
 *
 * @type {Object}
 */
var LANGUAGES = {
  tr: {
    regexp: /\u0130|\u0049|\u0049\u0307/g,
    map: {
      '\u0130': '\u0069',
      '\u0049': '\u0131',
      '\u0049\u0307': '\u0069'
    }
  },
  az: {
    regexp: /[\u0130]/g,
    map: {
      '\u0130': '\u0069',
      '\u0049': '\u0131',
      '\u0049\u0307': '\u0069'
    }
  },
  lt: {
    regexp: /[\u0049\u004A\u012E\u00CC\u00CD\u0128]/g,
    map: {
      '\u0049': '\u0069\u0307',
      '\u004A': '\u006A\u0307',
      '\u012E': '\u012F\u0307',
      '\u00CC': '\u0069\u0307\u0300',
      '\u00CD': '\u0069\u0307\u0301',
      '\u0128': '\u0069\u0307\u0303'
    }
  }
}

/**
 * Lowercase a string.
 *
 * @param  {String} str
 * @return {String}
 */
module.exports = function (str, locale) {
  var lang = LANGUAGES[locale]

  str = str == null ? '' : String(str)

  if (lang) {
    str = str.replace(lang.regexp, function (m) { return lang.map[m] })
  }

  return str.toLowerCase()
}


/***/ }),

/***/ 3288:
/***/ (function(module, exports) {

module.exports = /[^A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC0-9\xB2\xB3\xB9\xBC-\xBE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]+/g


/***/ }),

/***/ 3289:
/***/ (function(module, exports) {

module.exports = /([a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A0-9\xB2\xB3\xB9\xBC-\xBE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])([A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A])/g


/***/ }),

/***/ 3290:
/***/ (function(module, exports) {

module.exports = /([A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A])([A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A][a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A])/g


/***/ }),

/***/ 3291:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {

  // Under "api:" all functions must take api as their 1st parameter
  api: {
    createTransaction: createTransaction
  }

  /**
    @typedef {object} headers
    @property {number} ref_block_num - Last irreversible block number.  The
    bit-wise AND operation is used to keep this value with the size of a Uint16
    size (a block num in the last 2^16 blocks).  Example:
    `get_info.last_irreversible_block_num & 0xFFFF`
  
    @property {number} ref_block_prefix - get_block.ref_block_prefix .. This is
    a 32 bit number identifier (identify the same block referenced in `ref_block_num`).
  
    @property {string} expiration - This is based on the head block time from the
    blockchain.  Be careful to suffix a Z if required (as with Firefox and JavaScript)
    to ensure this date string is interpreted as Zulu time.
  
    Example: `new Date(new Date(info.head_block_time + 'Z').getTime() + expireInSeconds * 1000).toISOString().split('.')[0]`
  */

  /**
    Consult the blockchain and gather information for use in a new signed transaction.
    For Transaction as Proof of Stake (TaPOS), 32 bits of a recent block Id is included.
    Because all transactions use TaPOS, this solves the nothing at stake attack.
  
    This is usually called for every transaction or maybe cached per block.  Although
    longer caching is possible, a longer cache time increases the risk of a
    transaction replay attack.
  
    @arg {number} expireInSeconds - How many seconds until expiration
    @arg {function(error, headers)} callback {@link headers}
    @see {headers}
    @example eos.createTransaction(60, (error, headers) => {})
  */
};function createTransaction(api) {
  var expireInSeconds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 60;
  var callback = arguments[2];

  if (!callback) {
    throw new TypeError('callback parameter is required');
  }
  api.getInfo(checkError(callback, function (info) {
    var chainDate = new Date(info.head_block_time + 'Z');

    api.getBlock(info.last_irreversible_block_num, checkError(callback, function (block) {
      var expiration = new Date(chainDate.getTime() + expireInSeconds * 1000);

      var ref_block_num = info.last_irreversible_block_num & 0xFFFF;

      var headers = {
        expiration: expiration.toISOString().split('.')[0],
        ref_block_num: ref_block_num,
        ref_block_prefix: block.ref_block_prefix,
        max_net_usage_words: 0,
        max_cpu_usage_ms: 0,
        delay_sec: 0,
        context_free_actions: [],
        actions: [],
        signatures: [],
        transaction_extensions: []
      };
      callback(null, headers);
    }));
  }));
}

var checkError = function checkError(parentErr, parrentRes) {
  return function (error, result) {
    if (error) {
      parentErr(error);
    } else {
      parrentRes(result);
    }
  };
};

/***/ }),

/***/ 3292:
/***/ (function(module, exports) {

module.exports = {"name":"uint64","checksum160":"fixed_bytes20","checksum256":"fixed_bytes32","checksum512":"fixed_bytes64","signature":"fixed_bytes65","public_key":"fixed_bytes33","message_type":"fixed_string16","symbol":"uint64","symbol_code":"uint64","field_name":"string","account_name":"name","permission_name":"name","type_name":"string","token_name":"name","table_name":"name","scope_name":"name","action_name":"name","time_point":"int64","time_point_sec":"time","timestamp":"uint32","block_timestamp_type":"timestamp","block_id":"fixed_bytes32","checksum_type":"fixed_bytes32","checksum256_type":"fixed_bytes32","checksum512_type":"fixed_bytes64","checksum160_type":"fixed_bytes20","sha256":"fixed_bytes32","sha512":"fixed_bytes64","sha160":"fixed_bytes20","weight_type":"uint16","block_num_type":"uint32","share_type":"int64","digest_type":"checksum_type","context_free_type":"bytes","unsigned_int":"varuint32","bool":"uint8","extensions_type":{"base":"","fields":{"type":"uint16","data":"bytes"}},"transaction_header":{"base":"","fields":{"expiration":"time","ref_block_num":"uint16","ref_block_prefix":"uint32","max_net_usage_words":"unsigned_int","max_cpu_usage_ms":"uint8","delay_sec":"unsigned_int"}},"transaction":{"base":"transaction_header","fields":{"context_free_actions":"action[]","actions":"action[]","transaction_extensions":"extensions_type[]"}},"signed_transaction":{"base":"transaction","fields":{"signatures":"signature[]","context_free_data":"bytes[]"}},"fields":"field_def[]","field_def":{"fields":{"name":"field_name","type":"type_name"}},"asset":{"fields":{"amount":"share_type","sym":"symbol"}},"producer_key":{"fields":{"producer_name":"account_name","block_signing_key":"public_key"}},"producer_schedule":{"fields":{"version":"uint32","producers":"producer_key[]"}},"chain_config":{"fields":{"target_block_size":"uint32","max_block_size":"uint32","target_block_acts_per_scope":"uint32","max_block_acts_per_scope":"uint32","target_block_acts":"uint32","max_block_acts":"uint32","real_threads":"uint64","max_storage_size":"uint64","max_transaction_lifetime":"uint32","max_authority_depth":"uint16","max_transaction_exec_time":"uint32","max_inline_depth":"uint16","max_inline_action_size":"uint32","max_generated_transaction_size":"uint32"}},"type_def":{"base":"","fields":{"new_type_name":"type_name","type":"type_name"}},"struct_def":{"base":"","fields":{"name":"type_name","base":"type_name","fields":"field_def[]"}},"clause_pair":{"base":"","fields":{"id":"string","body":"string"}},"error_message":{"base":"","fields":{"error_code":"uint64","error_msg":"string"}},"abi_def":{"base":"","fields":{"version":"string","types":"type_def[]","structs":"struct_def[]","actions":"action_def[]","tables":"table_def[]","ricardian_clauses":"clause_pair[]","error_messages":"error_message[]","abi_extensions":"extensions_type[]"}},"table_def":{"base":"","fields":{"name":"table_name","index_type":"type_name","key_names":"field_name[]","key_types":"type_name[]","type":"type_name"}},"permission_level":{"base":"","fields":{"actor":"account_name","permission":"permission_name"}},"action":{"base":"","fields":{"account":"account_name","name":"action_name","authorization":"permission_level[]","data":"bytes"}},"action_def":{"base":"","fields":{"name":"action_name","type":"type_name","ricardian_contract":"string"}},"block_header":{"base":"","fields":{"previous":"checksum256","timestamp":"timestamp","transaction_mroot":"checksum256","action_mroot":"checksum256","block_mroot":"checksum256","producer":"account_name","schedule_version":"uint32","new_producers":"producer_schedule?"}},"packed_transaction":{"fields":{"signatures":"signature[]","compression":"uint8","packed_context_free_data":"bytes","packed_trx":"bytes"}}}

/***/ }),

/***/ 3293:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var _typeof2 = __webpack_require__(179);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = __webpack_require__(23);
var Structs = __webpack_require__(3269);

module.exports = AbiCache;

function AbiCache(network, config) {
  config.abiCache = {
    abiAsync: abiAsync,
    abi: abi

    // Help (or "usage") needs {defaults: true}
  };var abiCacheConfig = Object.assign({}, { defaults: true }, config);

  var cache = {};

  /**
    Asynchronously fetch and cache an ABI from the blockchain.
     @arg {string} account - blockchain account with deployed contract
    @arg {boolean} [force = true] false when ABI is immutable.
  */
  function abiAsync(account) {
    var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    assert.equal(typeof account === 'undefined' ? 'undefined' : (0, _typeof3.default)(account), 'string', 'account string required');

    if (force == false && cache[account] != null) {
      return Promise.resolve(cache[account]);
    }

    if (network == null) {
      var _abi = cache[account];
      assert(_abi, 'Missing ABI for account: ' + account + ', provide httpEndpoint or add to abiCache');
      return Promise.resolve(_abi);
    }

    return network.getAbi(account).then(function (code) {
      assert(code.abi, 'Missing ABI for account: ' + account);
      return abi(account, code.abi);
    });
  }

  /**
    Synchronously set or fetch an ABI from local cache.
     @arg {string} account - blockchain account with deployed contract
    @arg {string} [abi] - blockchain ABI json data.  Null to fetch or non-null to cache
  */
  function abi(account, abi) {
    assert.equal(typeof account === 'undefined' ? 'undefined' : (0, _typeof3.default)(account), 'string', 'account string required');
    if (abi) {
      assert.equal(typeof abi === 'undefined' ? 'undefined' : (0, _typeof3.default)(abi), 'object', 'abi');
      if (Buffer.isBuffer(abi)) {
        abi = JSON.parse(abi);
      }
      var fcSchema = abiToFcSchema(abi, account);
      var structs = Structs(abiCacheConfig, fcSchema); // returns {structs, types}
      return cache[account] = Object.assign({ abi: abi, schema: fcSchema }, structs);
    }
    var c = cache[account];
    if (c == null) {
      throw new Error('Abi \'' + account + '\' is not cached');
    }
    return c;
  }

  return config.abiCache;
}

function abiToFcSchema(abi, account) {
  // customTypes
  // For FcBuffer
  var abiSchema = {};

  // convert abi types to Fcbuffer schema
  if (abi.types) {
    // aliases
    abi.types.forEach(function (e) {
      // "account_name" = "name"
      abiSchema[e.new_type_name] = e.type;
    });
  }

  if (abi.structs) {
    // transaction_header = fields[actor, permission] extends base "transaction"
    abi.structs.forEach(function (e) {
      var fields = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = e.fields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var field = _step.value;

          fields[field.name] = field.type;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      abiSchema[e.name] = { base: e.base, fields: fields };
      if (e.base === '') {
        delete abiSchema[e.name].base;
      }
    });
  }

  if (abi.actions) {
    // setprods = set_producers
    abi.actions.forEach(function (action) {
      // @example action = {name: 'setprods', type: 'set_producers'}
      var type = abiSchema[action.type];
      if (!type) {
        console.error('Missing abiSchema type', action.type, account); //, abi, abiSchema)
      } else {
        type.action = {
          name: action.name,
          account: account
        };
      }
    });
    // console.log('abiSchema', abiSchema);
  }

  return abiSchema;
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),

/***/ 3294:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var _slicedToArray2 = __webpack_require__(452);

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = __webpack_require__(19);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = __webpack_require__(179);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = __webpack_require__(23);
var ecc = __webpack_require__(276);
var Fcbuffer = __webpack_require__(3268);
var createHash = __webpack_require__(64);

var _require = __webpack_require__(3270),
    processArgs = _require.processArgs;

var Structs = __webpack_require__(3269);

module.exports = writeApiGen;

var sign = ecc.sign;


function writeApiGen(Network, network, structs, config, abis) {
  if (typeof config.chainId !== 'string') {
    throw new TypeError('config.chainId is required');
  }
  var writeApi = WriteApi(Network, network, config, structs.transaction);
  var reserveFunctions = new Set(['transaction', 'contract']);

  var merge = {};
  // sends transactions, can act as an action collecting wrapper
  merge.transaction = writeApi.genTransaction(structs, merge);

  // Immediate send operations automatically calls merge.transaction
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = abis[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var abi = _step.value;

      for (var type in abi.schema) {
        var typeStruct = abi.schema[type];
        if (typeof typeStruct === 'string') {
          // skip types like; name, account_name, etc..
          continue;
        }

        assert.equal(typeof typeStruct === 'undefined' ? 'undefined' : (0, _typeof3.default)(typeStruct), 'object', 'abi.schema[type = ' + type + ']');

        var action = typeStruct.action;

        if (action === undefined) {
          // ABI private struct
          continue;
        }

        if (reserveFunctions.has(action.name)) {
          throw new TypeError('Conflicting Api function: ' + type);
        }

        var definition = schemaFields(abi.schema, type);
        merge[action.name] = writeApi.genMethod(type, definition, merge.transaction, action.account, action.name);
      }
    }

    /**
      Immedate send contract actions.
       @example eos.contract('mycontract', [options], [callback])
      @example eos.contract('mycontract').then(mycontract => mycontract.myaction(...))
    */
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  merge.contract = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _processArgs = processArgs(args, ['account'], 'contract', optionsFormatter),
        params = _processArgs.params,
        options = _processArgs.options,
        returnPromise = _processArgs.returnPromise,
        callback = _processArgs.callback;

    var account = params.account;

    // sends transactions via its own transaction function

    writeApi.genContractActions(account).then(function (r) {
      callback(null, r);
    }).catch(function (r) {
      callback(r);
    });

    return returnPromise;
  };

  return merge;
}

function WriteApi(Network, network, config, Transaction) {
  /**
    @arg {array} [args.contracts]
    @arg {callback|object} args.transaction tr => {tr.transfer .. }
    @arg {object} [args.options]
    @arg {function} [args.callback]
  */
  var genTransaction = function genTransaction(structs, merge) {
    return function _callee() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var contracts, options, callback, isContractArray, accounts, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, action, abiPromises, cachedCode, arg, contractPromises, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, account;

      return _regenerator2.default.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              contracts = void 0, options = void 0, callback = void 0;


              if (args[args.length - 1] == null) {
                // callback may be undefined
                args = args.slice(0, args.length - 1);
              }

              isContractArray = isStringArray(args[0]);

              if (!isContractArray) {
                _context.next = 8;
                break;
              }

              contracts = args[0];
              args = args.slice(1);
              _context.next = 39;
              break;

            case 8:
              if (!(typeof args[0] === 'string')) {
                _context.next = 13;
                break;
              }

              contracts = [args[0]];
              args = args.slice(1);
              _context.next = 39;
              break;

            case 13:
              if (!((0, _typeof3.default)(args[0]) === 'object' && Array.isArray(args[0].actions))) {
                _context.next = 39;
                break;
              }

              // full transaction, lookup ABIs used by each action
              accounts = new Set(); // make a unique list

              // TODO: Add args[0].context_free_actions to accounts too?

              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              _context.prev = 18;
              for (_iterator2 = args[0].actions[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                action = _step2.value;

                accounts.add(action.account);
              }

              _context.next = 26;
              break;

            case 22:
              _context.prev = 22;
              _context.t0 = _context['catch'](18);
              _didIteratorError2 = true;
              _iteratorError2 = _context.t0;

            case 26:
              _context.prev = 26;
              _context.prev = 27;

              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }

            case 29:
              _context.prev = 29;

              if (!_didIteratorError2) {
                _context.next = 32;
                break;
              }

              throw _iteratorError2;

            case 32:
              return _context.finish(29);

            case 33:
              return _context.finish(26);

            case 34:
              abiPromises = [];

              // Eos contract operations are cached (efficient and offline transactions)

              cachedCode = new Set(['eosio', 'eosio.token', 'eosio.null']);

              accounts.forEach(function (account) {
                if (!cachedCode.has(account)) {
                  abiPromises.push(config.abiCache.abiAsync(account));
                }
              });
              _context.next = 39;
              return _regenerator2.default.awrap(Promise.all(abiPromises));

            case 39:

              if (args.length > 1 && typeof args[args.length - 1] === 'function') {
                callback = args.pop();
              }

              if (args.length > 1 && (0, _typeof3.default)(args[args.length - 1]) === 'object') {
                options = args.pop();
              }

              assert.equal(args.length, 1, 'transaction args: contracts<string|array>, transaction<callback|object>, [options], [callback]');
              arg = args[0];

              if (!contracts) {
                _context.next = 67;
                break;
              }

              assert(!callback, 'callback with contracts are not supported');
              assert.equal('function', typeof arg === 'undefined' ? 'undefined' : (0, _typeof3.default)(arg), 'provide function callback following contracts array parameter');

              contractPromises = [];
              _iteratorNormalCompletion3 = true;
              _didIteratorError3 = false;
              _iteratorError3 = undefined;
              _context.prev = 50;

              for (_iterator3 = contracts[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                account = _step3.value;

                // setup wrapper functions to collect contract api calls
                contractPromises.push(genContractActions(account, merge.transaction));
              }

              _context.next = 58;
              break;

            case 54:
              _context.prev = 54;
              _context.t1 = _context['catch'](50);
              _didIteratorError3 = true;
              _iteratorError3 = _context.t1;

            case 58:
              _context.prev = 58;
              _context.prev = 59;

              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }

            case 61:
              _context.prev = 61;

              if (!_didIteratorError3) {
                _context.next = 64;
                break;
              }

              throw _iteratorError3;

            case 64:
              return _context.finish(61);

            case 65:
              return _context.finish(58);

            case 66:
              return _context.abrupt('return', Promise.all(contractPromises).then(function (actions) {
                var merges = {};
                actions.forEach(function (m, i) {
                  merges[contracts[i]] = m;
                });
                var param = isContractArray ? merges : merges[contracts[0]];
                // collect and invoke api calls
                return trMessageCollector(arg, options, param);
              }));

            case 67:
              if (!(typeof arg === 'function')) {
                _context.next = 69;
                break;
              }

              return _context.abrupt('return', trMessageCollector(arg, options, merge));

            case 69:
              if (!((typeof arg === 'undefined' ? 'undefined' : (0, _typeof3.default)(arg)) === 'object')) {
                _context.next = 71;
                break;
              }

              return _context.abrupt('return', transaction(arg, options, callback));

            case 71:
              throw new Error('first transaction argument unrecognized', arg);

            case 72:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this, [[18, 22, 26, 34], [27,, 29, 33], [50, 54, 58, 66], [59,, 61, 65]]);
    };
  };

  function genContractActions(account) {
    var transaction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    return config.abiCache.abiAsync(account).then(function (cache) {
      assert(Array.isArray(cache.abi.actions) && cache.abi.actions.length, 'No actions');

      var contractMerge = {};
      contractMerge.transaction = transaction ? transaction : genTransaction(cache.structs, contractMerge);

      cache.abi.actions.forEach(function (_ref) {
        var name = _ref.name,
            type = _ref.type;

        var definition = schemaFields(cache.schema, type);
        contractMerge[name] = genMethod(type, definition, contractMerge.transaction, account, name);
      });

      contractMerge.fc = cache;

      return contractMerge;
    });
  }

  function genMethod(type, definition, transactionArg) {
    var account = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'eosio.token';
    var name = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : type;

    return function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      if (args.length === 0) {
        console.log(usage({ name: name, type: type }, definition, Network, account, config));
        return;
      }

      // Special case like multi-action transactions where this lib needs
      // to be sure the broadcast is off.
      var optionOverrides = {};
      var lastArg = args[args.length - 1];
      if ((typeof lastArg === 'undefined' ? 'undefined' : (0, _typeof3.default)(lastArg)) === 'object' && (0, _typeof3.default)(lastArg.__optionOverrides) === 'object') {
        // pop() fixes the args.length
        Object.assign(optionOverrides, args.pop().__optionOverrides);
      }

      var processedArgs = processArgs(args, Object.keys(definition), type, optionsFormatter);

      var options = processedArgs.options;
      var params = processedArgs.params,
          returnPromise = processedArgs.returnPromise,
          callback = processedArgs.callback;


      var optionDefaults = { // From config and configDefaults
        broadcast: config.broadcast,
        sign: config.sign

        // internal options (ex: multi-action transaction)
      };options = Object.assign({}, optionDefaults, options, optionOverrides);
      if (optionOverrides.noCallback && !returnPromise) {
        throw new Error('Callback during a transaction are not supported');
      }

      var authorization = [];
      var providedAuth = options.authorization ? options.authorization : config.authorization;
      var addDefaultAuths = providedAuth == null;

      // Often if the first field in an action is an account name it is
      // also the required authorization.
      function firstAccount() {
        var fieldKeys = Object.keys(definition);
        var f1 = fieldKeys[0];

        if (definition[f1] === 'account_name') {
          return params[f1];
        }
      }

      if (providedAuth) {
        var authArray = void 0;
        if (typeof providedAuth === 'string') {
          authArray = [providedAuth];
        } else if (Array.isArray(providedAuth)) {
          authArray = providedAuth;
        }

        if (authArray) {
          authArray.forEach(function (auth) {
            if (typeof auth === 'string') {
              var _auth$split = auth.split('@'),
                  _auth$split2 = (0, _slicedToArray3.default)(_auth$split, 2),
                  actor = _auth$split2[0],
                  _auth$split2$ = _auth$split2[1],
                  permission = _auth$split2$ === undefined ? 'active' : _auth$split2$;

              if (actor === '') {
                actor = firstAccount();
              }
              if (actor) {
                authorization.push({ actor: actor, permission: permission });
              }
            } else if ((typeof auth === 'undefined' ? 'undefined' : (0, _typeof3.default)(auth)) === 'object') {
              authorization.push(auth);
            }
          });
        }

        assert.equal(authorization.length, authArray.length, 'invalid authorization in: ' + JSON.stringify(providedAuth));
      }

      var tr = {
        actions: [{
          account: account,
          name: name,
          authorization: authorization,
          data: params
        }]
      };

      if (addDefaultAuths) {
        var actor = firstAccount();
        if (actor) {
          // Default authorization (since user did not provide one)
          tr.actions[0].authorization.push({
            actor: actor,
            permission: 'active'
          });
        }
      }

      tr.actions[0].authorization.sort(function (a, b) {
        return a.actor > b.actor ? 1 : a.actor < b.actor ? -1 : 0;
      });

      // multi-action transaction support
      if (!optionOverrides.messageOnly) {
        transactionArg(tr, options, callback);
      } else {
        callback(null, tr);
      }

      return returnPromise;
    };
  }

  /**
    Transaction Message Collector
     Wrap merge.functions adding optionOverrides that will suspend
    transaction broadcast.
  */
  function trMessageCollector(trCallback) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var merges = arguments[2];

    assert.equal('function', typeof trCallback === 'undefined' ? 'undefined' : (0, _typeof3.default)(trCallback), 'trCallback');
    assert.equal('object', typeof options === 'undefined' ? 'undefined' : (0, _typeof3.default)(options), 'options');
    assert.equal('object', typeof merges === 'undefined' ? 'undefined' : (0, _typeof3.default)(merges), 'merges');
    assert(!Array.isArray(merges), 'merges should not be an array');
    assert.equal('function', typeof transaction === 'undefined' ? 'undefined' : (0, _typeof3.default)(transaction), 'transaction');

    var messageList = [];
    var messageCollector = {};

    var wrap = function wrap(opFunction) {
      return function () {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        // call the original function but force-disable a lot of stuff
        var ret = opFunction.apply(undefined, args.concat([{
          __optionOverrides: {
            broadcast: false,
            messageOnly: true,
            noCallback: true
          }
        }]));
        if (ret == null) {
          // double-check (code can change)
          throw new Error('Callbacks can not be used when creating a multi-action transaction');
        }
        messageList.push(ret);
      };
    };

    // merges can be an object of functions (as in the main eos contract)
    // or an object of contract names with functions under those
    for (var key in merges) {
      var value = merges[key];
      var variableName = key.replace(/\./, '_');
      if (typeof value === 'function') {
        // Native operations (eos contract for example)
        messageCollector[variableName] = wrap(value);
      } else if ((typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object') {
        // other contract(s) (currency contract for example)
        if (messageCollector[variableName] == null) {
          messageCollector[variableName] = {};
        }
        for (var key2 in value) {
          if (key2 === 'transaction') {
            continue;
          }
          messageCollector[variableName][key2] = wrap(value[key2]);
        }
      }
    }

    var promiseCollector = void 0;
    try {
      // caller will load this up with actions
      promiseCollector = trCallback(messageCollector);
    } catch (error) {
      promiseCollector = Promise.reject(error);
    }

    return Promise.resolve(promiseCollector).then(function () {
      return Promise.all(messageList).then(function (resolvedMessageList) {
        var actions = [];
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = resolvedMessageList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var m = _step4.value;

            var _m$actions = (0, _slicedToArray3.default)(m.actions, 1),
                action = _m$actions[0];

            actions.push(action);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        var trObject = {};
        trObject.actions = actions;
        return transaction(trObject, options);
      });
    });
  }

  function transaction(arg, options, callback) {
    var defaultExpiration, optionDefault, returnPromise, superCallback, rawTx, _arr, _i, txField, txObject, buf, tr, transactionId, sigs, chainIdBuf, packedContextFreeData, signBuf;

    return _regenerator2.default.async(function transaction$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            defaultExpiration = config.expireInSeconds ? config.expireInSeconds : 60;
            optionDefault = { expireInSeconds: defaultExpiration, broadcast: true, sign: true };

            options = Object.assign({} /*clone*/, optionDefault, options);

            returnPromise = void 0;

            if (typeof callback !== 'function') {
              returnPromise = new Promise(function (resolve, reject) {
                callback = function callback(err, result) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(result);
                  }
                };
              });
            }

            if (!((typeof arg === 'undefined' ? 'undefined' : (0, _typeof3.default)(arg)) !== 'object')) {
              _context4.next = 7;
              break;
            }

            throw new TypeError('First transaction argument should be an object or function');

          case 7:
            if (Array.isArray(arg.actions)) {
              _context4.next = 9;
              break;
            }

            throw new TypeError('Expecting actions array');

          case 9:

            if (config.logger.log || config.logger.error) {
              // wrap the callback with the logger
              superCallback = callback;

              callback = function callback(error, tr) {
                if (error && config.logger.error) {
                  config.logger.error(error);
                }
                if (config.logger.log) {
                  config.logger.log(JSON.stringify(tr));
                }
                superCallback(error, tr);
              };
            }

            arg.actions.forEach(function (action) {
              if (!Array.isArray(action.authorization)) {
                throw new TypeError('Expecting action.authorization array', action);
              }
            });

            if (!(options.sign && typeof config.signProvider !== 'function')) {
              _context4.next = 13;
              break;
            }

            throw new TypeError('Expecting config.signProvider function (disable using {sign: false})');

          case 13:
            rawTx = {
              max_net_usage_words: 0,
              max_cpu_usage_ms: 0,
              delay_sec: 0,
              context_free_actions: [],
              actions: [],
              signatures: [],
              transaction_extensions: []

              // global transaction headers
            };

            if (!config.transactionHeaders) {
              _context4.next = 25;
              break;
            }

            if (!((0, _typeof3.default)(config.transactionHeaders) === 'object')) {
              _context4.next = 19;
              break;
            }

            Object.assign(rawTx, config.transactionHeaders);
            _context4.next = 25;
            break;

          case 19:
            if (!(typeof config.transactionHeaders === 'function')) {
              _context4.next = 24;
              break;
            }

            _context4.next = 22;
            return _regenerator2.default.awrap(config.transactionHeaders(options.expireInSeconds, checkError(callback, config.logger, function _callee2(headers) {
              return _regenerator2.default.async(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      assert.equal(typeof headers === 'undefined' ? 'undefined' : (0, _typeof3.default)(headers), 'object', 'expecting transaction header object');
                      Object.assign(rawTx, headers);

                    case 2:
                    case 'end':
                      return _context2.stop();
                  }
                }
              }, null, this);
            })));

          case 22:
            _context4.next = 25;
            break;

          case 24:
            assert(false, 'config.transactionHeaders should be an object or function');

          case 25:

            // per transaction headers
            _arr = ['expiration', 'ref_block_num', 'ref_block_prefix', 'delay_sec', 'max_net_usage_words', 'max_cpu_usage_ms'];
            for (_i = 0; _i < _arr.length; _i++) {
              txField = _arr[_i];

              if (arg[txField] !== undefined) {
                // eos.transaction('eosio', eosio => { eosio.myaction(..) }, {delay_sec: 369})
                // eos.transaction({delay_sec: 369, actions: [...]})
                rawTx[txField] = arg[txField];
              } else if (options[txField] !== undefined) {
                // eos.transaction(tr => {tr.transfer(...)}, {delay_sec: 369})
                rawTx[txField] = options[txField];
              }
            }

            // eosjs calcualted headers

            if (!( // minimum required headers
            rawTx.expiration === undefined || rawTx.ref_block_num === undefined || rawTx.ref_block_prefix === undefined)) {
              _context4.next = 31;
              break;
            }

            assert(network, 'Network is required, provide httpEndpoint or own transaction headers');
            _context4.next = 31;
            return _regenerator2.default.awrap(new Promise(function (resolve) {
              network.createTransaction(options.expireInSeconds, checkError(callback, config.logger, function _callee3(headers) {
                var _arr2, _i2, txField;

                return _regenerator2.default.async(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _arr2 = ['expiration', 'ref_block_num', 'ref_block_prefix'];

                        for (_i2 = 0; _i2 < _arr2.length; _i2++) {
                          txField = _arr2[_i2];

                          // console.log(txField, headers[txField]);
                          if (rawTx[txField] === undefined) {
                            rawTx[txField] = headers[txField];
                          }
                        }
                        resolve();

                      case 3:
                      case 'end':
                        return _context3.stop();
                    }
                  }
                }, null, this);
              }));
            }));

          case 31:

            // console.log('rawTx', rawTx)

            assert.equal((0, _typeof3.default)(rawTx.expiration), 'string', 'expecting expiration: iso date time string');
            assert.equal((0, _typeof3.default)(rawTx.ref_block_num), 'number', 'expecting ref_block_num number');
            assert.equal((0, _typeof3.default)(rawTx.ref_block_prefix), 'number', 'expecting ref_block_prefix number');

            rawTx.context_free_actions = arg.context_free_actions;
            rawTx.actions = arg.actions;
            rawTx.transaction_extensions = arg.transaction_extensions;

            // Resolve shorthand
            txObject = Transaction.fromObject(rawTx);
            // console.log('txObject', txObject)

            buf = Fcbuffer.toBuffer(Transaction, txObject);
            tr = Transaction.toObject(txObject);
            transactionId = createHash('sha256').update(buf).digest().toString('hex');
            sigs = [];

            if (options.sign) {
              chainIdBuf = Buffer.from(config.chainId, 'hex');
              packedContextFreeData = Buffer.from(new Uint8Array(32)); // TODO

              signBuf = Buffer.concat([chainIdBuf, buf, packedContextFreeData]);


              sigs = config.signProvider({ transaction: tr, buf: signBuf, sign: sign,
                optionsKeyProvider: options.keyProvider });

              if (!Array.isArray(sigs)) {
                sigs = [sigs];
              }
            }

            // sigs can be strings or Promises
            Promise.all(sigs).then(function (sigs) {
              sigs = [].concat.apply([], sigs); // flatten arrays in array

              for (var i = 0; i < sigs.length; i++) {
                var sig = sigs[i];
                // normalize (hex to base58 format for example)
                if (typeof sig === 'string' && sig.length === 130) {
                  sigs[i] = ecc.Signature.from(sig).toString();
                }
              }

              var packedTr = {
                compression: 'none',
                transaction: tr,
                signatures: sigs
              };

              var mock = config.mockTransactions ? config.mockTransactions() : null;
              if (mock != null) {
                assert(/pass|fail/.test(mock), 'mockTransactions should return a string: pass or fail');
                if (mock === 'pass') {
                  callback(null, {
                    transaction_id: transactionId,
                    mockTransaction: true,
                    broadcast: false,
                    transaction: packedTr
                  });
                }
                if (mock === 'fail') {
                  var error = '[push_transaction mock error] \'fake error\', digest \'' + buf.toString('hex') + '\'';

                  if (config.logger.error) {
                    config.logger.error(error);
                  }

                  callback(error);
                }
                return;
              }

              if (!options.broadcast || !network) {
                callback(null, {
                  transaction_id: transactionId,
                  broadcast: false,
                  transaction: packedTr
                });
              } else {
                network.pushTransaction(packedTr, function (error, processedTransaction) {
                  if (!error) {
                    callback(null, Object.assign({
                      broadcast: true,
                      transaction: packedTr,
                      transaction_id: transactionId
                    }, processedTransaction));
                  } else {
                    if (config.logger.error) {
                      config.logger.error('[push_transaction error] \'' + error.message + '\', transaction \'' + buf.toString('hex') + '\'');
                    }
                    callback(error.message);
                  }
                });
              }
            }).catch(function (error) {
              if (config.logger.error) {
                config.logger.error(error);
              }
              callback(error);
            });
            return _context4.abrupt('return', returnPromise);

          case 45:
          case 'end':
            return _context4.stop();
        }
      }
    }, null, this);
  }

  // return WriteApi
  return {
    genTransaction: genTransaction,
    genContractActions: genContractActions,
    genMethod: genMethod
  };
}

var isStringArray = function isStringArray(o) {
  return Array.isArray(o) && o.length > 0 && o.findIndex(function (o) {
    return typeof o !== 'string';
  }) === -1;
};

// Normalize the extra optional options argument
var optionsFormatter = function optionsFormatter(option) {
  if ((typeof option === 'undefined' ? 'undefined' : (0, _typeof3.default)(option)) === 'object') {
    return option; // {debug, broadcast, etc} (etc my overwrite tr below)
  }
  if (typeof option === 'boolean') {
    // broadcast argument as a true false value, back-end cli will use this shorthand
    return { broadcast: option };
  }
};

function usage(action, definition, Network, account, config) {
  var usage = '';
  var out = function out() {
    var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    usage += str + '\n';
  };
  out('CONTRACT');
  out(account);
  out();

  out('ACTION');
  out(action.name);
  out();

  var cache = config.abiCache.abi(account);

  out('PARAMETERS');
  out(JSON.stringify(schemaFields(cache.schema, action.type), null, 4));
  out();

  var struct = cache.structs[action.type];

  out('EXAMPLE');
  out(account + '.' + action.name + '(' + JSON.stringify(struct.toObject(), null, 4) + ')');

  return usage;
}

var checkError = function checkError(parentErr, logger, parrentRes) {
  return function (error, result) {
    if (error) {
      if (logger.error) {
        logger.error('error', error);
      }
      parentErr(error);
    } else {
      Promise.resolve(parrentRes(result)).catch(function (error) {
        parentErr(error);
      });
    }
  };
};

/** Collapse inheritance (via "base") putting all the fields in one object. */
function schemaFields(schema, type) {
  var _schema$type = schema[type],
      base = _schema$type.base,
      fields = _schema$type.fields;

  var def = {};
  if (base && base !== '') {
    Object.assign(def, schemaFields(schema, base));
  }
  Object.assign(def, fields);
  return def;
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),

/***/ 3295:
/***/ (function(module, exports) {

module.exports = {"version":"eosio::abi/1.0","types":[{"new_type_name":"account_name","type":"name"}],"structs":[{"name":"transfer","base":"","fields":[{"name":"from","type":"account_name"},{"name":"to","type":"account_name"},{"name":"quantity","type":"asset"},{"name":"memo","type":"string"}]},{"name":"create","base":"","fields":[{"name":"issuer","type":"account_name"},{"name":"maximum_supply","type":"asset"}]},{"name":"issue","base":"","fields":[{"name":"to","type":"account_name"},{"name":"quantity","type":"asset"},{"name":"memo","type":"string"}]},{"name":"account","base":"","fields":[{"name":"balance","type":"asset"}]},{"name":"currency_stats","base":"","fields":[{"name":"supply","type":"asset"},{"name":"max_supply","type":"asset"},{"name":"issuer","type":"account_name"}]}],"actions":[{"name":"transfer","type":"transfer","ricardian_contract":""},{"name":"issue","type":"issue","ricardian_contract":""},{"name":"create","type":"create","ricardian_contract":""}],"tables":[{"name":"accounts","type":"account","index_type":"i64","key_names":["currency"],"key_types":["uint64"]},{"name":"stat","type":"currency_stats","index_type":"i64","key_names":["currency"],"key_types":["uint64"]}],"ricardian_clauses":[],"abi_extensions":[]}

/***/ }),

/***/ 3296:
/***/ (function(module, exports) {

module.exports = {"version":"eosio::abi/1.0","types":[{"new_type_name":"account_name","type":"name"},{"new_type_name":"permission_name","type":"name"},{"new_type_name":"action_name","type":"name"},{"new_type_name":"transaction_id_type","type":"checksum256"},{"new_type_name":"weight_type","type":"uint16"}],"____comment":"eosio.bios structs: set_account_limits, setpriv, set_global_limits, producer_key, set_producers, require_auth are provided so abi available for deserialization in future.","structs":[{"name":"permission_level","base":"","fields":[{"name":"actor","type":"account_name"},{"name":"permission","type":"permission_name"}]},{"name":"key_weight","base":"","fields":[{"name":"key","type":"public_key"},{"name":"weight","type":"weight_type"}]},{"name":"bidname","base":"","fields":[{"name":"bidder","type":"account_name"},{"name":"newname","type":"account_name"},{"name":"bid","type":"asset"}]},{"name":"permission_level_weight","base":"","fields":[{"name":"permission","type":"permission_level"},{"name":"weight","type":"weight_type"}]},{"name":"wait_weight","base":"","fields":[{"name":"wait_sec","type":"uint32"},{"name":"weight","type":"weight_type"}]},{"name":"authority","base":"","fields":[{"name":"threshold","type":"uint32"},{"name":"keys","type":"key_weight[]"},{"name":"accounts","type":"permission_level_weight[]"},{"name":"waits","type":"wait_weight[]"}]},{"name":"newaccount","base":"","fields":[{"name":"creator","type":"account_name"},{"name":"name","type":"account_name"},{"name":"owner","type":"authority"},{"name":"active","type":"authority"}]},{"name":"setcode","base":"","fields":[{"name":"account","type":"account_name"},{"name":"vmtype","type":"uint8"},{"name":"vmversion","type":"uint8"},{"name":"code","type":"bytes"}]},{"name":"setabi","base":"","fields":[{"name":"account","type":"account_name"},{"name":"abi","type":"bytes"}]},{"name":"updateauth","base":"","fields":[{"name":"account","type":"account_name"},{"name":"permission","type":"permission_name"},{"name":"parent","type":"permission_name"},{"name":"auth","type":"authority"}]},{"name":"deleteauth","base":"","fields":[{"name":"account","type":"account_name"},{"name":"permission","type":"permission_name"}]},{"name":"linkauth","base":"","fields":[{"name":"account","type":"account_name"},{"name":"code","type":"account_name"},{"name":"type","type":"action_name"},{"name":"requirement","type":"permission_name"}]},{"name":"unlinkauth","base":"","fields":[{"name":"account","type":"account_name"},{"name":"code","type":"account_name"},{"name":"type","type":"action_name"}]},{"name":"canceldelay","base":"","fields":[{"name":"canceling_auth","type":"permission_level"},{"name":"trx_id","type":"transaction_id_type"}]},{"name":"onerror","base":"","fields":[{"name":"sender_id","type":"uint128"},{"name":"sent_trx","type":"bytes"}]},{"name":"buyrambytes","base":"","fields":[{"name":"payer","type":"account_name"},{"name":"receiver","type":"account_name"},{"name":"bytes","type":"uint32"}]},{"name":"sellram","base":"","fields":[{"name":"account","type":"account_name"},{"name":"bytes","type":"uint64"}]},{"name":"buyram","base":"","fields":[{"name":"payer","type":"account_name"},{"name":"receiver","type":"account_name"},{"name":"quant","type":"asset"}]},{"name":"delegatebw","base":"","fields":[{"name":"from","type":"account_name"},{"name":"receiver","type":"account_name"},{"name":"stake_net_quantity","type":"asset"},{"name":"stake_cpu_quantity","type":"asset"},{"name":"transfer","type":"bool"}]},{"name":"undelegatebw","base":"","fields":[{"name":"from","type":"account_name"},{"name":"receiver","type":"account_name"},{"name":"unstake_net_quantity","type":"asset"},{"name":"unstake_cpu_quantity","type":"asset"}]},{"name":"refund","base":"","fields":[{"name":"owner","type":"account_name"}]},{"name":"delegated_bandwidth","base":"","fields":[{"name":"from","type":"account_name"},{"name":"to","type":"account_name"},{"name":"net_weight","type":"asset"},{"name":"cpu_weight","type":"asset"}]},{"name":"user_resources","base":"","fields":[{"name":"owner","type":"account_name"},{"name":"net_weight","type":"asset"},{"name":"cpu_weight","type":"asset"},{"name":"ram_bytes","type":"uint64"}]},{"name":"total_resources","base":"","fields":[{"name":"owner","type":"account_name"},{"name":"net_weight","type":"asset"},{"name":"cpu_weight","type":"asset"},{"name":"ram_bytes","type":"uint64"}]},{"name":"refund_request","base":"","fields":[{"name":"owner","type":"account_name"},{"name":"request_time","type":"time_point_sec"},{"name":"net_amount","type":"asset"},{"name":"cpu_amount","type":"asset"}]},{"name":"blockchain_parameters","base":"","fields":[{"name":"max_block_net_usage","type":"uint64"},{"name":"target_block_net_usage_pct","type":"uint32"},{"name":"max_transaction_net_usage","type":"uint32"},{"name":"base_per_transaction_net_usage","type":"uint32"},{"name":"net_usage_leeway","type":"uint32"},{"name":"context_free_discount_net_usage_num","type":"uint32"},{"name":"context_free_discount_net_usage_den","type":"uint32"},{"name":"max_block_cpu_usage","type":"uint32"},{"name":"target_block_cpu_usage_pct","type":"uint32"},{"name":"max_transaction_cpu_usage","type":"uint32"},{"name":"min_transaction_cpu_usage","type":"uint32"},{"name":"max_transaction_lifetime","type":"uint32"},{"name":"deferred_trx_expiration_window","type":"uint32"},{"name":"max_transaction_delay","type":"uint32"},{"name":"max_inline_action_size","type":"uint32"},{"name":"max_inline_action_depth","type":"uint16"},{"name":"max_authority_depth","type":"uint16"}]},{"name":"eosio_global_state","base":"blockchain_parameters","fields":[{"name":"max_ram_size","type":"uint64"},{"name":"total_ram_bytes_reserved","type":"uint64"},{"name":"total_ram_stake","type":"int64"},{"name":"last_producer_schedule_update","type":"block_timestamp_type"},{"name":"last_pervote_bucket_fill","type":"uint64"},{"name":"pervote_bucket","type":"int64"},{"name":"perblock_bucket","type":"int64"},{"name":"total_unpaid_blocks","type":"uint32"},{"name":"total_activated_stake","type":"int64"},{"name":"thresh_activated_stake_time","type":"uint64"},{"name":"last_producer_schedule_size","type":"uint16"},{"name":"total_producer_vote_weight","type":"float64"},{"name":"last_name_close","type":"block_timestamp_type"}]},{"name":"producer_info","base":"","fields":[{"name":"owner","type":"account_name"},{"name":"total_votes","type":"float64"},{"name":"producer_key","type":"public_key"},{"name":"is_active","type":"bool"},{"name":"url","type":"string"},{"name":"unpaid_blocks","type":"uint32"},{"name":"last_claim_time","type":"uint64"},{"name":"location","type":"uint16"}]},{"name":"regproducer","base":"","fields":[{"name":"producer","type":"account_name"},{"name":"producer_key","type":"public_key"},{"name":"url","type":"string"},{"name":"location","type":"uint16"}]},{"name":"unregprod","base":"","fields":[{"name":"producer","type":"account_name"}]},{"name":"setram","base":"","fields":[{"name":"max_ram_size","type":"uint64"}]},{"name":"regproxy","base":"","fields":[{"name":"proxy","type":"account_name"},{"name":"isproxy","type":"bool"}]},{"name":"voteproducer","base":"","fields":[{"name":"voter","type":"account_name"},{"name":"proxy","type":"account_name"},{"name":"producers","type":"account_name[]"}]},{"name":"voter_info","base":"","fields":[{"name":"owner","type":"account_name"},{"name":"proxy","type":"account_name"},{"name":"producers","type":"account_name[]"},{"name":"staked","type":"int64"},{"name":"last_vote_weight","type":"float64"},{"name":"proxied_vote_weight","type":"float64"},{"name":"is_proxy","type":"bool"}]},{"name":"claimrewards","base":"","fields":[{"name":"owner","type":"account_name"}]},{"name":"setpriv","base":"","fields":[{"name":"account","type":"account_name"},{"name":"is_priv","type":"int8"}]},{"name":"rmvproducer","base":"","fields":[{"name":"producer","type":"account_name"}]},{"name":"set_account_limits","base":"","fields":[{"name":"account","type":"account_name"},{"name":"ram_bytes","type":"int64"},{"name":"net_weight","type":"int64"},{"name":"cpu_weight","type":"int64"}]},{"name":"set_global_limits","base":"","fields":[{"name":"cpu_usec_per_period","type":"int64"}]},{"name":"producer_key","base":"","fields":[{"name":"producer_name","type":"account_name"},{"name":"block_signing_key","type":"public_key"}]},{"name":"set_producers","base":"","fields":[{"name":"schedule","type":"producer_key[]"}]},{"name":"require_auth","base":"","fields":[{"name":"from","type":"account_name"}]},{"name":"setparams","base":"","fields":[{"name":"params","type":"blockchain_parameters"}]},{"name":"connector","base":"","fields":[{"name":"balance","type":"asset"},{"name":"weight","type":"float64"}]},{"name":"exchange_state","base":"","fields":[{"name":"supply","type":"asset"},{"name":"base","type":"connector"},{"name":"quote","type":"connector"}]},{"name":"namebid_info","base":"","fields":[{"name":"newname","type":"account_name"},{"name":"high_bidder","type":"account_name"},{"name":"high_bid","type":"int64"},{"name":"last_bid_time","type":"uint64"}]}],"actions":[{"name":"newaccount","type":"newaccount","ricardian_contract":""},{"name":"setcode","type":"setcode","ricardian_contract":""},{"name":"setabi","type":"setabi","ricardian_contract":""},{"name":"updateauth","type":"updateauth","ricardian_contract":""},{"name":"deleteauth","type":"deleteauth","ricardian_contract":""},{"name":"linkauth","type":"linkauth","ricardian_contract":""},{"name":"unlinkauth","type":"unlinkauth","ricardian_contract":""},{"name":"canceldelay","type":"canceldelay","ricardian_contract":""},{"name":"onerror","type":"onerror","ricardian_contract":""},{"name":"buyrambytes","type":"buyrambytes","ricardian_contract":""},{"name":"buyram","type":"buyram","ricardian_contract":""},{"name":"sellram","type":"sellram","ricardian_contract":""},{"name":"delegatebw","type":"delegatebw","ricardian_contract":""},{"name":"undelegatebw","type":"undelegatebw","ricardian_contract":""},{"name":"refund","type":"refund","ricardian_contract":""},{"name":"regproducer","type":"regproducer","ricardian_contract":""},{"name":"setram","type":"setram","ricardian_contract":""},{"name":"bidname","type":"bidname","ricardian_contract":""},{"name":"unregprod","type":"unregprod","ricardian_contract":""},{"name":"regproxy","type":"regproxy","ricardian_contract":""},{"name":"voteproducer","type":"voteproducer","ricardian_contract":""},{"name":"claimrewards","type":"claimrewards","ricardian_contract":""},{"name":"setpriv","type":"setpriv","ricardian_contract":""},{"name":"rmvproducer","type":"rmvproducer","ricardian_contract":""},{"name":"setalimits","type":"set_account_limits","ricardian_contract":""},{"name":"setglimits","type":"set_global_limits","ricardian_contract":""},{"name":"setprods","type":"set_producers","ricardian_contract":""},{"name":"reqauth","type":"require_auth","ricardian_contract":""},{"name":"setparams","type":"setparams","ricardian_contract":""}],"tables":[{"name":"producers","type":"producer_info","index_type":"i64","key_names":["owner"],"key_types":["uint64"]},{"name":"global","type":"eosio_global_state","index_type":"i64","key_names":[],"key_types":[]},{"name":"voters","type":"voter_info","index_type":"i64","key_names":["owner"],"key_types":["account_name"]},{"name":"userres","type":"user_resources","index_type":"i64","key_names":["owner"],"key_types":["uint64"]},{"name":"delband","type":"delegated_bandwidth","index_type":"i64","key_names":["to"],"key_types":["uint64"]},{"name":"rammarket","type":"exchange_state","index_type":"i64","key_names":["supply"],"key_types":["uint64"]},{"name":"refunds","type":"refund_request","index_type":"i64","key_names":["owner"],"key_types":["uint64"]},{"name":"namebids","type":"namebid_info","index_type":"i64","key_names":["newname"],"key_types":["account_name"]}],"ricardian_clauses":[],"abi_extensions":[]}

/***/ }),

/***/ 3297:
/***/ (function(module, exports) {

module.exports = {"version":"eosio::abi/1.0","types":[],"structs":[{"name":"nonce","base":"","fields":[{"name":"value","type":"string"}]}],"actions":[{"name":"nonce","type":"nonce","ricardian_contract":""}],"tables":[],"ricardian_clauses":[],"abi_extensions":[]}

/***/ })

});