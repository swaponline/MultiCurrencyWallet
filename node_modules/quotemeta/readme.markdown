# quotemeta

escape regular expression metacharacters

This module is like
[perl's quotemeta](http://perldoc.perl.org/functions/quotemeta.html)
without the part about `\Q...\E`.

[![build status](https://secure.travis-ci.org/substack/quotemeta.png)](http://travis-ci.org/substack/quotemeta)

[![browser support](http://ci.testling.com/substack/quotemeta.png)](http://ci.testling.com/substack/quotemeta)

# example

``` js
var quotemeta = require('quotemeta');

var query = new RegExp('\\d ' + quotemeta('node.js'));
var filter = function (x) { return query.test(x) };

var xs = [
    '0 node^js y',
    '1 node_js x',
    '2 node.js 5',
    '3 beep z',
    'X node.js Y',
    '4 boop w'
];
console.dir(xs.filter(filter));
```

# methods

``` js
var quotemeta = require('quotemeta')
```

## var escaped = quotemeta(string)

Return `string` with metacharacters escaped with `\`s.

# install

With [npm](https://npmjs.org) do:

```
npm install quotemeta
```

# license

MIT
