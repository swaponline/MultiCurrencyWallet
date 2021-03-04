<a name="3.1.0"></a>
# [3.1.0](https://github.com/alanshaw/it-length-prefixed/compare/v3.0.1...v3.1.0) (2020-07-27)


### Features

* add type declarations ([#11](https://github.com/alanshaw/it-length-prefixed/issues/11)) ([d97982d](https://github.com/alanshaw/it-length-prefixed/commit/d97982d))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/alanshaw/it-length-prefixed/compare/v3.0.0...v3.0.1) (2020-03-18)


### Bug Fixes

* remove node globals ([#9](https://github.com/alanshaw/it-length-prefixed/issues/9)) ([4389d64](https://github.com/alanshaw/it-length-prefixed/commit/4389d64))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/alanshaw/it-length-prefixed/compare/v2.0.0...v3.0.0) (2019-11-13)


### Features

* add decodeFromReader ([#3](https://github.com/alanshaw/it-length-prefixed/issues/3)) ([b61654d](https://github.com/alanshaw/it-length-prefixed/commit/b61654d))
* custom length encoding and decoding ([#8](https://github.com/alanshaw/it-length-prefixed/issues/8)) ([e419b63](https://github.com/alanshaw/it-length-prefixed/commit/e419b63))


### BREAKING CHANGES

* Additional validation now checks for messages with a length that is too long to prevent a possible DoS attack. The error code `ERR_MSG_TOO_LONG` has changed to `ERR_MSG_DATA_TOO_LONG` and the error code `ERR_MSG_LENGTH_TOO_LONG` has been added.

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>



<a name="2.0.0"></a>
# [2.0.0](https://github.com/alanshaw/it-length-prefixed/compare/v1.1.0...v2.0.0) (2019-09-26)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/alanshaw/it-length-prefixed/compare/v1.0.0...v1.1.0) (2019-08-13)


### Features

* encode single and optional decode onLength/onData callbacks ([#1](https://github.com/alanshaw/it-length-prefixed/issues/1)) ([ce68bc8](https://github.com/alanshaw/it-length-prefixed/commit/ce68bc8))



<a name="1.0.0"></a>
# 1.0.0 (2019-05-07)


### Bug Fixes

* badgers ([d2cec17](https://github.com/alanshaw/it-length-prefixed/commit/d2cec17))
* decode and add test ([987f8f6](https://github.com/alanshaw/it-length-prefixed/commit/987f8f6))
* decode fixes and e2e tests ([d4020df](https://github.com/alanshaw/it-length-prefixed/commit/d4020df))
* do not slice on bufer and data length equal ([3def7c8](https://github.com/alanshaw/it-length-prefixed/commit/3def7c8))
* fixes and tests ([a26c5e8](https://github.com/alanshaw/it-length-prefixed/commit/a26c5e8))
* more fix badgers ([7bbfc93](https://github.com/alanshaw/it-length-prefixed/commit/7bbfc93))
* properly handle backpressure ([cf47d04](https://github.com/alanshaw/it-length-prefixed/commit/cf47d04))
* sync streams and empty streams ([33e3a64](https://github.com/alanshaw/it-length-prefixed/commit/33e3a64))
* use default max length properly ([182f3ed](https://github.com/alanshaw/it-length-prefixed/commit/182f3ed))


### Features

* add fixed prefix length as an option ([c93f850](https://github.com/alanshaw/it-length-prefixed/commit/c93f850))
* add maxLength to allow controlling max buffer length during decode ([7810ade](https://github.com/alanshaw/it-length-prefixed/commit/7810ade))
* encode + tests ([d5f6d03](https://github.com/alanshaw/it-length-prefixed/commit/d5f6d03))
* improve tests and guards for failure cases ([2c43d59](https://github.com/alanshaw/it-length-prefixed/commit/2c43d59))
* maybe this decode function will work ([3c0efc7](https://github.com/alanshaw/it-length-prefixed/commit/3c0efc7))
* **decode:** add decodeFromReader method ([729dc2e](https://github.com/alanshaw/it-length-prefixed/commit/729dc2e))



