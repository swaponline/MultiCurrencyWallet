'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var invariant = _interopDefault(require('tiny-invariant'));
var types = require('@web3-react/types');
var warning = _interopDefault(require('tiny-warning'));
var bytes = require('@ethersproject/bytes');
var keccak256 = require('@ethersproject/keccak256');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

// A type of promise-like that resolves synchronously and supports only one observer
var _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = /*#__PURE__*/Symbol("Symbol.iterator")) : "@@iterator"; // Asynchronously iterate through an object's values
var _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = /*#__PURE__*/Symbol("Symbol.asyncIterator")) : "@@asyncIterator"; // Asynchronously iterate on a value using it's async iterator if present, or its synchronous iterator if missing

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
} // Asynchronously await a promise and pass the result to a finally continuation

function normalizeChainId(chainId) {
  if (typeof chainId === 'string') {
    // Temporary fix until the next version of Metamask Mobile gets released.
    // In the current version (0.2.13), the chainId starts with “Ox” rather
    // than “0x”. Fix: https://github.com/MetaMask/metamask-mobile/pull/1275
    chainId = chainId.replace(/^Ox/, '0x');
    var parsedChainId = Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10);
    !!Number.isNaN(parsedChainId) ?  invariant(false, "chainId " + chainId + " is not an integer")  : void 0;
    return parsedChainId;
  } else {
    !Number.isInteger(chainId) ?  invariant(false, "chainId " + chainId + " is not an integer")  : void 0;
    return chainId;
  }
} // https://github.com/ethers-io/ethers.js/blob/d9d438a119bb11f8516fc9cf02c534ab3816fcb3/packages/address/src.ts/index.ts

function normalizeAccount(_address) {
  !(typeof _address === 'string' && _address.match(/^(0x)?[0-9a-fA-F]{40}$/)) ?  invariant(false, "Invalid address " + _address)  : void 0;
  var address = _address.substring(0, 2) === '0x' ? _address : "0x" + _address;
  var chars = address.toLowerCase().substring(2).split('');
  var charsArray = new Uint8Array(40);

  for (var i = 0; i < 40; i++) {
    charsArray[i] = chars[i].charCodeAt(0);
  }

  var hashed = bytes.arrayify(keccak256.keccak256(charsArray));

  for (var _i = 0; _i < 40; _i += 2) {
    if (hashed[_i >> 1] >> 4 >= 8) {
      chars[_i] = chars[_i].toUpperCase();
    }

    if ((hashed[_i >> 1] & 0x0f) >= 8) {
      chars[_i + 1] = chars[_i + 1].toUpperCase();
    }
  }

  var addressChecksum = "0x" + chars.join('');
  !!(address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && address !== addressChecksum) ?  invariant(false, "Bad address checksum " + address + " " + addressChecksum)  : void 0;
  return addressChecksum;
}

var augmentConnectorUpdate = function augmentConnectorUpdate(connector, update) {
  try {
    var _temp3 = function _temp3(provider) {
      return Promise.resolve(Promise.all([update.chainId === undefined ? connector.getChainId() : update.chainId, update.account === undefined ? connector.getAccount() : update.account])).then(function (_ref2) {
        var _chainId = _ref2[0],
            _account = _ref2[1];
        var chainId = normalizeChainId(_chainId);

        if (!!connector.supportedChainIds && !connector.supportedChainIds.includes(chainId)) {
          throw new UnsupportedChainIdError(chainId, connector.supportedChainIds);
        }

        var account = _account === null ? _account : normalizeAccount(_account);
        return {
          provider: provider,
          chainId: chainId,
          account: account
        };
      });
    };

    var _temp4 = update.provider === undefined;

    return Promise.resolve(_temp4 ? Promise.resolve(connector.getProvider()).then(_temp3) : _temp3(update.provider));
  } catch (e) {
    return Promise.reject(e);
  }
};

var StaleConnectorError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(StaleConnectorError, _Error);

  function StaleConnectorError() {
    var _this;

    _this = _Error.call(this) || this;
    _this.name = _this.constructor.name;
    return _this;
  }

  return StaleConnectorError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var UnsupportedChainIdError = /*#__PURE__*/function (_Error2) {
  _inheritsLoose(UnsupportedChainIdError, _Error2);

  function UnsupportedChainIdError(unsupportedChainId, supportedChainIds) {
    var _this2;

    _this2 = _Error2.call(this) || this;
    _this2.name = _this2.constructor.name;
    _this2.message = "Unsupported chain id: " + unsupportedChainId + ". Supported chain ids are: " + supportedChainIds + ".";
    return _this2;
  }

  return UnsupportedChainIdError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
var ActionType;

(function (ActionType) {
  ActionType[ActionType["ACTIVATE_CONNECTOR"] = 0] = "ACTIVATE_CONNECTOR";
  ActionType[ActionType["UPDATE"] = 1] = "UPDATE";
  ActionType[ActionType["UPDATE_FROM_ERROR"] = 2] = "UPDATE_FROM_ERROR";
  ActionType[ActionType["ERROR"] = 3] = "ERROR";
  ActionType[ActionType["ERROR_FROM_ACTIVATION"] = 4] = "ERROR_FROM_ACTIVATION";
  ActionType[ActionType["DEACTIVATE_CONNECTOR"] = 5] = "DEACTIVATE_CONNECTOR";
})(ActionType || (ActionType = {}));

function reducer(state, _ref) {
  var type = _ref.type,
      payload = _ref.payload;

  switch (type) {
    case ActionType.ACTIVATE_CONNECTOR:
      {
        var connector = payload.connector,
            provider = payload.provider,
            chainId = payload.chainId,
            account = payload.account,
            onError = payload.onError;
        return {
          connector: connector,
          provider: provider,
          chainId: chainId,
          account: account,
          onError: onError
        };
      }

    case ActionType.UPDATE:
      {
        var _provider = payload.provider,
            _chainId2 = payload.chainId,
            _account2 = payload.account;
        return _extends({}, state, _provider === undefined ? {} : {
          provider: _provider
        }, _chainId2 === undefined ? {} : {
          chainId: _chainId2
        }, _account2 === undefined ? {} : {
          account: _account2
        });
      }

    case ActionType.UPDATE_FROM_ERROR:
      {
        var _provider2 = payload.provider,
            _chainId3 = payload.chainId,
            _account3 = payload.account;
        return _extends({}, state, _provider2 === undefined ? {} : {
          provider: _provider2
        }, _chainId3 === undefined ? {} : {
          chainId: _chainId3
        }, _account3 === undefined ? {} : {
          account: _account3
        }, {
          error: undefined
        });
      }

    case ActionType.ERROR:
      {
        var error = payload.error;
        var _connector = state.connector,
            _onError = state.onError;
        return {
          connector: _connector,
          error: error,
          onError: _onError
        };
      }

    case ActionType.ERROR_FROM_ACTIVATION:
      {
        var _connector2 = payload.connector,
            _error = payload.error;
        return {
          connector: _connector2,
          error: _error
        };
      }

    case ActionType.DEACTIVATE_CONNECTOR:
      {
        return {};
      }
  }
}

function useWeb3ReactManager() {
  var _useReducer = React.useReducer(reducer, {}),
      state = _useReducer[0],
      dispatch = _useReducer[1];

  var connector = state.connector,
      provider = state.provider,
      chainId = state.chainId,
      account = state.account,
      onError = state.onError,
      error = state.error;
  var updateBusterRef = React.useRef(-1);
  updateBusterRef.current += 1;
  var activate = React.useCallback(function (connector, onError, throwErrors) {
    if (throwErrors === void 0) {
      throwErrors = false;
    }

    try {
      var updateBusterInitial = updateBusterRef.current;
      var activated = false;
      return Promise.resolve(_catch(function () {
        return Promise.resolve(connector.activate().then(function (update) {
          activated = true;
          return update;
        })).then(function (update) {
          return Promise.resolve(augmentConnectorUpdate(connector, update)).then(function (augmentedUpdate) {
            if (updateBusterRef.current > updateBusterInitial) {
              throw new StaleConnectorError();
            }

            dispatch({
              type: ActionType.ACTIVATE_CONNECTOR,
              payload: _extends({
                connector: connector
              }, augmentedUpdate, {
                onError: onError
              })
            });
          });
        });
      }, function (error) {
        if (error instanceof StaleConnectorError) {
          activated && connector.deactivate();
          "development" !== "production" ? warning(false, "Suppressed stale connector activation " + connector) : void 0;
        } else if (throwErrors) {
          activated && connector.deactivate();
          throw error;
        } else if (onError) {
          activated && connector.deactivate();
          onError(error);
        } else {
          // we don't call activated && connector.deactivate() here because it'll be handled in the useEffect
          dispatch({
            type: ActionType.ERROR_FROM_ACTIVATION,
            payload: {
              connector: connector,
              error: error
            }
          });
        }
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);
  var setError = React.useCallback(function (error) {
    dispatch({
      type: ActionType.ERROR,
      payload: {
        error: error
      }
    });
  }, []);
  var deactivate = React.useCallback(function () {
    dispatch({
      type: ActionType.DEACTIVATE_CONNECTOR
    });
  }, []);
  var handleUpdate = React.useCallback(function (update) {
    try {
      if (!connector) {
        throw Error("This should never happen, it's just so Typescript stops complaining");
      }

      var updateBusterInitial = updateBusterRef.current; // updates are handled differently depending on whether the connector is active vs in an error state

      return Promise.resolve(function () {
        if (!error) {
          var _chainId4 = update.chainId === undefined ? undefined : normalizeChainId(update.chainId);

          if (_chainId4 !== undefined && !!connector.supportedChainIds && !connector.supportedChainIds.includes(_chainId4)) {
            var _error2 = new UnsupportedChainIdError(_chainId4, connector.supportedChainIds);

            onError ? onError(_error2) : dispatch({
              type: ActionType.ERROR,
              payload: {
                error: _error2
              }
            });
          } else {
            var _account4 = typeof update.account === 'string' ? normalizeAccount(update.account) : update.account;

            dispatch({
              type: ActionType.UPDATE,
              payload: {
                provider: update.provider,
                chainId: _chainId4,
                account: _account4
              }
            });
          }
        } else {
          return _catch(function () {
            return Promise.resolve(augmentConnectorUpdate(connector, update)).then(function (augmentedUpdate) {
              if (updateBusterRef.current > updateBusterInitial) {
                throw new StaleConnectorError();
              }

              dispatch({
                type: ActionType.UPDATE_FROM_ERROR,
                payload: augmentedUpdate
              });
            });
          }, function (error) {
            if (error instanceof StaleConnectorError) {
              "development" !== "production" ? warning(false, "Suppressed stale connector update from error state " + connector + " " + update) : void 0;
            } else {
              // though we don't have to, we're re-circulating the new error
              onError ? onError(error) : dispatch({
                type: ActionType.ERROR,
                payload: {
                  error: error
                }
              });
            }
          });
        }
      }());
    } catch (e) {
      return Promise.reject(e);
    }
  }, [connector, error, onError]);
  var handleError = React.useCallback(function (error) {
    onError ? onError(error) : dispatch({
      type: ActionType.ERROR,
      payload: {
        error: error
      }
    });
  }, [onError]);
  var handleDeactivate = React.useCallback(function () {
    dispatch({
      type: ActionType.DEACTIVATE_CONNECTOR
    });
  }, []); // ensure that connectors which were set are deactivated

  React.useEffect(function () {
    return function () {
      if (connector) {
        connector.deactivate();
      }
    };
  }, [connector]); // ensure that events emitted from the set connector are handled appropriately

  React.useEffect(function () {
    if (connector) {
      connector.on(types.ConnectorEvent.Update, handleUpdate).on(types.ConnectorEvent.Error, handleError).on(types.ConnectorEvent.Deactivate, handleDeactivate);
    }

    return function () {
      if (connector) {
        connector.off(types.ConnectorEvent.Update, handleUpdate).off(types.ConnectorEvent.Error, handleError).off(types.ConnectorEvent.Deactivate, handleDeactivate);
      }
    };
  }, [connector, handleUpdate, handleError, handleDeactivate]);
  return {
    connector: connector,
    provider: provider,
    chainId: chainId,
    account: account,
    activate: activate,
    setError: setError,
    deactivate: deactivate,
    error: error
  };
}

var PRIMARY_KEY = 'primary';
var CONTEXTS = {};
function createWeb3ReactRoot(key) {
  !!CONTEXTS[key] ?  invariant(false, "A root already exists for provided key " + key)  : void 0;
  CONTEXTS[key] = React.createContext({
    activate: function () {
      try {
        !false ? "development" !== "production" ? invariant(false, 'No <Web3ReactProvider ... /> found.') : invariant(false) : void 0;
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    },
    setError: function setError() {
        invariant(false, 'No <Web3ReactProvider ... /> found.')  ;
    },
    deactivate: function deactivate() {
        invariant(false, 'No <Web3ReactProvider ... /> found.')  ;
    },
    active: false
  });
  CONTEXTS[key].displayName = "Web3ReactContext - " + key;
  var Provider = CONTEXTS[key].Provider;
  return function Web3ReactProvider(_ref) {
    var getLibrary = _ref.getLibrary,
        children = _ref.children;

    var _useWeb3ReactManager = useWeb3ReactManager(),
        connector = _useWeb3ReactManager.connector,
        provider = _useWeb3ReactManager.provider,
        chainId = _useWeb3ReactManager.chainId,
        account = _useWeb3ReactManager.account,
        activate = _useWeb3ReactManager.activate,
        setError = _useWeb3ReactManager.setError,
        deactivate = _useWeb3ReactManager.deactivate,
        error = _useWeb3ReactManager.error;

    var active = connector !== undefined && chainId !== undefined && account !== undefined && !!!error;
    var library = React.useMemo(function () {
      return active && chainId !== undefined && Number.isInteger(chainId) && !!connector ? getLibrary(provider, connector) : undefined;
    }, [active, getLibrary, provider, connector, chainId]);
    var web3ReactContext = {
      connector: connector,
      library: library,
      chainId: chainId,
      account: account,
      activate: activate,
      setError: setError,
      deactivate: deactivate,
      active: active,
      error: error
    };
    return React__default.createElement(Provider, {
      value: web3ReactContext
    }, children);
  };
}
var Web3ReactProvider = /*#__PURE__*/createWeb3ReactRoot(PRIMARY_KEY);
function getWeb3ReactContext(key) {
  if (key === void 0) {
    key = PRIMARY_KEY;
  }

  !Object.keys(CONTEXTS).includes(key) ?  invariant(false, "Invalid key " + key)  : void 0;
  return CONTEXTS[key];
}
function useWeb3React(key) {
  return React.useContext(getWeb3ReactContext(key));
}

exports.PRIMARY_KEY = PRIMARY_KEY;
exports.UnsupportedChainIdError = UnsupportedChainIdError;
exports.Web3ReactProvider = Web3ReactProvider;
exports.createWeb3ReactRoot = createWeb3ReactRoot;
exports.getWeb3ReactContext = getWeb3ReactContext;
exports.useWeb3React = useWeb3React;
//# sourceMappingURL=core.cjs.development.js.map
