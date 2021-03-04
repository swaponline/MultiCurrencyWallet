# Chai Checkmark [![][ci-develop]][travis-ci] [![][downloads]][npm]

**Checkmark** is a [Chai][] plugin for counting assertions made during a test.
Often, when dealing with asynchronous tests, it can be difficult to determine
if a callback was actually called. With Checkmark, you can be assured that the
assertion was made.

## Installation

Include Checkmark in the browser, as a CommonJS module, or through AMD.

```html
<!-- Browser -->
<script src="chai.js"></script>
<script src="chai-checkmark.js"></script>
```
```js
// CommonJS
var chai = require("chai"),
    plugin = require("chai-checkmark")
chai.use(plugin)
```
```js
// AMD
require(["chai", "chai-checkmark"], function(chai, plugin) {
    chai.use(plugin)
})
```

## How to use

```js
describe("something", function() {
  it("should check two things", function(next) {
    expect(2).checks(next) // <-- pass in the callback

    "sync test".should.be.a("string").mark() // <-- check 1

    setTimeout(function() {
      // check 2, callback is called after the current event finishes
      "async test".should.be.a("string").mark()
    }, 500)
  })
})
```

## API

Checkmark builds on Chai's assertion library by adding just two methods:

### `expect(Number).check(Function)` or `.checks(Function)`

This must be called before `.mark()` but doesn't have to be at the very
beginning of a test. You establish how many times you expect `.mark()` to
be called and optionally pass in a callback to be called when the number
of marks is reached.

### `expect(str).to.be.a("string").mark()`

Add `.mark()` to the end of every assertion to which you want to have
tracked by Checkmark. You can use any number of Chai's assertions,
including `.and`, as long as you end your statement with `.mark()`.

## Contributing

Pull Requests are welcome. They will only be merged if they are based off the
tip of the [develop][] branch. Please rebase (don't merge!) your changes if
you are behind. To learn about why rebase is better than merge, check out [The
Case for Git Rebase][rebase].

In short, to bring your Working Copy up to the tip of [develop][], you can use
the rebase feature: `git pull --rebase`. See [Pull with Rebase][pull] for
details.

  [Chai]: http://chaijs.com/
  [ci-develop]: https://img.shields.io/travis/sirlancelot/chai-checkmark/develop.svg?style=flat-square
  [ci-master]: https://img.shields.io/travis/sirlancelot/chai-checkmark/master.svg?style=flat-square
  [develop]: https://github.com/sirlancelot/chai-checkmark/tree/develop
  [downloads]: https://img.shields.io/npm/dm/chai-checkmark.svg?style=flat-square
  [npm]: https://www.npmjs.org/package/chai-checkmark
  [pull]: http://gitready.com/advanced/2009/02/11/pull-with-rebase.html
  [rebase]: http://darwinweb.net/articles/the-case-for-git-rebase
  [travis-ci]: https://travis-ci.org/sirlancelot/chai-checkmark
