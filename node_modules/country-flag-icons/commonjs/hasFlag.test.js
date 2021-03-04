"use strict";

var _hasFlag = _interopRequireDefault(require("./hasFlag"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('hasFlag', function () {
  it('should return whether a flag icon exists', function () {
    (0, _hasFlag["default"])('RU').should.equal(true);
    (0, _hasFlag["default"])('ZZ').should.equal(false);
  });
});
//# sourceMappingURL=hasFlag.test.js.map