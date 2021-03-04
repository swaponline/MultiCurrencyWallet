import { AbstractConnector } from '@web3-react/abstract-connector';
import warning from 'tiny-warning';

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
  subClass.__proto__ = superClass;
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

function isNativeReflectConstruct() {
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
  if (isNativeReflectConstruct()) {
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

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

// A type of promise-like that resolves synchronously and supports only one observer
var _iteratorSymbol =
/*#__PURE__*/
typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator =
/*#__PURE__*/
Symbol("Symbol.iterator")) : "@@iterator"; // Asynchronously iterate through an object's values
var _asyncIteratorSymbol =
/*#__PURE__*/
typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator =
/*#__PURE__*/
Symbol("Symbol.asyncIterator")) : "@@asyncIterator"; // Asynchronously iterate on a value using it's async iterator if present, or its synchronous iterator if missing

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

function parseSendReturn(sendReturn) {
  return sendReturn.hasOwnProperty('result') ? sendReturn.result : sendReturn;
}

var NoEthereumProviderError =
/*#__PURE__*/
function (_Error) {
  _inheritsLoose(NoEthereumProviderError, _Error);

  function NoEthereumProviderError() {
    var _this;

    _this = _Error.call(this) || this;
    _this.name = _this.constructor.name;
    _this.message = 'No Ethereum provider was found on window.ethereum.';
    return _this;
  }

  return NoEthereumProviderError;
}(
/*#__PURE__*/
_wrapNativeSuper(Error));
var UserRejectedRequestError =
/*#__PURE__*/
function (_Error2) {
  _inheritsLoose(UserRejectedRequestError, _Error2);

  function UserRejectedRequestError() {
    var _this2;

    _this2 = _Error2.call(this) || this;
    _this2.name = _this2.constructor.name;
    _this2.message = 'The user rejected the request.';
    return _this2;
  }

  return UserRejectedRequestError;
}(
/*#__PURE__*/
_wrapNativeSuper(Error));
var InjectedConnector =
/*#__PURE__*/
function (_AbstractConnector) {
  _inheritsLoose(InjectedConnector, _AbstractConnector);

  function InjectedConnector(kwargs) {
    var _this3;

    _this3 = _AbstractConnector.call(this, kwargs) || this;
    _this3.handleNetworkChanged = _this3.handleNetworkChanged.bind(_assertThisInitialized(_this3));
    _this3.handleChainChanged = _this3.handleChainChanged.bind(_assertThisInitialized(_this3));
    _this3.handleAccountsChanged = _this3.handleAccountsChanged.bind(_assertThisInitialized(_this3));
    _this3.handleClose = _this3.handleClose.bind(_assertThisInitialized(_this3));
    return _this3;
  }

  var _proto = InjectedConnector.prototype;

  _proto.handleChainChanged = function handleChainChanged(chainId) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Handling 'chainChanged' event with payload", chainId);
    }

    this.emitUpdate({
      chainId: chainId,
      provider: window.ethereum
    });
  };

  _proto.handleAccountsChanged = function handleAccountsChanged(accounts) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Handling 'accountsChanged' event with payload", accounts);
    }

    if (accounts.length === 0) {
      this.emitDeactivate();
    } else {
      this.emitUpdate({
        account: accounts[0]
      });
    }
  };

  _proto.handleClose = function handleClose(code, reason) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Handling 'close' event with payload", code, reason);
    }

    this.emitDeactivate();
  };

  _proto.handleNetworkChanged = function handleNetworkChanged(networkId) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Handling 'networkChanged' event with payload", networkId);
    }

    this.emitUpdate({
      chainId: networkId,
      provider: window.ethereum
    });
  };

  _proto.activate = function activate() {
    try {
      var _temp5 = function _temp5(_result) {
        if (_exit2) return _result;

        function _temp2() {
          return _extends({
            provider: window.ethereum
          }, account ? {
            account: account
          } : {});
        }

        var _temp = function () {
          if (!account) {
            // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
            return Promise.resolve(window.ethereum.enable().then(function (sendReturn) {
              return sendReturn && parseSendReturn(sendReturn)[0];
            })).then(function (_window$ethereum$enab) {
              account = _window$ethereum$enab;
            });
          }
        }();

        // if unsuccessful, try enable
        return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
      };

      var _exit2 = false;

      var _this5 = this;

      if (!window.ethereum) {
        throw new NoEthereumProviderError();
      }

      if (window.ethereum.on) {
        window.ethereum.on('chainChanged', _this5.handleChainChanged);
        window.ethereum.on('accountsChanged', _this5.handleAccountsChanged);
        window.ethereum.on('close', _this5.handleClose);
        window.ethereum.on('networkChanged', _this5.handleNetworkChanged);
      }

      if (window.ethereum.isMetaMask) {
        ;
        window.ethereum.autoRefreshOnNetworkChange = false;
      } // try to activate + get account via eth_requestAccounts


      var account;

      var _temp6 = _catch(function () {
        return Promise.resolve(window.ethereum.send('eth_requestAccounts').then(function (sendReturn) {
          return parseSendReturn(sendReturn)[0];
        })).then(function (_window$ethereum$send) {
          account = _window$ethereum$send;
        });
      }, function (error) {
        if (error.code === 4001) {
          throw new UserRejectedRequestError();
        }

        process.env.NODE_ENV !== "production" ? warning(false, 'eth_requestAccounts was unsuccessful, falling back to enable') : void 0;
      });

      return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(_temp5) : _temp5(_temp6));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getProvider = function getProvider() {
    try {
      return Promise.resolve(window.ethereum);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getChainId = function getChainId() {
    try {
      var _temp12 = function _temp12() {
        function _temp9() {
          if (!chainId) {
            try {
              chainId = parseSendReturn(window.ethereum.send({
                method: 'net_version'
              }));
            } catch (_unused) {
              process.env.NODE_ENV !== "production" ? warning(false, 'net_version v2 was unsuccessful, falling back to manual matches and static properties') : void 0;
            }
          }

          if (!chainId) {
            if (window.ethereum.isDapper) {
              chainId = parseSendReturn(window.ethereum.cachedResults.net_version);
            } else {
              chainId = window.ethereum.chainId || window.ethereum.netVersion || window.ethereum.networkVersion || window.ethereum._chainId;
            }
          }

          return chainId;
        }

        var _temp8 = function () {
          if (!chainId) {
            var _temp14 = _catch(function () {
              return Promise.resolve(window.ethereum.send('net_version').then(parseSendReturn)).then(function (_window$ethereum$send3) {
                chainId = _window$ethereum$send3;
              });
            }, function () {
              process.env.NODE_ENV !== "production" ? warning(false, 'net_version was unsuccessful, falling back to net version v2') : void 0;
            });

            if (_temp14 && _temp14.then) return _temp14.then(function () {});
          }
        }();

        return _temp8 && _temp8.then ? _temp8.then(_temp9) : _temp9(_temp8);
      };

      if (!window.ethereum) {
        throw new NoEthereumProviderError();
      }

      var chainId;

      var _temp13 = _catch(function () {
        return Promise.resolve(window.ethereum.send('eth_chainId').then(parseSendReturn)).then(function (_window$ethereum$send2) {
          chainId = _window$ethereum$send2;
        });
      }, function () {
        process.env.NODE_ENV !== "production" ? warning(false, 'eth_chainId was unsuccessful, falling back to net_version') : void 0;
      });

      return Promise.resolve(_temp13 && _temp13.then ? _temp13.then(_temp12) : _temp12(_temp13));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getAccount = function getAccount() {
    try {
      var _temp20 = function _temp20() {
        function _temp17() {
          if (!account) {
            account = parseSendReturn(window.ethereum.send({
              method: 'eth_accounts'
            }))[0];
          }

          return account;
        }

        var _temp16 = function () {
          if (!account) {
            var _temp22 = _catch(function () {
              return Promise.resolve(window.ethereum.enable().then(function (sendReturn) {
                return parseSendReturn(sendReturn)[0];
              })).then(function (_window$ethereum$enab2) {
                account = _window$ethereum$enab2;
              });
            }, function () {
              process.env.NODE_ENV !== "production" ? warning(false, 'enable was unsuccessful, falling back to eth_accounts v2') : void 0;
            });

            if (_temp22 && _temp22.then) return _temp22.then(function () {});
          }
        }();

        return _temp16 && _temp16.then ? _temp16.then(_temp17) : _temp17(_temp16);
      };

      if (!window.ethereum) {
        throw new NoEthereumProviderError();
      }

      var account;

      var _temp21 = _catch(function () {
        return Promise.resolve(window.ethereum.send('eth_accounts').then(function (sendReturn) {
          return parseSendReturn(sendReturn)[0];
        })).then(function (_window$ethereum$send4) {
          account = _window$ethereum$send4;
        });
      }, function () {
        process.env.NODE_ENV !== "production" ? warning(false, 'eth_accounts was unsuccessful, falling back to enable') : void 0;
      });

      return Promise.resolve(_temp21 && _temp21.then ? _temp21.then(_temp20) : _temp20(_temp21));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.deactivate = function deactivate() {
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('chainChanged', this.handleChainChanged);
      window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
      window.ethereum.removeListener('close', this.handleClose);
      window.ethereum.removeListener('networkChanged', this.handleNetworkChanged);
    }
  };

  _proto.isAuthorized = function isAuthorized() {
    try {
      if (!window.ethereum) {
        return Promise.resolve(false);
      }

      return Promise.resolve(_catch(function () {
        return Promise.resolve(window.ethereum.send('eth_accounts').then(function (sendReturn) {
          if (parseSendReturn(sendReturn).length > 0) {
            return true;
          } else {
            return false;
          }
        }));
      }, function () {
        return false;
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return InjectedConnector;
}(AbstractConnector);

export { InjectedConnector, NoEthereumProviderError, UserRejectedRequestError };
//# sourceMappingURL=injected-connector.esm.js.map
