# iso-url [![NPM Version](https://img.shields.io/npm/v/iso-url.svg)](https://www.npmjs.com/package/iso-url) [![NPM Downloads](https://img.shields.io/npm/dt/iso-url.svg)](https://www.npmjs.com/package/iso-url) [![NPM License](https://img.shields.io/npm/l/iso-url.svg)](https://www.npmjs.com/package/iso-url) ![tests](https://github.com/hugomrdias/iso-url/workflows/tests/badge.svg) [![codecov](https://codecov.io/gh/hugomrdias/iso-url/badge.svg?branch=master)](https://codecov.io/gh/hugomrdias/iso-url?branch=master)

> Isomorphic/Univeral WHATWG URL API with some support legacy node URL API

This package is a universal wrapper for node `url` and browser window.URL with support for legacy `url.parse` properties in the URL instance and defaults for base to support relative urls like `url.parse`. Node URL [docs](https://nodejs.org/docs/latest-v10.x/api/url.html#url_the_whatwg_url_api).

## Caveats

No support for querystring objects. Use `URLSearchParams`.

## Install

```
$ npm install iso-url
```

## Usage

```js
const { URL, URLSearchParams, format, relative } = require('iso-url');

const url = new isoUrl('http://localhost/unicorns');
const newSearchParams = new URLSearchParams(url.searchParams);
```

## API

### new URL(url, [base])

#### input

Type: `string`

The absolute or relative input URL to parse. If input is relative, then base is required. If input is absolute, the base is ignored.

#### base

Type: `string|URL`  
Default: `https://localhost` in node and `self.location.protocol + '//' + self.location.host` in the browser.

The base URL to resolve against if the input is not absolute.

### format(url, [options])

Same as https://nodejs.org/api/url.html#url_url_format_url_options

### relative(url, [location], [protocalMap], [defaultProtocol])

Same as https://github.com/dominictarr/relative-url but doesn't support this syntax `'//:9999'`

## License

MIT © [Hugo Dias](http://hugodias.me)
