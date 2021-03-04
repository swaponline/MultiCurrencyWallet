# dns-over-http-resolver

[![Build Status](https://travis-ci.org/vasco-santos/dns-over-http-resolver.svg?branch=master)](https://travis-ci.org/vasco-santos/dns-over-http-resolver)
[![dependencies Status](https://david-dm.org/vasco-santos/dns-over-http-resolver/status.svg)](https://david-dm.org/vasco-santos/dns-over-http-resolver)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Downloads](https://img.shields.io/npm/dm/dns-over-http-resolver.svg)](https://www.npmjs.com/package/dns-over-http-resolver)
[![Minzipped size](https://badgen.net/bundlephobia/minzip/dns-over-http-resolver)](https://bundlephobia.com/result?p=dns-over-http-resolver)
[![codecov](https://img.shields.io/codecov/c/github/vasco-santos/dns-over-http-resolver.svg?style=flat-square)](https://codecov.io/gh/vasco-santos/dns-over-http-resolver)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/vasco-santos/dns-over-http-resolver/ci?label=ci&style=flat-square)](https://github.com/vasco-santos/dns-over-http-resolver/actions?query=branch%3Amaster+workflow%3Aci+)

> DNS over HTTP resolver

Isomorphic DNS over HTTP resolver using fetch.

API based on [Node.js' dns promises API](https://nodejs.org/dist/latest-v14.x/docs/api/dns.html#dns_dns_promises_api), allowing the native `dns` module to be used if available when relying on this API.

## Install

```sh
npm i dns-over-http-resolver
```

## Usage

```js
const DnsOverHttpResolver = require('dns-over-http-resolver')

const dohResolver = new DnsOverHttpResolver(options)
```

[Cloudflare](https://cloudflare-dns.com/dns-query) and [Google](https://dns.google/resolve) DNS servers are used by default. They can be replaced via the API. 

You can also use `require('dns').promises` in Node.js in lieu of this module.

### options

You can provide the following options for the DnsOverHttpResolver:

| Name | Type | Description | Default |
|------|------|-------------|---------|
| maxCache | `number` | maximum number of cached dns records | 100 |

## API

### resolve(hostname, rrType)

Uses the DNS protocol to resolve the given host name into a DNS record.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| hostname | `string` | host name to resolve |
| [rrType] | `string` | resource record type (default: 'A') |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<Array<string>>` | returns a Promise resolving a DNS record according to its type |

#### Example

```js
const DnsOverHttpResolver = require('dns-over-http-resolver')
const resolver = new DnsOverHttpResolver()

const hostname = 'google.com'
const recordType = 'TXT'

const dnsRecord = await resolver.resolve(hostname, recordType)
```

### resolve4(hostname)

Uses the DNS protocol to resolve the given host name into IPv4 addresses.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| hostname | `string` | host name to resolve |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<Array<string>>` | returns a Promise resolving IPv4 addresses |

#### Example

```js
const DnsOverHttpResolver = require('dns-over-http-resolver')
const resolver = new DnsOverHttpResolver()

const hostname = 'google.com'

const address = await resolver.resolve4(hostname) // ['216.58.212.142']
```

### resolve6(hostname)

Uses the DNS protocol to resolve the given host name into IPv6 addresses.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| hostname | `string` | host name to resolve |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<Array<string>>` | returns a Promise resolving IPv6 addresses |

#### Example

```js
const DnsOverHttpResolver = require('dns-over-http-resolver')
const resolver = new DnsOverHttpResolver()

const hostname = 'google.com'

const address = await resolver.resolve6(hostname) // ['2a00:1450:4001:801::200e']
```

### resolveTxt(hostname)

Uses the DNS protocol to resolve the given host name into a Text Record.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| hostname | `string` | host name to resolve |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<Array<Array<string>>>` | returns a Promise resolving a Text Record |

#### Example

```js
const DnsOverHttpResolver = require('dns-over-http-resolver')
const resolver = new DnsOverHttpResolver()

const hostname = 'google.com'

const address = await resolver.resolveTxt(hostname) // [['v=spf1 -all']]
```

### getServers()

Get an array of the IP addresses currently configured for DNS resolution.
These addresses are formatted according to RFC 5952. It can include a custom port.

#### Returns

| Type | Description |
|------|-------------|
| `Array<string>` | returns array of DNS servers used |

#### Example

```js
const DnsOverHttpResolver = require('dns-over-http-resolver')

const resolver = new DnsOverHttpResolver()
const servers = resolver.getServers()
```

### setServers(servers)

Sets the IP address and port of servers to be used when performing DNS resolution.
Note that the servers order will be randomized on each request for load distribution.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| servers | `Array<string>` | Array of RFC 5952 formatted addresses. |

#### Example

```js
const DnsOverHttpResolver = require('dns-over-http-resolver')

const resolver = new DnsOverHttpResolver()
resolver.setServers(['https://cloudflare-dns.com/dns-query'])
```

## Contribute

Feel free to dive in! [Open an issue](https://github.com/vasco-santos/dns-over-http-resolver/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Vasco Santos
