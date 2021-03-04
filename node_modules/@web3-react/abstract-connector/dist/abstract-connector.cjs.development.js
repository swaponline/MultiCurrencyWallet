'use strict';

var events = require('events');
var types = require('@web3-react/types');

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var AbstractConnector =
/*#__PURE__*/
function (_EventEmitter) {
  _inheritsLoose(AbstractConnector, _EventEmitter);

  function AbstractConnector(_temp) {
    var _this;

    var _ref = _temp === void 0 ? {} : _temp,
        supportedChainIds = _ref.supportedChainIds;

    _this = _EventEmitter.call(this) || this;
    _this.supportedChainIds = supportedChainIds;
    return _this;
  }

  var _proto = AbstractConnector.prototype;

  _proto.emitUpdate = function emitUpdate(update) {
    {
      console.log("Emitting '" + types.ConnectorEvent.Update + "' with payload", update);
    }

    this.emit(types.ConnectorEvent.Update, update);
  };

  _proto.emitError = function emitError(error) {
    {
      console.log("Emitting '" + types.ConnectorEvent.Error + "' with payload", error);
    }

    this.emit(types.ConnectorEvent.Error, error);
  };

  _proto.emitDeactivate = function emitDeactivate() {
    {
      console.log("Emitting '" + types.ConnectorEvent.Deactivate + "'");
    }

    this.emit(types.ConnectorEvent.Deactivate);
  };

  return AbstractConnector;
}(events.EventEmitter);

exports.AbstractConnector = AbstractConnector;
//# sourceMappingURL=abstract-connector.cjs.development.js.map
