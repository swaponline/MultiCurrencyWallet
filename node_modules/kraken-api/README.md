Node Kraken
===========

NodeJS Client Library for the Kraken (kraken.com) API

This is an asynchronous node js client for the kraken.com API. It exposes all the API methods found here: https://www.kraken.com/help/api through the ```api``` method.

### Installation

```bash
npm install kraken-api
```

### Example Usage:

```javascript
const key          = '...'; // API Key
const secret       = '...'; // API Private Key
const KrakenClient = require('kraken-api');
const kraken       = new KrakenClient(key, secret);

(async () => {
	// Display user's balance
	console.log(await kraken.api('Balance'));

	// Get Ticker Info
	console.log(await kraken.api('Ticker', { pair : 'XXBTZUSD' }));
})();
```

### Updates:

#### 1.0.1:
- Update dependencies
- Update required NodeJS version: [#42](https://github.com/nothingisdead/npm-kraken-api/pull/42)
- Add GetWebSocketsToken private method: [#65](https://github.com/nothingisdead/npm-kraken-api/pull/65)
- Update README: [#44](https://github.com/nothingisdead/npm-kraken-api/pull/44)

#### 1.0.0:

- All methods return a promise.
- The second argument (parameters) can be omitted.
- The third argument to the constructor can be an object (configuration) or a string (OTP), for backwards compatibility.

#### 0.1.0:

The callback passed to the ```api``` function conforms to the Node.js standard of

```javascript
function(error, data) {
	// ...
}
```

Thanks to @tehsenaus and @petermrg for pointing this out.

### Credit:

I used the example php implementation at https://github.com/payward/kraken-api-client and the python implementation at https://github.com/veox/python3-krakenex as references.

BTC donation address: 12X8GyUpfYxEP7sh1QaU4ngWYpzXJByQn5
