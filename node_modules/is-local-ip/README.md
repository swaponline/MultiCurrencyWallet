# is-local-ip
Check that a given IP Address is private.


# Installation

#### Npm
```console
npm install is-local-ip
```

# Example

```javascript
var isLocal = require('is-local-ip');

isLocal("127.0.0.1"); // true
isLocal("::ffff:127.0.0.1"); // true
isLocal("192.168.0.12"); // true
isLocal("184.55.123.2"); // false
```

# Valid Private IP'S
* `::`
* `::1`
* `fc00::/7`
* `fe80::/10`
* `10.0.0.0` - `10.255.255.255`
* `127.0.0.0` - `127.255.255.255`
* `169.254.1.0` - `169.254.254.255`
* `172.16.0.0` - `172.31.255.255`
* `192.168.0.0` - `192.168.255.255`

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
