# input-format

[![npm version](https://img.shields.io/npm/v/input-format.svg?style=flat-square)](https://www.npmjs.com/package/input-format)
[![npm downloads](https://img.shields.io/npm/dm/input-format.svg?style=flat-square)](https://www.npmjs.com/package/input-format)
[![coverage](https://img.shields.io/coveralls/catamphetamine/input-format/master.svg?style=flat-square)](https://coveralls.io/r/catamphetamine/input-format?branch=master)

Formatting user's text input on-the-fly

[See Demo](https://catamphetamine.gitlab.io/input-format/)

## GitHub Ban

On March 9th, 2020, GitHub, Inc. silently [banned](https://medium.com/@catamphetamine/how-github-blocked-me-and-all-my-libraries-c32c61f061d3) my account (and all my libraries) without any notice for an unknown reason. I opened a support ticked but they didn't answer. Because of that, I had to move all my libraries to [GitLab](https://gitlab.com/catamphetamine).

## Installation

```
npm install input-format --save
```

## Usage

Define `parse()` and `format()` functions. For example, for parsing a phone number.

```js
import { templateParser, templateFormatter, parseDigit } from 'input-format'

// US phone number template
const TEMPLATE = '(xxx) xxx-xxxx'

// `parse` function parses input text characters one-by-one.
//
// `function parse(character, value) { return character }`
//
// Arguments:
//  * `character` is the currently parsed input text character.
//  * `value` is the parsed value so far.
//
// Returns:
//  * If it returns anything (not `undefined`) then it is appended to the `value`
//
// `parseDigit` is an exported helper `parse` function
// that returns `character` if it's a digit
// (a common case, e.g. phone numbers input).
//
// `templateParser` wrapper is a small helper
// which enhances `parse` function to limit `value` max length
// to the number of "x"-es in the template.
//
const parse = templateParser(TEMPLATE, parseDigit)

// `format` function formats parsed value.
//
// function format(value) { return { text: '(800) 555-3535', template: '(xxx) xxx-xxxx' } }
//
// Arguments:
//  * `value` is the parsed value to be formatted.
//
// Returns `{ text, template }`, where:
//  * `text` is the formatted text
//  * `template` is the template used to format the `text`
//    (can be a partial template or a full template)
//
// If the `value` couldn't be formatted then
// `format()` should just return `undefined`.
//
// `templateFormatter` helper creates a formatter based on a template.
//
const format = templateFormatter(TEMPLATE)
```

Then pass these `parse()` and `format()` functions to the library.

React Component:

```js
import { ReactInput } from 'input-format'

<ReactInput
  value={this.state.phone}
  onChange={phone => this.setState({ phone })}
  parse={parse}
  format={format}/>
```

Low-level Input Component API:

```js
import {
  onChange,
  onKeyDown
} from 'input-format'

const input = document.querySelector('input')

 onChange(event, input, parse, format, onChangeHandler)
onKeyDown(event, input, parse, format, onChangeHandler)
```

Core API:

```js
import { parse, format } from 'input-format'

// Input character parser for `parse()`.
function _parse(character, value) {
  if (value.length < 10) {
    if (character >= '0' && character <= '9') {
      return character
    }
  }
}

// Output text formatter for `format()`.
function _format(value) {
  ...
  // Just as an example of a return value
  return {
    text: '(800) 555-3535',
    template: '(xxx) xxx-xxxx'
  }
}

// Testing.

let value
let text = '(800) 555-3535'
let caret = 4 // before the first zero

// `parse()`.

{ value, caret } = parse(text, caret, _parse)

value === '8005553535'
caret === 2

// `format()`.

{ text, caret } = format(value, caret, _format)

value === '(800) 555-3535'
caret === 4
```

<!--
## Android

There have been some [reports](https://github.com/catamphetamine/input-format/issues/2) of some Android devices not positioning the caret correctly. A workaround has been added for that. In case of any issues with Android devices, report them to the aforementioned issue.
-->

## Contributing

After cloning this repo, ensure dependencies are installed by running:

```sh
npm install
```

This module is written in ES6 and uses [Babel](http://babeljs.io/) for ES5
transpilation. Widely consumable JavaScript can be produced by running:

```sh
npm run build
```

Once `npm run build` has run, you may `import` or `require()` directly from
node.

After developing, the full test suite can be evaluated by running:

```sh
npm test
```

When you're ready to test your new functionality on a real project, you can run

```sh
npm pack
```

It will `build`, `test` and then create a `.tgz` archive which you can then install in your project folder

```sh
npm install [module name with version].tar.gz
```

## License

[MIT](LICENSE)