'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

module.exports = function mutableProxyFactory(defaultTarget) {
  var mutableHandler = void 0;
  var mutableTarget = void 0;

  function setTarget(target) {
    if (!(target instanceof Object)) {
      throw new Error('Target "' + target + '" is not an object');
    }
    mutableTarget = target;
  }

  function setHandler(handler) {
    Object.keys(handler).forEach(function (key) {
      var value = handler[key];

      if (typeof value !== 'function') {
        throw new Error('Trap "' + key + ': ' + value + '" is not a function');
      }

      if (!Reflect[key]) {
        throw new Error('Trap "' + key + ': ' + value + '" is not a valid trap');
      }
    });
    mutableHandler = handler;
  }
  setTarget(function () {});

  if (defaultTarget) {
    setTarget(defaultTarget);
  }
  setHandler(Reflect);

  // Dynamically forward all the traps to the associated methods on the mutable handler
  var handler = new Proxy({}, {
    get: function get(target, property) {
      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return mutableHandler[property].apply(null, [mutableTarget].concat(_toConsumableArray(args.slice(1))));
      };
    }
  });

  return {
    setTarget: setTarget,
    setHandler: setHandler,
    getTarget: function getTarget() {
      return mutableTarget;
    },
    getHandler: function getHandler() {
      return mutableHandler;
    },

    proxy: new Proxy(mutableTarget, handler)
  };
};