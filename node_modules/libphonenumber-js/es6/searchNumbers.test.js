import searchNumbers from './searchNumbers';
import metadata from '../metadata.min.json';
describe('searchNumbers', function () {
  it('should iterate', function () {
    var expectedNumbers = [{
      country: 'RU',
      phone: '8005553535',
      // number   : '+7 (800) 555-35-35',
      startsAt: 14,
      endsAt: 32
    }, {
      country: 'US',
      phone: '2133734253',
      // number   : '(213) 373-4253',
      startsAt: 41,
      endsAt: 55
    }];

    for (var _iterator = searchNumbers('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', 'US', metadata), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var number = _ref;
      number.should.deep.equal(expectedNumbers.shift());
    }

    expectedNumbers.length.should.equal(0);
  });
});
//# sourceMappingURL=searchNumbers.test.js.map