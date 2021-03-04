## [0.8.3](https://github.com/libp2p/js-interfaces/compare/v0.8.2...v0.8.3) (2021-01-26)



## [0.8.2](https://github.com/libp2p/js-interfaces/compare/v0.8.1...v0.8.2) (2021-01-20)


### Bug Fixes

* event emitter types with local types ([#80](https://github.com/libp2p/js-interfaces/issues/80)) ([ca52077](https://github.com/libp2p/js-interfaces/commit/ca520775eb26f5ed501375fdb24ba698c9a8c8c8))



## [0.8.1](https://github.com/libp2p/js-interfaces/compare/v0.8.0...v0.8.1) (2020-12-11)


### Bug Fixes

* pubsub publish message should be uint8array ([#77](https://github.com/libp2p/js-interfaces/issues/77)) ([5b99e6b](https://github.com/libp2p/js-interfaces/commit/5b99e6b56b10439a82ee88fb4e31fb95c182264f))



# [0.8.0](https://github.com/libp2p/js-interfaces/compare/v0.7.2...v0.8.0) (2020-12-10)


### Features

* add types ([#74](https://github.com/libp2p/js-interfaces/issues/74)) ([e2419ea](https://github.com/libp2p/js-interfaces/commit/e2419ea308b5db38966850ba6349602c93ce3b0e))



<a name="0.7.2"></a>
## [0.7.2](https://github.com/libp2p/js-interfaces/compare/v0.7.1...v0.7.2) (2020-11-11)



<a name="0.7.1"></a>
## [0.7.1](https://github.com/libp2p/js-interfaces/compare/v0.7.0...v0.7.1) (2020-11-03)


### Bug Fixes

* typescript types ([#69](https://github.com/libp2p/js-interfaces/issues/69)) ([269a6f5](https://github.com/libp2p/js-interfaces/commit/269a6f5))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/libp2p/js-interfaces/compare/v0.5.2...v0.7.0) (2020-11-03)


### Features

* pubsub: add global signature policy ([#66](https://github.com/libp2p/js-interfaces/issues/66)) ([946b046](https://github.com/libp2p/js-interfaces/commit/946b046))
* update pubsub getMsgId return type to Uint8Array ([#65](https://github.com/libp2p/js-interfaces/issues/65)) ([e148443](https://github.com/libp2p/js-interfaces/commit/e148443))


### BREAKING CHANGES

* `signMessages` and `strictSigning` pubsub configuration options replaced
with a `globalSignaturePolicy` option
* new getMsgId return type is not backwards compatible with prior `string`
return type.



<a name="0.6.0"></a>
# [0.6.0](https://github.com/libp2p/js-interfaces/compare/v0.5.2...v0.6.0) (2020-10-05)


### Features

* update pubsub getMsgId return type to Uint8Array ([#65](https://github.com/libp2p/js-interfaces/issues/65)) ([e148443](https://github.com/libp2p/js-interfaces/commit/e148443))


### BREAKING CHANGES

* new getMsgId return type is not backwards compatible with prior `string`
return type.



<a name="0.5.2"></a>
## [0.5.2](https://github.com/libp2p/js-interfaces/compare/v0.3.1...v0.5.2) (2020-09-30)


### Bug Fixes

* replace remaining Buffer usage with Uint8Array ([#62](https://github.com/libp2p/js-interfaces/issues/62)) ([4130e7f](https://github.com/libp2p/js-interfaces/commit/4130e7f))


### Chores

* update deps ([#57](https://github.com/libp2p/js-interfaces/issues/57)) ([75f6777](https://github.com/libp2p/js-interfaces/commit/75f6777))


### Features

* interface pubsub ([#60](https://github.com/libp2p/js-interfaces/issues/60)) ([ba15a48](https://github.com/libp2p/js-interfaces/commit/ba15a48))
* record interface ([#52](https://github.com/libp2p/js-interfaces/issues/52)) ([1cc943e](https://github.com/libp2p/js-interfaces/commit/1cc943e))


### BREAKING CHANGES

* records now marshal as Uint8Array instead of Buffer

* fix: refactor remaining Buffer usage to Uint8Array
* - The peer id dep of this module has replaced node Buffers with Uint8Arrays

* chore: update gh deps



<a name="0.5.1"></a>
## [0.5.1](https://github.com/libp2p/js-interfaces/compare/v0.5.0...v0.5.1) (2020-08-25)


### Features

* interface pubsub ([#60](https://github.com/libp2p/js-interfaces/issues/60)) ([ba15a48](https://github.com/libp2p/js-interfaces/commit/ba15a48))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/libp2p/js-interfaces/compare/v0.4.1...v0.5.0) (2020-08-24)


### Bug Fixes

* replace remaining Buffer usage with Uint8Array ([#62](https://github.com/libp2p/js-interfaces/issues/62)) ([4130e7f](https://github.com/libp2p/js-interfaces/commit/4130e7f))


### BREAKING CHANGES

* records now marshal as Uint8Array instead of Buffer

* fix: refactor remaining Buffer usage to Uint8Array



<a name="0.4.1"></a>
## [0.4.1](https://github.com/libp2p/js-interfaces/compare/v0.4.0...v0.4.1) (2020-08-11)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/libp2p/js-interfaces/compare/v0.3.2...v0.4.0) (2020-08-10)


### Chores

* update deps ([#57](https://github.com/libp2p/js-interfaces/issues/57)) ([75f6777](https://github.com/libp2p/js-interfaces/commit/75f6777))


### BREAKING CHANGES

* - The peer id dep of this module has replaced node Buffers with Uint8Arrays

* chore: update gh deps



<a name="0.3.2"></a>
## [0.3.2](https://github.com/libp2p/js-interfaces/compare/v0.3.1...v0.3.2) (2020-07-15)


### Features

* record interface ([#52](https://github.com/libp2p/js-interfaces/issues/52)) ([1cc943e](https://github.com/libp2p/js-interfaces/commit/1cc943e))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/libp2p/js-interfaces/compare/v0.2.8...v0.3.1) (2020-07-03)


### Bug Fixes

* content and peer routing multiaddrs property ([#49](https://github.com/libp2p/js-interfaces/issues/49)) ([9fbf9d0](https://github.com/libp2p/js-interfaces/commit/9fbf9d0))
* peer-routing typo ([#47](https://github.com/libp2p/js-interfaces/issues/47)) ([9a8f375](https://github.com/libp2p/js-interfaces/commit/9a8f375))
* reconnect should trigger topology on connect if protocol stored ([#54](https://github.com/libp2p/js-interfaces/issues/54)) ([e10a154](https://github.com/libp2p/js-interfaces/commit/e10a154))


### Chores

* remove peer-info usage on topology ([#42](https://github.com/libp2p/js-interfaces/issues/42)) ([a55c7c4](https://github.com/libp2p/js-interfaces/commit/a55c7c4))
* update content and peer routing interfaces removing peer-info ([#43](https://github.com/libp2p/js-interfaces/issues/43)) ([87e2e89](https://github.com/libp2p/js-interfaces/commit/87e2e89))


### Features

* peer-discovery not using peer-info ([bdd2502](https://github.com/libp2p/js-interfaces/commit/bdd2502))


### BREAKING CHANGES

* topology api now uses peer-id instead of peer-info
* content-routing and peer-routing APIs return an object with relevant properties instead of peer-info
* peer-discovery emits object with id and multiaddrs properties



<a name="0.3.0"></a>
# [0.3.0](https://github.com/libp2p/js-interfaces/compare/v0.2.8...v0.3.0) (2020-04-21)


### Chores

* remove peer-info usage on topology ([#42](https://github.com/libp2p/js-interfaces/issues/42)) ([79a7843](https://github.com/libp2p/js-interfaces/commit/79a7843))
* update content and peer routing interfaces removing peer-info ([#43](https://github.com/libp2p/js-interfaces/issues/43)) ([d2032e6](https://github.com/libp2p/js-interfaces/commit/d2032e6))


### Features

* peer-discovery not using peer-info ([5792b13](https://github.com/libp2p/js-interfaces/commit/5792b13))


### BREAKING CHANGES

* topology api now uses peer-id instead of peer-info
* content-routing and peer-routing APIs return an object with relevant properties instead of peer-info
* peer-discovery emits object with id and multiaddrs properties



<a name="0.2.8"></a>
## [0.2.8](https://github.com/libp2p/js-interfaces/compare/v0.2.7...v0.2.8) (2020-04-21)



<a name="0.2.7"></a>
## [0.2.7](https://github.com/libp2p/js-interfaces/compare/v0.2.6...v0.2.7) (2020-03-20)


### Bug Fixes

* add buffer ([#39](https://github.com/libp2p/js-interfaces/issues/39)) ([78e015c](https://github.com/libp2p/js-interfaces/commit/78e015c))



<a name="0.2.6"></a>
## [0.2.6](https://github.com/libp2p/js-interfaces/compare/v0.2.5...v0.2.6) (2020-02-17)


### Bug Fixes

* remove use of assert module ([#34](https://github.com/libp2p/js-interfaces/issues/34)) ([c77d8de](https://github.com/libp2p/js-interfaces/commit/c77d8de))



<a name="0.2.5"></a>
## [0.2.5](https://github.com/libp2p/js-interfaces/compare/v0.2.4...v0.2.5) (2020-02-04)


### Bug Fixes

* **connection:** tracks streams properly ([#25](https://github.com/libp2p/js-interfaces/issues/25)) ([5c88d77](https://github.com/libp2p/js-interfaces/commit/5c88d77))



<a name="0.2.4"></a>
## [0.2.4](https://github.com/libp2p/js-interfaces/compare/v0.2.3...v0.2.4) (2020-02-04)


### Bug Fixes

* dependencies for tests should not be needed by who requires the tests ([#18](https://github.com/libp2p/js-interfaces/issues/18)) ([c5b724a](https://github.com/libp2p/js-interfaces/commit/c5b724a))



<a name="0.2.3"></a>
## [0.2.3](https://github.com/libp2p/js-interfaces/compare/v0.2.2...v0.2.3) (2020-01-21)


### Bug Fixes

* **transport:** make close listener test more resilient ([#21](https://github.com/libp2p/js-interfaces/issues/21)) ([2de533e](https://github.com/libp2p/js-interfaces/commit/2de533e))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/libp2p/js-interfaces/compare/v0.2.1...v0.2.2) (2020-01-17)


### Bug Fixes

* **connection:** dont require remoteAddr on creation ([#20](https://github.com/libp2p/js-interfaces/issues/20)) ([5967834](https://github.com/libp2p/js-interfaces/commit/5967834))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/libp2p/js-interfaces/compare/v0.2.0...v0.2.1) (2019-12-28)


### Features

* add crypto transmission error ([#17](https://github.com/libp2p/js-interfaces/issues/17)) ([d98bb23](https://github.com/libp2p/js-interfaces/commit/d98bb23))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/libp2p/js-interfaces/compare/v0.1.7...v0.2.0) (2019-12-20)


### Bug Fixes

* transport should not handle connection if upgradeInbound throws ([#16](https://github.com/libp2p/js-interfaces/issues/16)) ([ff03137](https://github.com/libp2p/js-interfaces/commit/ff03137))



<a name="0.1.7"></a>
## [0.1.7](https://github.com/libp2p/js-interfaces/compare/v0.1.6...v0.1.7) (2019-12-15)


### Features

* export connection status' ([#15](https://github.com/libp2p/js-interfaces/issues/15)) ([bdbd58e](https://github.com/libp2p/js-interfaces/commit/bdbd58e))



<a name="0.1.6"></a>
## [0.1.6](https://github.com/libp2p/js-interfaces/compare/v0.1.5...v0.1.6) (2019-12-02)


### Bug Fixes

* multicodec topology disconnect with peer param ([#12](https://github.com/libp2p/js-interfaces/issues/12)) ([d5dd256](https://github.com/libp2p/js-interfaces/commit/d5dd256))



<a name="0.1.5"></a>
## [0.1.5](https://github.com/libp2p/js-interfaces/compare/v0.1.4...v0.1.5) (2019-11-15)


### Bug Fixes

* multicodec topology update peers with multicodec ([#10](https://github.com/libp2p/js-interfaces/issues/10)) ([21d8ae6](https://github.com/libp2p/js-interfaces/commit/21d8ae6))


### Features

* add class-is to topology ([#11](https://github.com/libp2p/js-interfaces/issues/11)) ([a67abcc](https://github.com/libp2p/js-interfaces/commit/a67abcc))



<a name="0.1.4"></a>
## [0.1.4](https://github.com/libp2p/js-interfaces/compare/v0.1.3...v0.1.4) (2019-11-14)


### Features

* add topology interfaces ([#7](https://github.com/libp2p/js-interfaces/issues/7)) ([8bee747](https://github.com/libp2p/js-interfaces/commit/8bee747))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/libp2p/js-interfaces/compare/v0.1.2...v0.1.3) (2019-10-30)


### Bug Fixes

* localAddr should be optional ([#6](https://github.com/libp2p/js-interfaces/issues/6)) ([749a8d0](https://github.com/libp2p/js-interfaces/commit/749a8d0))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/libp2p/js-interfaces/compare/v0.1.1...v0.1.2) (2019-10-29)


### Features

* crypto errors ([#4](https://github.com/libp2p/js-interfaces/issues/4)) ([d2fe2d1](https://github.com/libp2p/js-interfaces/commit/d2fe2d1))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/libp2p/js-interfaces/compare/v0.1.0...v0.1.1) (2019-10-21)


### Features

* crypto interface ([#2](https://github.com/libp2p/js-interfaces/issues/2)) ([5a5c44a](https://github.com/libp2p/js-interfaces/commit/5a5c44a))



<a name="0.1.0"></a>
# 0.1.0 (2019-10-20)


### Bug Fixes

* add async support to setup ([#11](https://github.com/libp2p/js-interfaces/issues/11)) ([2814c76](https://github.com/libp2p/js-interfaces/commit/2814c76))
* **test:** close with timeout ([#54](https://github.com/libp2p/js-interfaces/issues/54)) ([583f02d](https://github.com/libp2p/js-interfaces/commit/583f02d))
* avoid making webpacky funky by not trying to inject tcp ([6695b80](https://github.com/libp2p/js-interfaces/commit/6695b80))
* improve the close test ([d9c8681](https://github.com/libp2p/js-interfaces/commit/d9c8681))
* move dirty-chai to dependencies ([#52](https://github.com/libp2p/js-interfaces/issues/52)) ([f9a7908](https://github.com/libp2p/js-interfaces/commit/f9a7908))
* some fixes for incorrect tests ([23a75d1](https://github.com/libp2p/js-interfaces/commit/23a75d1))
* when things are in the same process, there is a order to them :) ([1635977](https://github.com/libp2p/js-interfaces/commit/1635977))
* wrong main path in package.json ([54b83a7](https://github.com/libp2p/js-interfaces/commit/54b83a7))
* **deps:** fix package.json ([e0f7db3](https://github.com/libp2p/js-interfaces/commit/e0f7db3))
* **dial-test:** ensure goodbye works over tcp ([e1346da](https://github.com/libp2p/js-interfaces/commit/e1346da))
* **package.json:** point to right main ([ace6150](https://github.com/libp2p/js-interfaces/commit/ace6150))
* **package.json:** point to right main ([84cd2ca](https://github.com/libp2p/js-interfaces/commit/84cd2ca))
* **tests:** add place holder test script for releases ([8e9f7cf](https://github.com/libp2p/js-interfaces/commit/8e9f7cf))


### Code Refactoring

* API changes and switch to async await ([#55](https://github.com/libp2p/js-interfaces/issues/55)) ([dd837ba](https://github.com/libp2p/js-interfaces/commit/dd837ba))
* API changes and switch to async iterators ([#29](https://github.com/libp2p/js-interfaces/issues/29)) ([bf5c646](https://github.com/libp2p/js-interfaces/commit/bf5c646))


### Features

* add onStreamEnd, muxer.streams and timeline ([#56](https://github.com/libp2p/js-interfaces/issues/56)) ([0f60832](https://github.com/libp2p/js-interfaces/commit/0f60832))
* add support for timeline proxying ([#31](https://github.com/libp2p/js-interfaces/issues/31)) ([541bf83](https://github.com/libp2p/js-interfaces/commit/541bf83))
* add type to AbortError ([#45](https://github.com/libp2p/js-interfaces/issues/45)) ([4fd37bb](https://github.com/libp2p/js-interfaces/commit/4fd37bb))
* add upgrader support to transports ([#53](https://github.com/libp2p/js-interfaces/issues/53)) ([a5ad120](https://github.com/libp2p/js-interfaces/commit/a5ad120))
* async crypto + sauce labs + aegir 9 ([b40114c](https://github.com/libp2p/js-interfaces/commit/b40114c))
* callbacks -> async / await ([#44](https://github.com/libp2p/js-interfaces/issues/44)) ([b30ee5f](https://github.com/libp2p/js-interfaces/commit/b30ee5f))
* initial commit ([584a69b](https://github.com/libp2p/js-interfaces/commit/584a69b))
* make listen take an array of addrs ([#46](https://github.com/libp2p/js-interfaces/issues/46)) ([1dc5baa](https://github.com/libp2p/js-interfaces/commit/1dc5baa))
* move to next aegir ([11980ac](https://github.com/libp2p/js-interfaces/commit/11980ac))
* timeline and close checking ([#55](https://github.com/libp2p/js-interfaces/issues/55)) ([993ca1c](https://github.com/libp2p/js-interfaces/commit/993ca1c))
* **api:** update the interface usage from dial to dialer and listen to listener ([5069679](https://github.com/libp2p/js-interfaces/commit/5069679))
* **connection:** migrate to pull-streams ([ed5727a](https://github.com/libp2p/js-interfaces/commit/ed5727a))
* **dialer:** remove conn from on connect callback ([1bd20d9](https://github.com/libp2p/js-interfaces/commit/1bd20d9))
* **pull:** migration to pull streams. Upgrade tests to use mocha as ([cc3130f](https://github.com/libp2p/js-interfaces/commit/cc3130f))
* **spec:** update the dial interface to cope with new pull additions ([2e12166](https://github.com/libp2p/js-interfaces/commit/2e12166))
* **tests:** add closing tests, make sure errors are propagated ([c06da3b](https://github.com/libp2p/js-interfaces/commit/c06da3b))
* **tests:** add dial and listen tests ([d50224d](https://github.com/libp2p/js-interfaces/commit/d50224d))
* **tests:** stub test for aegir to verify ([949faf0](https://github.com/libp2p/js-interfaces/commit/949faf0))


### Reverts

* "feat: make listen take an array of addrs ([#46](https://github.com/libp2p/js-interfaces/issues/46))" ([#51](https://github.com/libp2p/js-interfaces/issues/51)) ([030195e](https://github.com/libp2p/js-interfaces/commit/030195e))


### BREAKING CHANGES

* all the callbacks in the provided API were removed and each function uses async/await. Additionally, pull-streams are no longer being used. See the README for new usage.
* This adds new validations to the stream muxer, which will cause existing tests to fail.
* the API is now async / await. See https://github.com/libp2p/interface-stream-muxer/pull/55#issue-275014779 for a summary of the changes.
* Transports must now be passed and use an `Upgrader` instance. See the Readme for usage. Compliance test suites will now need to pass `options` from `common.setup(options)` to their Transport constructor.

* docs: update readme to include upgrader

* docs: update readme to include MultiaddrConnection ref

* feat: add upgrader spy to test suite

* test: validate returned value of spy
* All places in the API that used callbacks are now replaced with async/await

* test: add tests for canceling dials

* feat: Adapter class



