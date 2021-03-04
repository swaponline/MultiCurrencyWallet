### 2.0.0
* BREAKING: The `EventIterator` constructor now has an arity of 2 instead of 3.
  The second `RemoveHandler` argument has been removed. Consumers should update
  their code such that the `RemoveHandler` should be passed as a return value of
  the `ListenHandler`, as opposed to the second argument of the `EventIterator`
  constructor. The `RemoveHandler` will be called asynchronously. (@keithamus)

* BREAKING: The `ListenHandler` is now called with one argument, as opposed to
  3. The single argument is an `EventQueue` object which contains the `push`,
  `stop` and `fail` functions. Consumers should update their code such that the
  `ListenHandler` is only given one argument, which could be a destructured
  object of `{push, stop, fail}`. (@keithamus)

* Added support for pausing/resuming streams when the internal queue fills or
  drains by listening to the `highWater` and `lowWater` events. (@KamalAman)

* Bugfix to continue yielding pending items after `stop()` has been called.
  (@KamalAman)

* Bugfix to ensure correct behaviour when using `next()` instead of a `for
  await` loop. (@KamalAman)

* Bugfixes to follow the iterator spec more closely. (@keithamus)

* Refactor internals.

### 1.2.0
* Add options argument to constructor, allowing configuration of
  `highWaterMark`. (@alanshaw)

### 1.1.0
* First stable version.

