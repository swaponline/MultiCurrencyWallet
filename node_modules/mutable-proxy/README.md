# MutableProxy

[![Travis-Ci](https://travis-ci.org/Griffingj/mutable-proxy.svg?branch=master)](https://travis-ci.org/Griffingj/mutable-proxy.svg?branch=master)
[![Code Climate](https://codeclimate.com/github/Griffingj/mutable-proxy/badges/gpa.svg)](https://codeclimate.com/github/Griffingj/mutable-proxy)
[![Test Coverage](https://codeclimate.com/github/Griffingj/mutable-proxy/badges/coverage.svg)](https://codeclimate.com/github/Griffingj/mutable-proxy/coverage)
## Basic Usage

The factory returns a controller object with functions to affect the mutable state of the proxy

```javascript
const {
  setTarget,
  setHandler,
  proxy
} = mutableProxyFactory();
```

Set a simple object as target for the proxy

```javascript
setTarget({ a: 'apple' });
console.log(proxy.a); // => 'apple'
console.log(Object.getPrototypeOf(proxy) === Object.prototype); // => 'true'
```

Set an array as target for the proxy

```javascript
setTarget(['a', 'b', 'c']);
console.log(proxy[1]); // => 'b'
console.log(Object.getPrototypeOf(proxy) === Array.prototype);// => 'true'
```

Set a function as target for the proxy

```javascript
setTarget(() => 5);
console.log(proxy()); // => '5'
console.log(Object.getPrototypeOf(proxy) === Function.prototype); // => 'true'
```

Set an object with a custom prototype for the proxy

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `hi, my name is ${this.name}`;
  }
}

setTarget(new Person('John'));
console.log(proxy.speak()); // => 'hi, my name is John'
console.log(Object.getPrototypeOf(proxy)); // => 'Person {}'
```
