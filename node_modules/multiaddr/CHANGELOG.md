## [8.1.2](https://github.com/multiformats/js-multiaddr/compare/v8.1.1...v8.1.2) (2020-12-11)


### Bug Fixes

* tell bundlers to return false for node dns module ([#163](https://github.com/multiformats/js-multiaddr/issues/163)) ([0ac20ba](https://github.com/multiformats/js-multiaddr/commit/0ac20bab74d23b459c144e69b138f58a8bd7201b))



## [8.1.1](https://github.com/multiformats/js-multiaddr/compare/v8.1.0...v8.1.1) (2020-10-30)


### Bug Fixes

* dns require ([#155](https://github.com/multiformats/js-multiaddr/issues/155)) ([4c89dcf](https://github.com/multiformats/js-multiaddr/commit/4c89dcf8ddf38afe6f36827abde22307f8650fe6))



# [8.1.0](https://github.com/multiformats/js-multiaddr/compare/v8.0.0...v8.1.0) (2020-10-29)


### Features

* resolve multiaddrs ([#149](https://github.com/multiformats/js-multiaddr/issues/149)) ([525268b](https://github.com/multiformats/js-multiaddr/commit/525268b3727bb9413e58322059d6ece7ec65e7f7))



<a name="8.0.0"></a>
# [8.0.0](https://github.com/multiformats/js-multiaddr/compare/v7.5.0...v8.0.0) (2020-08-07)


### Bug Fixes

* replace node buffers with uint8arrays ([#140](https://github.com/multiformats/js-multiaddr/issues/140)) ([53398f5](https://github.com/multiformats/js-multiaddr/commit/53398f5))


### BREAKING CHANGES

* - Where node Buffers were returned, now Uint8Arrays are
- The `.buffer` property has been renamed `.bytes` similar to cid@1.0.0

* chore: downgrade aegir



<a name="7.5.0"></a>
# [7.5.0](https://github.com/multiformats/js-multiaddr/compare/v7.4.3...v7.5.0) (2020-06-25)


### Features

* add new memory protocol for testing and other simulation scenarios ([bba22d2](https://github.com/multiformats/js-multiaddr/commit/bba22d2))



<a name="7.4.3"></a>
## [7.4.3](https://github.com/multiformats/js-multiaddr/compare/v7.4.2...v7.4.3) (2020-03-26)



<a name="7.4.2"></a>
## [7.4.2](https://github.com/multiformats/js-multiaddr/compare/v7.4.1...v7.4.2) (2020-03-18)


### Bug Fixes

* add buffer to ip ([#115](https://github.com/multiformats/js-multiaddr/issues/115)) ([deb7c9f](https://github.com/multiformats/js-multiaddr/commit/deb7c9f))



<a name="7.4.1"></a>
## [7.4.1](https://github.com/multiformats/js-multiaddr/compare/v7.4.0...v7.4.1) (2020-03-16)


### Bug Fixes

* use multibase, add buffer, remove ip dep ([#113](https://github.com/multiformats/js-multiaddr/issues/113)) ([f245744](https://github.com/multiformats/js-multiaddr/commit/f245744))



<a name="7.4.0"></a>
# [7.4.0](https://github.com/multiformats/js-multiaddr/compare/v7.3.1...v7.4.0) (2020-02-28)


### Bug Fixes

* update typings and add type test ([#112](https://github.com/multiformats/js-multiaddr/issues/112)) ([87aa7b0](https://github.com/multiformats/js-multiaddr/commit/87aa7b0))



<a name="7.3.1"></a>
## [7.3.1](https://github.com/multiformats/js-multiaddr/compare/v7.3.0...v7.3.1) (2020-02-13)


### Bug Fixes

* inspect deprecation warning ([#109](https://github.com/multiformats/js-multiaddr/issues/109)) ([a79a7af](https://github.com/multiformats/js-multiaddr/commit/a79a7af))



<a name="7.3.0"></a>
# [7.3.0](https://github.com/multiformats/js-multiaddr/compare/v7.2.1...v7.3.0) (2020-02-06)


### Features

* add typescript types + type tests ([#105](https://github.com/multiformats/js-multiaddr/issues/105)) ([1900490](https://github.com/multiformats/js-multiaddr/commit/1900490))



<a name="7.2.1"></a>
## [7.2.1](https://github.com/multiformats/js-multiaddr/compare/v7.2.0...v7.2.1) (2019-11-11)


### Bug Fixes

* ensure b58 can decode hash ([#103](https://github.com/multiformats/js-multiaddr/issues/103)) ([ac440cb](https://github.com/multiformats/js-multiaddr/commit/ac440cb))



<a name="7.2.0"></a>
# [7.2.0](https://github.com/multiformats/js-multiaddr/compare/v7.1.0...v7.2.0) (2019-10-28)


### Features

* support Peer ID represented as CID ([#102](https://github.com/multiformats/js-multiaddr/issues/102)) ([eead174](https://github.com/multiformats/js-multiaddr/commit/eead174))



<a name="7.1.0"></a>
# [7.1.0](https://github.com/multiformats/js-multiaddr/compare/v7.0.0...v7.1.0) (2019-09-10)


### Features

* add decapsulateCode method ([#98](https://github.com/multiformats/js-multiaddr/issues/98)) ([19a3940](https://github.com/multiformats/js-multiaddr/commit/19a3940))



<a name="7.0.0"></a>
# [7.0.0](https://github.com/multiformats/js-multiaddr/compare/v6.1.0...v7.0.0) (2019-09-03)


### Bug Fixes

* make getPeerId resolve the last id ([#95](https://github.com/multiformats/js-multiaddr/issues/95)) ([c32071d](https://github.com/multiformats/js-multiaddr/commit/c32071d))
* return ports as ints not strings ([#87](https://github.com/multiformats/js-multiaddr/issues/87)) ([2a170c3](https://github.com/multiformats/js-multiaddr/commit/2a170c3))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/multiformats/js-multiaddr/compare/v6.0.6...v6.1.0) (2019-06-05)


### Features

* add onion and onion3 support ([#89](https://github.com/multiformats/js-multiaddr/issues/89)) ([b606df3](https://github.com/multiformats/js-multiaddr/commit/b606df3))



<a name="6.0.6"></a>
## [6.0.6](https://github.com/multiformats/js-multiaddr/compare/v6.0.5...v6.0.6) (2019-03-04)


### Bug Fixes

* json round trip works as expected ([#85](https://github.com/multiformats/js-multiaddr/issues/85)) ([1977874](https://github.com/multiformats/js-multiaddr/commit/1977874))



<a name="6.0.5"></a>
## [6.0.5](https://github.com/multiformats/js-multiaddr/compare/v6.0.4...v6.0.5) (2019-02-25)


### Features

* add unix protocol support and update protocol table ([#84](https://github.com/multiformats/js-multiaddr/issues/84)) ([d4d3d9b](https://github.com/multiformats/js-multiaddr/commit/d4d3d9b))



<a name="6.0.4"></a>
## [6.0.4](https://github.com/multiformats/js-multiaddr/compare/v6.0.3...v6.0.4) (2019-01-25)


### Features

* add /p2p-stardust ([#78](https://github.com/multiformats/js-multiaddr/issues/78)) ([54e6837](https://github.com/multiformats/js-multiaddr/commit/54e6837)), closes [libp2p/js-libp2p-websocket-star#70](https://github.com/libp2p/js-libp2p-websocket-star/issues/70)



<a name="6.0.3"></a>
## [6.0.3](https://github.com/multiformats/js-multiaddr/compare/v6.0.2...v6.0.3) (2019-01-08)


### Bug Fixes

* clean up repo and bundle size reduction ([136315a](https://github.com/multiformats/js-multiaddr/commit/136315a))
* increase bundle size limit ([b7fc015](https://github.com/multiformats/js-multiaddr/commit/b7fc015))
* remove unused deps ([3d8cb42](https://github.com/multiformats/js-multiaddr/commit/3d8cb42))
* update max bundle size ([116f227](https://github.com/multiformats/js-multiaddr/commit/116f227))



<a name="6.0.2"></a>
## [6.0.2](https://github.com/multiformats/js-multiaddr/compare/v6.0.1...v6.0.2) (2018-12-17)


### Bug Fixes

* make ipfs the default 421 proto name ([#77](https://github.com/multiformats/js-multiaddr/issues/77)) ([bab6edb](https://github.com/multiformats/js-multiaddr/commit/bab6edb))



<a name="6.0.1"></a>
## [6.0.1](https://github.com/multiformats/js-multiaddr/compare/v6.0.0...v6.0.1) (2018-12-17)


### Features

* add p2p protocol support ([#76](https://github.com/multiformats/js-multiaddr/issues/76)) ([9c0139e](https://github.com/multiformats/js-multiaddr/commit/9c0139e))



<a name="6.0.0"></a>
# [6.0.0](https://github.com/multiformats/js-multiaddr/compare/v5.0.0...v6.0.0) (2018-11-28)


### Bug Fixes

* change UDP code ([e8c3d7d](https://github.com/multiformats/js-multiaddr/commit/e8c3d7d)), closes [#17](https://github.com/multiformats/js-multiaddr/issues/17)


### Features

* add support for quic addresses ([9238d0d](https://github.com/multiformats/js-multiaddr/commit/9238d0d))


### BREAKING CHANGES

* The UDP code was changed in the multicodec table

The UDP code is now `273` instead of `17`. For the full discussion of this change
please see https://github.com/multiformats/multicodec/pull/16.



<a name="5.0.2"></a>
## [5.0.2](https://github.com/multiformats/js-multiaddr/compare/v5.0.1...v5.0.2) (2018-11-05)



<a name="5.0.1"></a>
## [5.0.1](https://github.com/multiformats/js-multiaddr/compare/v5.0.0...v5.0.1) (2018-11-05)


### Features

* add support for quic addresses ([9238d0d](https://github.com/multiformats/js-multiaddr/commit/9238d0d))



<a name="5.0.0"></a>
# [5.0.0](https://github.com/multiformats/js-multiaddr/compare/v4.0.0...v5.0.0) (2018-04-24)


### Features

* Add support for multiaddr node with dns ([5d6b93a](https://github.com/multiformats/js-multiaddr/commit/5d6b93a))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/multiformats/js-multiaddr/compare/v3.2.0...v4.0.0) (2018-04-05)



<a name="3.2.0"></a>
# [3.2.0](https://github.com/multiformats/js-multiaddr/compare/v3.1.0...v3.2.0) (2018-04-05)


### Features

* add ip validations to ip addr formats ([#60](https://github.com/multiformats/js-multiaddr/issues/60)) ([70c138b](https://github.com/multiformats/js-multiaddr/commit/70c138b))
* use class-is module for type checks ([b097af9](https://github.com/multiformats/js-multiaddr/commit/b097af9))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/multiformats/js-multiaddr/compare/v3.0.2...v3.1.0) (2018-03-23)


### Bug Fixes

* avoid constructor.name pattern ([e386738](https://github.com/multiformats/js-multiaddr/commit/e386738))
* use consistent /dnsaddr code ([#59](https://github.com/multiformats/js-multiaddr/issues/59)) ([67fef56](https://github.com/multiformats/js-multiaddr/commit/67fef56))



<a name="3.0.2"></a>
## [3.0.2](https://github.com/multiformats/js-multiaddr/compare/v3.0.1...v3.0.2) (2018-01-07)


### Features

* rename /dns to /dnsaddr to conform with go implementation ([#50](https://github.com/multiformats/js-multiaddr/issues/50)) ([99a1aa4](https://github.com/multiformats/js-multiaddr/commit/99a1aa4))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/multiformats/js-multiaddr/compare/v3.0.0...v3.0.1) (2017-09-05)


### Bug Fixes

* Remove (s) in p2p-websockets-star ([#46](https://github.com/multiformats/js-multiaddr/issues/46)) ([b6a613e](https://github.com/multiformats/js-multiaddr/commit/b6a613e))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/multiformats/js-multiaddr/compare/v2.3.0...v3.0.0) (2017-09-03)


### Features

* fix p2p addrs  ([28d8ce5](https://github.com/multiformats/js-multiaddr/commit/28d8ce5))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/multiformats/js-multiaddr/compare/v2.2.3...v2.3.0) (2017-03-28)


### Features

* don't throw on invalid b58 string in getPeerId ([#43](https://github.com/multiformats/js-multiaddr/issues/43)) ([ec23f14](https://github.com/multiformats/js-multiaddr/commit/ec23f14))



<a name="2.2.3"></a>
## [2.2.3](https://github.com/multiformats/js-multiaddr/compare/v2.2.2...v2.2.3) (2017-03-27)



<a name="2.2.2"></a>
## [2.2.2](https://github.com/multiformats/js-multiaddr/compare/v2.2.1...v2.2.2) (2017-03-16)



<a name="2.2.1"></a>
## [2.2.1](https://github.com/multiformats/js-multiaddr/compare/v2.2.0...v2.2.1) (2017-02-09)



<a name="2.2.0"></a>
# [2.2.0](https://github.com/multiformats/js-multiaddr/compare/v2.1.3...v2.2.0) (2017-01-22)



<a name="2.1.3"></a>
## [2.1.3](https://github.com/multiformats/js-multiaddr/compare/v2.1.1...v2.1.3) (2017-01-16)


### Features

* add webrtc-direct multiaddr ([#36](https://github.com/multiformats/js-multiaddr/issues/36)) ([fb0e667](https://github.com/multiformats/js-multiaddr/commit/fb0e667))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/multiformats/js-multiaddr/compare/v2.1.0...v2.1.1) (2016-11-17)



<a name="2.1.0"></a>
# [2.1.0](https://github.com/multiformats/js-multiaddr/compare/v2.0.3...v2.1.0) (2016-11-17)



<a name="2.0.3"></a>
## [2.0.3](https://github.com/multiformats/js-multiaddr/compare/v2.0.2...v2.0.3) (2016-09-07)


### Features

* add isMultiaddr method ([2aa7abb](https://github.com/multiformats/js-multiaddr/commit/2aa7abb))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/multiformats/js-multiaddr/compare/v2.0.1...v2.0.2) (2016-05-21)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/multiformats/js-multiaddr/compare/v2.0.0...v2.0.1) (2016-05-21)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/multiformats/js-multiaddr/compare/v1.4.1...v2.0.0) (2016-05-17)



<a name="1.4.1"></a>
## [1.4.1](https://github.com/multiformats/js-multiaddr/compare/v1.4.0...v1.4.1) (2016-04-20)


### Bug Fixes

* handle variable sized protocols in protoCodes ([1bce576](https://github.com/multiformats/js-multiaddr/commit/1bce576))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/multiformats/js-multiaddr/compare/v1.3.1...v1.4.0) (2016-04-19)


### Features

* Add support for ipfs addresses. ([0f39678](https://github.com/multiformats/js-multiaddr/commit/0f39678)), closes [#15](https://github.com/multiformats/js-multiaddr/issues/15)



<a name="1.3.1"></a>
## [1.3.1](https://github.com/multiformats/js-multiaddr/compare/v1.3.0...v1.3.1) (2016-04-18)



<a name="1.3.0"></a>
# [1.3.0](https://github.com/multiformats/js-multiaddr/compare/v1.2.0...v1.3.0) (2016-03-12)



<a name="1.2.0"></a>
# [1.2.0](https://github.com/multiformats/js-multiaddr/compare/v1.1.3...v1.2.0) (2016-03-12)



<a name="1.1.3"></a>
## [1.1.3](https://github.com/multiformats/js-multiaddr/compare/v1.1.2...v1.1.3) (2016-03-11)



<a name="1.1.2"></a>
## [1.1.2](https://github.com/multiformats/js-multiaddr/compare/v1.1.1...v1.1.2) (2016-03-11)



<a name="1.1.1"></a>
## [1.1.1](https://github.com/multiformats/js-multiaddr/compare/v1.1.0...v1.1.1) (2015-11-06)



<a name="1.1.0"></a>
# 1.1.0 (2015-11-06)



