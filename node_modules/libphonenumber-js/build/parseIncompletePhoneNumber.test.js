"use strict";

var _parseIncompletePhoneNumber = _interopRequireWildcard(require("./parseIncompletePhoneNumber"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

describe('parseIncompletePhoneNumber', function () {
  it('should parse phone number character', function () {
    // Accepts leading `+`.
    (0, _parseIncompletePhoneNumber.parsePhoneNumberCharacter)('+').should.equal('+'); // Doesn't accept non-leading `+`.

    expect((0, _parseIncompletePhoneNumber.parsePhoneNumberCharacter)('+', '+')).to.be.undefined; // Parses digits.

    (0, _parseIncompletePhoneNumber.parsePhoneNumberCharacter)('1').should.equal('1'); // Parses non-European digits.

    (0, _parseIncompletePhoneNumber.parsePhoneNumberCharacter)('٤').should.equal('4'); // Dismisses other characters.

    expect((0, _parseIncompletePhoneNumber.parsePhoneNumberCharacter)('-')).to.be.undefined;
  });
  it('should parse incomplete phone number', function () {
    (0, _parseIncompletePhoneNumber["default"])('').should.equal(''); // Doesn't accept non-leading `+`.

    (0, _parseIncompletePhoneNumber["default"])('++').should.equal('+'); // Accepts leading `+`.

    (0, _parseIncompletePhoneNumber["default"])('+7 800 555').should.equal('+7800555'); // Parses digits.

    (0, _parseIncompletePhoneNumber["default"])('8 (800) 555').should.equal('8800555'); // Parses non-European digits.

    (0, _parseIncompletePhoneNumber["default"])('+٤٤٢٣٢٣٢٣٤').should.equal('+442323234');
  });
});
//# sourceMappingURL=parseIncompletePhoneNumber.test.js.map