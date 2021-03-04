import { EventEmitter } from 'events';
import { ConnectorEvent } from '@web3-react/types';

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
    if (process.env.NODE_ENV !== "production") {
      console.log("Emitting '" + ConnectorEvent.Update + "' with payload", update);
    }

    this.emit(ConnectorEvent.Update, update);
  };

  _proto.emitError = function emitError(error) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Emitting '" + ConnectorEvent.Error + "' with payload", error);
    }

    this.emit(ConnectorEvent.Error, error);
  };

  _proto.emitDeactivate = function emitDeactivate() {
    if (process.env.NODE_ENV !== "production") {
      console.log("Emitting '" + ConnectorEvent.Deactivate + "'");
    }

    this.emit(ConnectorEvent.Deactivate);
  };

  return AbstractConnector;
}(EventEmitter);

export { AbstractConnector };
//# sourceMappingURL=abstract-connector.esm.js.map
