# canvas-renderer

[![Build Status](https://travis-ci.org/dmester/canvas-renderer.svg?branch=master)](https://travis-ci.org/dmester/canvas-renderer)
[![Downloads](https://img.shields.io/npm/dt/canvas-renderer.svg)](https://www.npmjs.com/package/canvas-renderer)
[![License MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/dmester/canvas-renderer/blob/master/LICENSE)

HTML5 inspired canvas implemented in Node.js for rendering PNG images.
* Render simple polygons as PNG with no native dependencies 
  like PhantomJS.
* The library does not run in the browser.
* This is not an attempt to implement the complete HTML5 
  CanvasRenderingContext2D interface. See the supported methods
  below.
* The performance has not been in focus. If performance is 
  important in your project, consider using a native backed canvas 
  implementation.
  

## Sample
Install the canvas-renderer NPM package.

```
npm install canvas-renderer
```

The following example renders two triangles to test.png.

```js
const fs = require("fs");
const canvasRenderer = require("canvas-renderer");

var canvas = canvasRenderer.createCanvas(100, 100);

var ctx = canvas.getContext("2d");

ctx.fillStyle = "#ff0000";
ctx.beginPath();
ctx.moveTo(10, 10);
ctx.lineTo(90, 10);
ctx.lineTo(10, 90);
ctx.fill();

ctx.fillStyle = "#0000ff";
ctx.beginPath();
ctx.moveTo(90, 90);
ctx.lineTo(90, 50);
ctx.lineTo(50, 90);
ctx.fill();

var testpng = fs.createWriteStream("test.png");
testpng.write(canvas.toPng());
testpng.close();
```

## API
To create an instance of `Canvas`, use the `createCanvas(width, height)` method that is exposed
by the module. Use the `getContext()` method on the canvas to get a `CanvasContext` object.

### Canvas

#### Properties

* `width` (integer)

  The width of the canvas in pixels.

* `height` (integer)

  The height of the canvas in pixels.

* `backColor` (color)

  Specifies the background color. See `fillStyle` below for allowed values. 
  Default is transparent.

#### Methods

* `toPng([keywords])`

  Renders the canvas as a PNG data stream and returns it as a `Buffer`. `keywords`
  is an optional dictionary defining the keywords to be written to the PNG stream.
  See https://www.w3.org/TR/PNG/#11keywords.

* `getContext()`

  Gets a CanvasContext object for drawing on this canvas.
  
* `toDataURL([type], [encoderOptions])`

  Renders the canvas as a dataURI. Note that the two parameters are currently
  ignored since the only supported `type` is `image/png`.


### CanvasContext

#### Properties

* `fillStyle` (color)

  Specifies the fill color that is used when the `fill()` method is called. Allowed values are:

  * 32 bit integers on the format `0xRRGGBBAA`
  * string `"transparent"`
  * strings on the format `"#2c4"` (#RGB)
  * strings on the format `"#2c4f"` (#RGBA)
  * strings on the format `"#22cc44"` (#RRGGBB)
  * strings on the format `"#22cc44ff"` (#RRGGBBAA)
  * strings on the format `"rgb(255, 124, 22)"`
  * strings on the format `"rgb(255, 124, 22, 0.5)"`
  * strings on the format `"rgb(255, 124, 22, 50%)"`
  * strings on the format `"rgba(255, 124, 22, 0.5)"`
  * strings on the format `"rgba(255, 124, 22, 50%)"`
  * strings on the format `"rgb(23%, 45%, 75%)"`
  * strings on the format `"rgb(23%, 45%, 75%, 0.5)"`
  * strings on the format `"rgb(23%, 45%, 75%, 50%)"`
  * strings on the format `"rgba(23%, 45%, 75%, 0.5)"`
  * strings on the format `"rgba(23%, 45%, 75%, 50%)"`
  * strings on the format `"hsl(134, 50%, 50%)"`
  * strings on the format `"hsl(134, 50%, 50%, 0.5)"`
  * strings on the format `"hsl(134, 50%, 50%, 50%)"`
  * strings on the format `"hsla(134, 50%, 50%, 0.5)"`
  * strings on the format `"hsla(134, 50%, 50%, 50%)"`
  * strings on the format `"hwb(134, 50%, 50%)"`
  * strings on the format `"hwb(134, 50%, 50%, 0.5)"`
  * strings on the format `"hwb(134, 50%, 50%, 50%)"`
  * named colors listed in [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/#named-colors)
  
#### Paths

* `beginPath()`

  Removes all existing subpaths and begins a new path.

* `moveTo(x, y)`

  Begins a new subpath by moving the cursor to the specified position.

* `lineTo(x, y)`

  Inserts an edge between the last and specified position.

* `arc(x, y, radius, startAngle, endAngle, [anticlockwise])`

  Adds an arc to the current subpath. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc)
  for details.

* `closePath()`

  Starts a new subpath that begins in the same point as the start and end point of the previous one.

#### Rendering

* `clearRect(x, y, width, height)`

  Fills the specified rectangle with fully transparent black without affecting the current paths.

* `fill([windingRule])`

  Fills the defined paths. `windingRule` defines the winding rule to be used for 
  determining which areas are covered by the current path. Valid values are `"evenodd"` and
  `"nonzero"`. Default is `"nonzero"`.

* `fillRect(x, y, width, height)`

  Fills the specified rectangle without affecting the current paths.

#### Operations

* `save()`

  Saves the current transformation and fill style to a stack. The state can be
  restored using `restore()`.

* `restore()`

  Restores the last state saved by `save()` and removes the state from the 
  state stack.

#### Transformation

* `resetTransform()`

* `rotate(angle)`

* `scale(x, y)`

* `setTransform(a, b, c, d, e, f)`

* `transform(a, b, c, d, e, f)`

* `translate(x, y)`

## License
canvas-renderer is released under the [MIT license](https://github.com/dmester/canvas-renderer/blob/master/LICENSE).
