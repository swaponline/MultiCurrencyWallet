# is-lite

[![NPM version](https://badge.fury.io/js/is-lite.svg)](https://www.npmjs.com/package/is-lite) [![build status](https://travis-ci.org/gilbarbara/is-lite.svg)](https://travis-ci.org/gilbarbara/is-lite) [![is-lite](https://badgen.net/bundlephobia/minzip/is-lite?label=size)](https://bundlephobia.com/result?p=is-lite) [![Maintainability](https://api.codeclimate.com/v1/badges/7249fdaab7d4edf92bd0/maintainability)](https://codeclimate.com/github/gilbarbara/is-lite/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/7249fdaab7d4edf92bd0/test_coverage)](https://codeclimate.com/github/gilbarbara/is-lite/test_coverage)

> Lightweight type check tool.

Typescript ready with [type guards](http://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) to infer the correct type inside conditionals.

## Setup

```bash
npm install is-lite
```

## Usage

```js
import is from 'is-lite';

is('value'); // string
is.string('value'); // true
```

## API

**is(value)**  
Returns the type of the `value`.

Primitives are lowercase: `bigint`, `boolean`, `null`, `number`, `string`, `symbol`, `undefined`  
The rest are camelcase: `Array`, `Function`, `GeneratorFunction`, `Object`, ...

**is.array(value)**  

**is.arrayOf(target: any[], predicate: (value: unknown) => boolean)**  
Check if all items in an array are of same type.

```js
is.arrayOf(['a', 'b'], is.string); // true
is.arrayOf([123, 456], is.nnumber); // true

is.arrayOf(['a', 1], is.string); // false
```

**is.asyncFunction(value)**  
Check if `value` is an `async` function that can be called with `await`

```js
is.asyncFunction(async () => {}); // true
is.asyncFunction(() => {}); // false
```

**is.boolean(value)**  

**is.date(value)**  

**is.defined(value)**  
Check if `value` is anything but `undefined`.

**is.domElement(value)  **  
Check if `value` is a DOM Element.

**is.empty(value)**  
Returns `true` if:

- the value is a `string` and `length` is 0
- the value is an `Object` and `Object.keys(value).length` is 0
- the value is an `Array` and `length` is 0
- the value is a `Map` and `size` is 0
- the value is a `Set` and `size` is 0

**is.error(value)**  

**is.function(value)**  

**is.generator(value)  **  
Check for an object that has its own .next() and .throw() methods and has a function definition for `Symbol.iterator`

**is.generatorFunction(value)**  

**is.instanceOf(value, class)**  
Check if `value` is a direct instance of `class`

```js
class APIError extends Error {}

const error = new APIError('Fail');

is.instanceOf(error, APIError); // true 
is.instanceOf(error, Error); // false 
```

**is.iterable(value)**  

**is.map(value)**  

**is.nan(value)**  

**is.null(value)**  

**is.nullOrUndefined(value)**  

**is.number(value)  **  
Note: `is.number(NaN)` returns `false`

**is.numericString(value)**  
Check for a string that represents a number.

```js
is.numericString('42'); // true
is.numericString('-5'); // true
is.numericString('Inifinity'); // true
is.numericString('NaN'); // true
```

**is.object(value) **  
Remember that functions and arrays are objects too.

**is.oneOf(target: any[], value: any)**  
Check if `value` exists is the `target`

```js
const colors = ['red', 'green', 'blue'];

is.oneOf(colors, 'green'); // true
is.oneOf(colors, 'brown'); // false
```

**is.plainObject(value) **  
Check if the object is created by either `{}`, `new Object()` or `Object.create(null)`.

**is.promise(value)**  

**is.propertyOf(target: object, key: string, predicate?: (value: unknown) => boolean)**  
Check if `key` exists of `target`. if you pass a `predicate` function, it will check the value's type.

```js
const map = { items: [1], isLogged: false, retries: 0 };

is.propertyOf(map, 'retries'); // true
is.propertyOf(map, 'auth'); // false

is.propertyOf(map, 'retries', is.number); // true
is.propertyOf(map, 'items', is.array); // true
is.propertyOf(map, 'isLogged', is.string); // false
```

**is.regexp(value)**  

**is.set(value)**  

**is.string(value)**  

**is.symbol(value)**  

**is.undefined(value)**  

**is.weakMap(value)**  

**is.weakSet(value)**  

##  Contributing

Contributions, issues and feature requests are welcome!  
Feel free to check [issues page](https://github.com/gilbarbara/is-lite/issues).

## Show your support

Give a ⭐️ if this project helped you!

##  License

Copyright © 2019 [Gil Barbara <gilbarbara@gmail.com>](https://github.com/gilbarbara).  
This project is [MIT](https://github.com/gilbarbara/is-lite/blob/master/LICENSE) licensed.

## FAQ

[@sindresorhus/is](https://github.com/sindresorhus/is) is amazing but I needed something even smaller (and simpler).
This package cover the basics and is less than 1k minified+gzipped.