# scroll
animates the scroll top/left position of an element (in 340 bytes)

[![browser support](https://ci.testling.com/michaelrhodes/scroll.png)](https://ci.testling.com/michaelrhodes/scroll)

note: you may need to polyfill [`requestAnimationFrame`](https://caniuse.com/#feat=requestanimationframe) in older browsers

## install
```sh
npm install scroll
```

## use
```js
var scroll = require('scroll')
var page = require('scroll-doc')()
var ease = require('ease-component')

// Basic usage
scroll.left(page, 200)

// Register a callback
scroll.top(page, 200, function (err, scrollTop) {
  console.log(err)
  // { message: "Scroll cancelled" } or
  // { message: "Element already at target scroll position" } or
  // null

  console.log(scrollTop)
  // => The new scrollTop position of the element
  // This is always returned, even when there’s an `err`.
})

// Specify a custom easing function
scroll.left(page, 200, { ease: ease.inBounce })

// Specify a duration in milliseconds (default: 350) and register a callback.
scroll.left(page, 200, { duration: 1000 }, function (err, scrollLeft) {
})

// Cancel a scroll animation
var options = { duration: 1000 }
var cancel = scroll.top(page, 200, options, function (err, scrollTop) {
  console.log(err.message)
  // => Scroll cancelled

  page.removeEventListener('wheel', cancel)
})

page.addEventListener('wheel', cancel)
```

note: the default easing is `inOutSine` from [component/ease](https://github.com/component/ease).

## obey
[MIT](https://github.com/michaelrhodes/scroll/blob/master/LICENSE)
