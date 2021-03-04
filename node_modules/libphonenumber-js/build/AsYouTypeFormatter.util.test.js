"use strict";

var _AsYouTypeFormatter = require("./AsYouTypeFormatter.util");

describe('closeNonPairedParens', function () {
  it('should close non-paired braces', function () {
    (0, _AsYouTypeFormatter.closeNonPairedParens)('(000) 123-45 (9  )', 15).should.equal('(000) 123-45 (9  )');
  });
});
describe('stripNonPairedParens', function () {
  it('should strip non-paired braces', function () {
    (0, _AsYouTypeFormatter.stripNonPairedParens)('(000) 123-45 (9').should.equal('(000) 123-45 9');
    (0, _AsYouTypeFormatter.stripNonPairedParens)('(000) 123-45 (9)').should.equal('(000) 123-45 (9)');
  });
});
describe('repeat', function () {
  it('should repeat string N times', function () {
    (0, _AsYouTypeFormatter.repeat)('a', 0).should.equal('');
    (0, _AsYouTypeFormatter.repeat)('a', 3).should.equal('aaa');
    (0, _AsYouTypeFormatter.repeat)('a', 4).should.equal('aaaa');
  });
});
//# sourceMappingURL=AsYouTypeFormatter.util.test.js.map