## [0.14.3](https://github.com/libp2p/js-peer-id/compare/v0.14.2...v0.14.3) (2021-01-26)



<a name="0.14.2"></a>
## [0.14.2](https://github.com/libp2p/js-peer-id/compare/v0.14.1...v0.14.2) (2020-09-23)


### Features

* has inline public key method ([#132](https://github.com/libp2p/js-peer-id/issues/132)) ([b2ee342](https://github.com/libp2p/js-peer-id/commit/b2ee342))



<a name="0.14.1"></a>
## [0.14.1](https://github.com/libp2p/js-peer-id/compare/v0.13.13...v0.14.1) (2020-09-03)


### Bug Fixes

* privKey possible undefined ([#129](https://github.com/libp2p/js-peer-id/issues/129)) ([224b30c](https://github.com/libp2p/js-peer-id/commit/224b30c))
* replace node buffers with uint8arrays ([#127](https://github.com/libp2p/js-peer-id/issues/127)) ([d16ce9c](https://github.com/libp2p/js-peer-id/commit/d16ce9c))
* ts constructor types ([#130](https://github.com/libp2p/js-peer-id/issues/130)) ([d40d588](https://github.com/libp2p/js-peer-id/commit/d40d588))
* typo in readme ([#128](https://github.com/libp2p/js-peer-id/issues/128)) ([6d571ae](https://github.com/libp2p/js-peer-id/commit/6d571ae))


### BREAKING CHANGES

* - Where node Buffers were returned, now Uint8Arrays are

* chore: remove gh dep



<a name="0.14.0"></a>
# [0.14.0](https://github.com/libp2p/js-peer-id/compare/v0.13.13...v0.14.0) (2020-08-07)


### Bug Fixes

* replace node buffers with uint8arrays ([#127](https://github.com/libp2p/js-peer-id/issues/127)) ([d16ce9c](https://github.com/libp2p/js-peer-id/commit/d16ce9c))


### BREAKING CHANGES

* - Where node Buffers were returned, now Uint8Arrays are

* chore: remove gh dep



<a name="0.13.13"></a>
## [0.13.13](https://github.com/libp2p/js-peer-id/compare/v0.13.12...v0.13.13) (2020-06-23)



<a name="0.13.12"></a>
## [0.13.12](https://github.com/libp2p/js-peer-id/compare/v0.13.11...v0.13.12) (2020-04-22)


### Features

* **cli:** add support for specifying type and size ([#122](https://github.com/libp2p/js-peer-id/issues/122)) ([8cd9dfb](https://github.com/libp2p/js-peer-id/commit/8cd9dfb))



<a name="0.13.11"></a>
## [0.13.11](https://github.com/libp2p/js-peer-id/compare/v0.13.10...v0.13.11) (2020-03-26)



<a name="0.13.10"></a>
## [0.13.10](https://github.com/libp2p/js-peer-id/compare/v0.13.9...v0.13.10) (2020-03-18)


### Bug Fixes

* add buffer ([#120](https://github.com/libp2p/js-peer-id/issues/120)) ([c305c36](https://github.com/libp2p/js-peer-id/commit/c305c36))



<a name="0.13.9"></a>
## [0.13.9](https://github.com/libp2p/js-peer-id/compare/v0.13.8...v0.13.9) (2020-02-19)



<a name="0.13.8"></a>
## [0.13.8](https://github.com/libp2p/js-peer-id/compare/v0.13.6...v0.13.8) (2020-02-18)


### Bug Fixes

* remove use of assert module ([#117](https://github.com/libp2p/js-peer-id/issues/117)) ([f44645e](https://github.com/libp2p/js-peer-id/commit/f44645e))


### Features

* adds typescript types + type tests ([#110](https://github.com/libp2p/js-peer-id/issues/110)) ([a5070ae](https://github.com/libp2p/js-peer-id/commit/a5070ae))



<a name="0.13.7"></a>
## [0.13.7](https://github.com/libp2p/js-peer-id/compare/v0.13.6...v0.13.7) (2020-01-27)


### Features

* adds typescript types + type tests ([#110](https://github.com/libp2p/js-peer-id/issues/110)) ([a5070ae](https://github.com/libp2p/js-peer-id/commit/a5070ae))



<a name="0.13.6"></a>
## [0.13.6](https://github.com/libp2p/js-peer-id/compare/v0.13.5...v0.13.6) (2019-12-18)


### Bug Fixes

* catch errors thrown by multihash decode ([#109](https://github.com/libp2p/js-peer-id/issues/109)) ([65e0b74](https://github.com/libp2p/js-peer-id/commit/65e0b74))



<a name="0.13.5"></a>
## [0.13.5](https://github.com/libp2p/js-peer-id/compare/v0.13.4...v0.13.5) (2019-11-12)


### Features

* deprecate isEqual in favor of equals ([#107](https://github.com/libp2p/js-peer-id/issues/107)) ([bbf0416](https://github.com/libp2p/js-peer-id/commit/bbf0416))



<a name="0.13.4"></a>
## [0.13.4](https://github.com/libp2p/js-peer-id/compare/v0.13.3...v0.13.4) (2019-11-04)


### Bug Fixes

* bang in bin.js ([#106](https://github.com/libp2p/js-peer-id/issues/106)) ([11d4ec1](https://github.com/libp2p/js-peer-id/commit/11d4ec1))


### Features

* support Peer ID represented as CID ([#105](https://github.com/libp2p/js-peer-id/issues/105)) ([544ca7d](https://github.com/libp2p/js-peer-id/commit/544ca7d))



<a name="0.13.3"></a>
## [0.13.3](https://github.com/libp2p/js-peer-id/compare/v0.13.2...v0.13.3) (2019-09-25)


### Features

* allow nested PeerIds to support pubKey function when using identity encoding ([#101](https://github.com/libp2p/js-peer-id/issues/101)) ([f39fb24](https://github.com/libp2p/js-peer-id/commit/f39fb24))



<a name="0.13.2"></a>
## [0.13.2](https://github.com/libp2p/js-peer-id/compare/v0.13.1...v0.13.2) (2019-07-12)


### Features

* add compact protobuf format ([#76](https://github.com/libp2p/js-peer-id/issues/76)) ([7686418](https://github.com/libp2p/js-peer-id/commit/7686418))



<a name="0.13.1"></a>
## [0.13.1](https://github.com/libp2p/js-peer-id/compare/v0.13.0...v0.13.1) (2019-07-11)


### Features

* **peerid:** support creating from secp256k1; harmonize algo with Go ([#95](https://github.com/libp2p/js-peer-id/issues/95)) ([17440a3](https://github.com/libp2p/js-peer-id/commit/17440a3))



<a name="0.13.0"></a>
# [0.13.0](https://github.com/libp2p/js-peer-id/compare/v0.12.2...v0.13.0) (2019-07-11)


### Features

* async await ([#87](https://github.com/libp2p/js-peer-id/issues/87)) ([c3463c7](https://github.com/libp2p/js-peer-id/commit/c3463c7))


### BREAKING CHANGES

* API refactored to use async/await



<a name="0.12.2"></a>
## [0.12.2](https://github.com/libp2p/js-peer-id/compare/v0.12.1...v0.12.2) (2019-01-09)


### Bug Fixes

* clean repo and bundle size reduction ([cd20993](https://github.com/libp2p/js-peer-id/commit/cd20993))



<a name="0.12.1"></a>
## [0.12.1](https://github.com/libp2p/js-peer-id/compare/v0.12.0...v0.12.1) (2019-01-03)



<a name="0.12.0"></a>
# [0.12.0](https://github.com/libp2p/js-peer-id/compare/v0.11.0...v0.12.0) (2018-10-18)


### Bug Fixes

* add peerIdWithIs to the API functions using the instance ([2e5e666](https://github.com/libp2p/js-peer-id/commit/2e5e666))


### Features

* add class-is module ([6513a02](https://github.com/libp2p/js-peer-id/commit/6513a02))



<a name="0.11.0"></a>
# [0.11.0](https://github.com/libp2p/js-peer-id/compare/v0.10.7...v0.11.0) (2018-07-02)


### Features

* change toPrint output to match go implementation ([e8ab1b9](https://github.com/libp2p/js-peer-id/commit/e8ab1b9))



<a name="0.10.7"></a>
## [0.10.7](https://github.com/libp2p/js-peer-id/compare/v0.10.6...v0.10.7) (2018-04-05)



<a name="0.10.6"></a>
## [0.10.6](https://github.com/libp2p/js-peer-id/compare/v0.10.5...v0.10.6) (2018-02-12)



<a name="0.10.5"></a>
## [0.10.5](https://github.com/libp2p/js-peer-id/compare/v0.10.4...v0.10.5) (2018-01-28)



<a name="0.10.4"></a>
## [0.10.4](https://github.com/libp2p/js-peer-id/compare/v0.10.3...v0.10.4) (2017-12-20)


### Bug Fixes

* update dependencies ([#73](https://github.com/libp2p/js-peer-id/issues/73)) ([8b9a134](https://github.com/libp2p/js-peer-id/commit/8b9a134))



<a name="0.10.3"></a>
## [0.10.3](https://github.com/libp2p/js-peer-id/compare/v0.10.2...v0.10.3) (2017-12-01)


### Bug Fixes

* catch error when unmarshaling instead of crashing ([#72](https://github.com/libp2p/js-peer-id/issues/72)) ([156911e](https://github.com/libp2p/js-peer-id/commit/156911e))



<a name="0.10.2"></a>
## [0.10.2](https://github.com/libp2p/js-peer-id/compare/v0.10.1...v0.10.2) (2017-10-12)


### Bug Fixes

* Always add public key to constructor if possible, Fix for undefined pubKey in remote peers ([#68](https://github.com/libp2p/js-peer-id/issues/68)) ([3abdcda](https://github.com/libp2p/js-peer-id/commit/3abdcda))



<a name="0.10.1"></a>
## [0.10.1](https://github.com/libp2p/js-peer-id/compare/v0.10.0...v0.10.1) (2017-09-07)


### Features

* **deps:** update aegir and libp2p-crypto ([#67](https://github.com/libp2p/js-peer-id/issues/67)) ([d7088d6](https://github.com/libp2p/js-peer-id/commit/d7088d6))



<a name="0.10.0"></a>
# [0.10.0](https://github.com/libp2p/js-peer-id/compare/v0.9.0...v0.10.0) (2017-09-03)


### Features

* p2p addrs situation ([#66](https://github.com/libp2p/js-peer-id/issues/66)) ([63428fa](https://github.com/libp2p/js-peer-id/commit/63428fa))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/libp2p/js-peer-id/compare/v0.8.8...v0.9.0) (2017-07-22)


### Features

* use next libp2p-crypto ([#64](https://github.com/libp2p/js-peer-id/issues/64)) ([442df13](https://github.com/libp2p/js-peer-id/commit/442df13))



<a name="0.8.8"></a>
## [0.8.8](https://github.com/libp2p/js-peer-id/compare/v0.8.7...v0.8.8) (2017-07-21)



<a name="0.8.7"></a>
## [0.8.7](https://github.com/libp2p/js-peer-id/compare/v0.8.6...v0.8.7) (2017-04-03)


### Features

* set privKey pubKey ([ac27907](https://github.com/libp2p/js-peer-id/commit/ac27907))



<a name="0.8.6"></a>
## [0.8.6](https://github.com/libp2p/js-peer-id/compare/v0.8.5...v0.8.6) (2017-03-30)


### Features

* isEqual ([3f4f670](https://github.com/libp2p/js-peer-id/commit/3f4f670))



<a name="0.8.5"></a>
## [0.8.5](https://github.com/libp2p/js-peer-id/compare/v0.8.4...v0.8.5) (2017-03-27)


### Bug Fixes

* avoid using constructor.name ([a3fe1a2](https://github.com/libp2p/js-peer-id/commit/a3fe1a2))


### Features

* isPeerId ([0acc572](https://github.com/libp2p/js-peer-id/commit/0acc572))



<a name="0.8.4"></a>
## [0.8.4](https://github.com/libp2p/js-peer-id/compare/v0.8.2...v0.8.4) (2017-03-16)



<a name="0.8.2"></a>
## [0.8.2](https://github.com/libp2p/js-peer-id/compare/v0.8.1...v0.8.2) (2017-02-09)



<a name="0.8.1"></a>
## [0.8.1](https://github.com/libp2p/js-peer-id/compare/v0.8.0...v0.8.1) (2016-12-18)


### Features

* cache b58 id ([bebb0a7](https://github.com/libp2p/js-peer-id/commit/bebb0a7))
* create b58 string on creation and throw on id mutation ([78d96d0](https://github.com/libp2p/js-peer-id/commit/78d96d0))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/libp2p/js-peer-id/compare/v0.7.0...v0.8.0) (2016-11-03)


* Async Crypto Endeavour (#33) ([31701e2](https://github.com/libp2p/js-peer-id/commit/31701e2))


### BREAKING CHANGES

* This changes the interface of .create, .createFromPrivKey,
.createFromPubKey, .createFromJSON



<a name="0.7.0"></a>
# [0.7.0](https://github.com/libp2p/js-peer-id/compare/v0.6.7...v0.7.0) (2016-05-26)


### Bug Fixes

* code review and docs and go interop ([58f1933](https://github.com/libp2p/js-peer-id/commit/58f1933))
* use new version of libp2p-crypto ([ab55046](https://github.com/libp2p/js-peer-id/commit/ab55046))



<a name="0.6.7"></a>
## [0.6.7](https://github.com/libp2p/js-peer-id/compare/v0.6.6...v0.6.7) (2016-05-23)



<a name="0.6.6"></a>
## [0.6.6](https://github.com/libp2p/js-peer-id/compare/v0.6.5...v0.6.6) (2016-04-12)



<a name="0.6.5"></a>
## [0.6.5](https://github.com/libp2p/js-peer-id/compare/v0.6.1...v0.6.5) (2016-04-12)



<a name="0.6.1"></a>
## [0.6.1](https://github.com/libp2p/js-peer-id/compare/v0.6.0...v0.6.1) (2016-03-15)



<a name="0.6.0"></a>
# [0.6.0](https://github.com/libp2p/js-peer-id/compare/v0.5.3...v0.6.0) (2016-03-10)



<a name="0.5.3"></a>
## [0.5.3](https://github.com/libp2p/js-peer-id/compare/v0.5.1...v0.5.3) (2016-03-05)



<a name="0.5.1"></a>
## [0.5.1](https://github.com/libp2p/js-peer-id/compare/v0.5.0...v0.5.1) (2016-03-03)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/libp2p/js-peer-id/compare/v0.4.0...v0.5.0) (2016-02-14)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/libp2p/js-peer-id/compare/v0.3.4...v0.4.0) (2015-11-05)



<a name="0.3.4"></a>
## [0.3.4](https://github.com/libp2p/js-peer-id/compare/v0.3.3...v0.3.4) (2015-10-28)



<a name="0.3.3"></a>
## [0.3.3](https://github.com/libp2p/js-peer-id/compare/v0.3.2...v0.3.3) (2015-09-15)



<a name="0.3.2"></a>
## [0.3.2](https://github.com/libp2p/js-peer-id/compare/v0.3.1...v0.3.2) (2015-09-14)



<a name="0.3.1"></a>
## [0.3.1](https://github.com/libp2p/js-peer-id/compare/v0.3.0...v0.3.1) (2015-08-25)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/libp2p/js-peer-id/compare/v0.2.0...v0.3.0) (2015-07-19)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/libp2p/js-peer-id/compare/v0.1.0...v0.2.0) (2015-07-17)



<a name="0.1.0"></a>
# 0.1.0 (2015-07-08)



