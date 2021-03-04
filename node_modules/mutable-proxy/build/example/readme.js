'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// The factory returns an object with the functions to control the proxy
var _mutableProxyFactory = (0, _index2.default)(),
    setTarget = _mutableProxyFactory.setTarget,
    proxy = _mutableProxyFactory.proxy;

// Set an object as target for the proxy


setTarget({ a: 'apple' });
console.log(proxy.a); // => 'apple'
console.log(Object.getPrototypeOf(proxy) === Object.prototype); // => 'true'

// Set an array as target for the proxy
setTarget(['a', 'b', 'c']);
console.log(proxy[1]); // => 'b'
console.log(Object.getPrototypeOf(proxy) === Array.prototype); // => 'true'

// Set a function as target for the proxy
setTarget(function () {
  return 5;
});
console.log(proxy()); // => '5'
console.log(Object.getPrototypeOf(proxy) === Function.prototype); // => 'true'


var Person = function () {
  function Person(name) {
    _classCallCheck(this, Person);

    this.name = name;
  }

  _createClass(Person, [{
    key: 'speak',
    value: function speak() {
      return 'hi, my name is ' + this.name;
    }
  }]);

  return Person;
}();

// Set an object with a custom prototype for the proxy


setTarget(new Person('John'));
console.log(proxy.speak()); // => 'hi, my name is John'
console.log(Object.getPrototypeOf(proxy)); // => 'Person {}'