## [0.21.2](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.21.1...v0.21.2) (2021-02-24)



## [0.21.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.21.0...v0.21.1) (2021-02-10)


### Bug Fixes

* add error event listener to event emitter ([#303](https://github.com/libp2p/js-libp2p-webrtc-star/issues/303)) ([aa770af](https://github.com/libp2p/js-libp2p-webrtc-star/commit/aa770af369cc215b7981befdbb49f7fee1368f77))



# [0.21.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.20.8...v0.21.0) (2021-01-25)



## [0.20.8](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.20.7...v0.20.8) (2021-01-25)


### Reverts

* Revert "chore: update socket.io to 3 (#292)" ([3c3cd94](https://github.com/libp2p/js-libp2p-webrtc-star/commit/3c3cd94f0e398b1d4f9f6f7a64585fb2066511da)), closes [#292](https://github.com/libp2p/js-libp2p-webrtc-star/issues/292)



## [0.20.7](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.20.6...v0.20.7) (2021-01-25)



## [0.20.6](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.20.5...v0.20.6) (2020-12-29)



## [0.20.5](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.20.4...v0.20.5) (2020-12-14)


### Reverts

* Revert "chore: update socket io (#285)" ([849fa43](https://github.com/libp2p/js-libp2p-webrtc-star/commit/849fa43f5c5f4f33f76192001b00b9b337e5a225)), closes [#285](https://github.com/libp2p/js-libp2p-webrtc-star/issues/285)



## [0.20.4](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.20.3...v0.20.4) (2020-12-10)



## [0.20.3](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.20.2...v0.20.3) (2020-12-09)


### Features

* support webrtc trickle ([#282](https://github.com/libp2p/js-libp2p-webrtc-star/issues/282)) ([d2a2478](https://github.com/libp2p/js-libp2p-webrtc-star/commit/d2a24783c9c3d1c800a6319494fd69926b98a79b))



## [0.20.2](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.20.1...v0.20.2) (2020-12-03)



<a name="0.20.1"></a>
## [0.20.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.20.0...v0.20.1) (2020-09-11)


### Bug Fixes

* do not assign read-only error.message ([b84dd66](https://github.com/libp2p/js-libp2p-webrtc-star/commit/b84dd66))



<a name="0.20.0"></a>
# [0.20.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.19.0...v0.20.0) (2020-08-25)


### Chores

* update deps ([#255](https://github.com/libp2p/js-libp2p-webrtc-star/issues/255)) ([bf6fcb0](https://github.com/libp2p/js-libp2p-webrtc-star/commit/bf6fcb0))


### BREAKING CHANGES

* - Hapi has dropped support for node < 12



<a name="0.19.0"></a>
# [0.19.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.18.6...v0.19.0) (2020-08-12)


### Bug Fixes

* replace node buffers with uint8arrays ([#244](https://github.com/libp2p/js-libp2p-webrtc-star/issues/244)) ([68805b0](https://github.com/libp2p/js-libp2p-webrtc-star/commit/68805b0))
* use relaxed webrtc check ([#249](https://github.com/libp2p/js-libp2p-webrtc-star/issues/249)) ([306b453](https://github.com/libp2p/js-libp2p-webrtc-star/commit/306b453))


### BREAKING CHANGES

* - All deps used by this module now use Uint8Arrays in place of node Buffers

* chore: skip know test issues with aegir

* fix: use simple-peer fork branch

* chore: update libp2p-webrtc-peer

Co-authored-by: Jacob Heun <jacobheun@gmail.com>



<a name="0.18.6"></a>
## [0.18.6](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.18.5...v0.18.6) (2020-06-25)


### Bug Fixes

* use simple-peer fork that does not throw when setting error codes ([#231](https://github.com/libp2p/js-libp2p-webrtc-star/issues/231)) ([5795435](https://github.com/libp2p/js-libp2p-webrtc-star/commit/5795435))



<a name="0.18.5"></a>
## [0.18.5](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.18.4...v0.18.5) (2020-06-18)



<a name="0.18.4"></a>
## [0.18.4](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.18.3...v0.18.4) (2020-06-11)


### Bug Fixes

* add error handler for incoming connections ([#224](https://github.com/libp2p/js-libp2p-webrtc-star/issues/224)) ([dc9bfa6](https://github.com/libp2p/js-libp2p-webrtc-star/commit/dc9bfa6))
* do not signal if channel destroyed ([#226](https://github.com/libp2p/js-libp2p-webrtc-star/issues/226)) ([74e9059](https://github.com/libp2p/js-libp2p-webrtc-star/commit/74e9059))



<a name="0.18.3"></a>
## [0.18.3](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.18.2...v0.18.3) (2020-05-06)



<a name="0.18.2"></a>
## [0.18.2](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.18.1...v0.18.2) (2020-05-06)



<a name="0.18.1"></a>
## [0.18.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.18.0...v0.18.1) (2020-04-29)


### Bug Fixes

* add buffer ([#217](https://github.com/libp2p/js-libp2p-webrtc-star/issues/217)) ([0eb097e](https://github.com/libp2p/js-libp2p-webrtc-star/commit/0eb097e))



<a name="0.18.0"></a>
# [0.18.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.17.9...v0.18.0) (2020-04-21)


### Chores

* peer-discovery not using peer-info ([#213](https://github.com/libp2p/js-libp2p-webrtc-star/issues/213)) ([ab4aafe](https://github.com/libp2p/js-libp2p-webrtc-star/commit/ab4aafe))


### BREAKING CHANGES

* peer event emits with id and multiaddrs properties instead of peer-info



<a name="0.17.9"></a>
## [0.17.9](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.17.8...v0.17.9) (2020-04-02)


### Bug Fixes

* check for mdns hostname ips ([#212](https://github.com/libp2p/js-libp2p-webrtc-star/issues/212)) ([ce77e37](https://github.com/libp2p/js-libp2p-webrtc-star/commit/ce77e37))


### Features

* support dash case parameters ([#211](https://github.com/libp2p/js-libp2p-webrtc-star/issues/211)) ([08282dd](https://github.com/libp2p/js-libp2p-webrtc-star/commit/08282dd))



<a name="0.17.8"></a>
## [0.17.8](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.17.7...v0.17.8) (2020-03-16)


### Features

* create dockerfile for docker hub integration ([#209](https://github.com/libp2p/js-libp2p-webrtc-star/issues/209)) ([ac1eb8a](https://github.com/libp2p/js-libp2p-webrtc-star/commit/ac1eb8a))



<a name="0.17.7"></a>
## [0.17.7](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.17.6...v0.17.7) (2020-02-13)


### Bug Fixes

* remove use of assert module ([#202](https://github.com/libp2p/js-libp2p-webrtc-star/issues/202)) ([7563f1f](https://github.com/libp2p/js-libp2p-webrtc-star/commit/7563f1f))



<a name="0.17.6"></a>
## [0.17.6](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.17.1...v0.17.6) (2020-02-03)


### Bug Fixes

* dont transform listening addrs ([#195](https://github.com/libp2p/js-libp2p-webrtc-star/issues/195)) ([0e1406b](https://github.com/libp2p/js-libp2p-webrtc-star/commit/0e1406b)), closes [#194](https://github.com/libp2p/js-libp2p-webrtc-star/issues/194)
* ensure dial is rejected with an Error ([#199](https://github.com/libp2p/js-libp2p-webrtc-star/issues/199)) ([41f278e](https://github.com/libp2p/js-libp2p-webrtc-star/commit/41f278e))
* ensure remoteAddr is always set on inbound conns ([#193](https://github.com/libp2p/js-libp2p-webrtc-star/issues/193)) ([01e5453](https://github.com/libp2p/js-libp2p-webrtc-star/commit/01e5453))
* signaling vs listening addrs ([#198](https://github.com/libp2p/js-libp2p-webrtc-star/issues/198)) ([91f6a63](https://github.com/libp2p/js-libp2p-webrtc-star/commit/91f6a63))
* use menoetius to handle metrics ([#197](https://github.com/libp2p/js-libp2p-webrtc-star/issues/197)) ([14086b9](https://github.com/libp2p/js-libp2p-webrtc-star/commit/14086b9))
* use p2p codec name ([#196](https://github.com/libp2p/js-libp2p-webrtc-star/issues/196)) ([638d3da](https://github.com/libp2p/js-libp2p-webrtc-star/commit/638d3da))


### Features

* improve listening address usage ([#194](https://github.com/libp2p/js-libp2p-webrtc-star/issues/194)) ([e45760a](https://github.com/libp2p/js-libp2p-webrtc-star/commit/e45760a))



<a name="0.17.5"></a>
## [0.17.5](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.17.4...v0.17.5) (2020-01-31)


### Bug Fixes

* signaling vs listening addrs ([#198](https://github.com/libp2p/js-libp2p-webrtc-star/issues/198)) ([91f6a63](https://github.com/libp2p/js-libp2p-webrtc-star/commit/91f6a63))
* use menoetius to handle metrics ([#197](https://github.com/libp2p/js-libp2p-webrtc-star/issues/197)) ([14086b9](https://github.com/libp2p/js-libp2p-webrtc-star/commit/14086b9))
* use p2p codec name ([#196](https://github.com/libp2p/js-libp2p-webrtc-star/issues/196)) ([638d3da](https://github.com/libp2p/js-libp2p-webrtc-star/commit/638d3da))



<a name="0.17.4"></a>
## [0.17.4](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.17.3...v0.17.4) (2020-01-31)


### Bug Fixes

* dont transform listening addrs ([#195](https://github.com/libp2p/js-libp2p-webrtc-star/issues/195)) ([0e1406b](https://github.com/libp2p/js-libp2p-webrtc-star/commit/0e1406b)), closes [#194](https://github.com/libp2p/js-libp2p-webrtc-star/issues/194)



<a name="0.17.3"></a>
## [0.17.3](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.17.2...v0.17.3) (2020-01-23)


### Features

* improve listening address usage ([#194](https://github.com/libp2p/js-libp2p-webrtc-star/issues/194)) ([e45760a](https://github.com/libp2p/js-libp2p-webrtc-star/commit/e45760a))



<a name="0.17.2"></a>
## [0.17.2](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.17.1...v0.17.2) (2020-01-21)


### Bug Fixes

* ensure remoteAddr is always set on inbound conns ([#193](https://github.com/libp2p/js-libp2p-webrtc-star/issues/193)) ([01e5453](https://github.com/libp2p/js-libp2p-webrtc-star/commit/01e5453))



<a name="0.17.1"></a>
## [0.17.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.17.0...v0.17.1) (2020-01-01)


### Bug Fixes

* transport should not handle connection if upgradeInbound throws ([#191](https://github.com/libp2p/js-libp2p-webrtc-star/issues/191)) ([865a2a7](https://github.com/libp2p/js-libp2p-webrtc-star/commit/865a2a7))



<a name="0.17.0"></a>
# [0.17.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.16.1...v0.17.0) (2019-10-02)


### Code Refactoring

* switch to async iterators ([#183](https://github.com/libp2p/js-libp2p-webrtc-star/issues/183)) ([db5c97e](https://github.com/libp2p/js-libp2p-webrtc-star/commit/db5c97e))


### BREAKING CHANGES

* Switch to using async/await and async iterators. The transport and connection interfaces have changed.



<a name="0.16.1"></a>
## [0.16.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.16.0...v0.16.1) (2019-05-12)


### Features

* start/stop discovery events when start/stop called ([#176](https://github.com/libp2p/js-libp2p-webrtc-star/issues/176)) ([f4dc087](https://github.com/libp2p/js-libp2p-webrtc-star/commit/f4dc087))



<a name="0.16.0"></a>
# [0.16.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.15.8...v0.16.0) (2019-05-08)


### Bug Fixes

* update hapi ([#173](https://github.com/libp2p/js-libp2p-webrtc-star/issues/173)) ([f7dc83a](https://github.com/libp2p/js-libp2p-webrtc-star/commit/f7dc83a))


### BREAKING CHANGES

* signaling server api with async await instead of callbacks



<a name="0.15.8"></a>
## [0.15.8](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.15.7...v0.15.8) (2019-01-10)


### Bug Fixes

* reduce bundle size ([#165](https://github.com/libp2p/js-libp2p-webrtc-star/issues/165)) ([cb96de8](https://github.com/libp2p/js-libp2p-webrtc-star/commit/cb96de8))



<a name="0.15.7"></a>
## [0.15.7](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.15.6...v0.15.7) (2019-01-04)


### Features

* only send new peers, not the whole peer list ([e12089b](https://github.com/libp2p/js-libp2p-webrtc-star/commit/e12089b))



<a name="0.15.6"></a>
## [0.15.6](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.15.3...v0.15.6) (2018-11-26)


### Bug Fixes

* catch RTCPeerConnection failed connections ([b65d509](https://github.com/libp2p/js-libp2p-webrtc-star/commit/b65d509))



<a name="0.15.5"></a>
## [0.15.5](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.15.4...v0.15.5) (2018-09-17)


### Bug Fixes

* catch RTCPeerConnection failed connections ([b65d509](https://github.com/libp2p/js-libp2p-webrtc-star/commit/b65d509))



<a name="0.15.4"></a>
## [0.15.4](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.15.3...v0.15.4) (2018-08-27)



<a name="0.15.3"></a>
## [0.15.3](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.15.2...v0.15.3) (2018-06-19)


### Features

* add tag ([03983f2](https://github.com/libp2p/js-libp2p-webrtc-star/commit/03983f2))



<a name="0.15.1"></a>
## [0.15.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.15.0...v0.15.1) (2018-06-01)



<a name="0.15.0"></a>
# [0.15.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.14.0...v0.15.0) (2018-05-12)



<a name="0.14.0"></a>
# [0.14.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.13.4...v0.14.0) (2018-04-06)


### Features

* add class-is module ([27f5865](https://github.com/libp2p/js-libp2p-webrtc-star/commit/27f5865))



<a name="0.13.4"></a>
## [0.13.4](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.13.3...v0.13.4) (2018-02-20)



<a name="0.13.3"></a>
## [0.13.3](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.13.2...v0.13.3) (2017-11-30)


### Bug Fixes

* /dns4 multiaddr explicit tcp/port support ([#130](https://github.com/libp2p/js-libp2p-webrtc-star/issues/130)) ([dce5ff8](https://github.com/libp2p/js-libp2p-webrtc-star/commit/dce5ff8))


### Features

* Add metrics and about page ([#127](https://github.com/libp2p/js-libp2p-webrtc-star/issues/127)) ([171dc9b](https://github.com/libp2p/js-libp2p-webrtc-star/commit/171dc9b))
* skip circuit addresses ([#121](https://github.com/libp2p/js-libp2p-webrtc-star/issues/121)) ([43f752b](https://github.com/libp2p/js-libp2p-webrtc-star/commit/43f752b))



<a name="0.13.2"></a>
## [0.13.2](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.13.1...v0.13.2) (2017-09-08)


### Bug Fixes

* stricter type checking to prevent crashes ([#120](https://github.com/libp2p/js-libp2p-webrtc-star/issues/120)) ([599bdeb](https://github.com/libp2p/js-libp2p-webrtc-star/commit/599bdeb))



<a name="0.13.1"></a>
## [0.13.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.13.0...v0.13.1) (2017-09-04)


### Bug Fixes

* now properly handles legacy libp2p-webrtc-multiaddrs ([#119](https://github.com/libp2p/js-libp2p-webrtc-star/issues/119)) ([06ba5d2](https://github.com/libp2p/js-libp2p-webrtc-star/commit/06ba5d2))



<a name="0.13.0"></a>
# [0.13.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.12.0...v0.13.0) (2017-09-03)


### Features

* p2p addrs situation ([#118](https://github.com/libp2p/js-libp2p-webrtc-star/issues/118)) ([9ee3a51](https://github.com/libp2p/js-libp2p-webrtc-star/commit/9ee3a51))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.11.0...v0.12.0) (2017-07-22)



<a name="0.11.0"></a>
# [0.11.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.10.1...v0.11.0) (2017-06-28)


### Features

* removed wrtc by default, added option for DI, added tests with electron-webrtc as well ([33dbaf4](https://github.com/libp2p/js-libp2p-webrtc-star/commit/33dbaf4))



<a name="0.10.1"></a>
## [0.10.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.10.0...v0.10.1) (2017-05-19)


### Bug Fixes

* use webworker friendly version of webrtcsupport ([0892a92](https://github.com/libp2p/js-libp2p-webrtc-star/commit/0892a92))



<a name="0.10.0"></a>
# [0.10.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.9.0...v0.10.0) (2017-05-19)


### Bug Fixes

* **package:** update simple-peer to version 8.0.0 ([9138acf](https://github.com/libp2p/js-libp2p-webrtc-star/commit/9138acf))
* handle reconnection to signaling server ([939aa8d](https://github.com/libp2p/js-libp2p-webrtc-star/commit/939aa8d))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.8.10...v0.9.0) (2017-03-30)


### Features

* update peer-info calls ([19f5930](https://github.com/libp2p/js-libp2p-webrtc-star/commit/19f5930))



<a name="0.8.10"></a>
## [0.8.10](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.8.8...v0.8.10) (2017-03-21)



<a name="0.8.8"></a>
## [0.8.8](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.8.7...v0.8.8) (2017-02-12)


### Bug Fixes

* make webrtcsupport a dep instead of a devDep ([815572d](https://github.com/libp2p/js-libp2p-webrtc-star/commit/815572d))



<a name="0.8.7"></a>
## [0.8.7](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.8.6...v0.8.7) (2017-02-11)


### Bug Fixes

* error if webrtc is not supported ([7217ebf](https://github.com/libp2p/js-libp2p-webrtc-star/commit/7217ebf))



<a name="0.8.6"></a>
## [0.8.6](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.8.5...v0.8.6) (2017-02-10)


### Bug Fixes

* use async.setImmediate because browserify does not shim automatilly it ([4790fe3](https://github.com/libp2p/js-libp2p-webrtc-star/commit/4790fe3))



<a name="0.8.5"></a>
## [0.8.5](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.8.4...v0.8.5) (2017-02-09)



<a name="0.8.4"></a>
## [0.8.4](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.8.3...v0.8.4) (2017-02-09)



<a name="0.8.3"></a>
## [0.8.3](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.8.1...v0.8.3) (2017-01-28)


### Features

* new peer-discovery interface compatible ([011ada5](https://github.com/libp2p/js-libp2p-webrtc-star/commit/011ada5))



<a name="0.8.1"></a>
## [0.8.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.8.0...v0.8.1) (2017-01-23)


### Bug Fixes

* README typo ([7e1f7b8](https://github.com/libp2p/js-libp2p-webrtc-star/commit/7e1f7b8))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.7.5...v0.8.0) (2017-01-22)


### Bug Fixes

* update Procfile ([81fff7e](https://github.com/libp2p/js-libp2p-webrtc-star/commit/81fff7e))


### Features

* it works with DNS \o/ ([d47197b](https://github.com/libp2p/js-libp2p-webrtc-star/commit/d47197b))



<a name="0.7.5"></a>
## [0.7.5](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.7.4...v0.7.5) (2017-01-20)



<a name="0.7.4"></a>
## [0.7.4](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.7.3...v0.7.4) (2017-01-18)


### Bug Fixes

* s/listeners/listenersRefs because swarm overloads that key ([82d9bab](https://github.com/libp2p/js-libp2p-webrtc-star/commit/82d9bab))



<a name="0.7.3"></a>
## [0.7.3](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.7.2...v0.7.3) (2017-01-18)


### Bug Fixes

* **tests:** detect correctly support ([2818dd2](https://github.com/libp2p/js-libp2p-webrtc-star/commit/2818dd2))
* segfaults, aegir does not like for us to constrain socket.io events ([529653f](https://github.com/libp2p/js-libp2p-webrtc-star/commit/529653f))



<a name="0.7.2"></a>
## [0.7.2](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.7.1...v0.7.2) (2017-01-16)



<a name="0.7.1"></a>
## [0.7.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.7.0...v0.7.1) (2017-01-16)



<a name="0.7.0"></a>
# [0.7.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.6.1...v0.7.0) (2016-12-06)



<a name="0.6.1"></a>
## [0.6.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.6.0...v0.6.1) (2016-12-06)



<a name="0.6.0"></a>
# [0.6.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.5.0...v0.6.0) (2016-11-17)


### Bug Fixes

* use false not null to disable wrtc in the browser ([3097589](https://github.com/libp2p/js-libp2p-webrtc-star/commit/3097589))


### Features

* webrtc in browser and nodejs complete ([942d501](https://github.com/libp2p/js-libp2p-webrtc-star/commit/942d501))
* WebRTC in Nodejs wooooot! ([71018bf](https://github.com/libp2p/js-libp2p-webrtc-star/commit/71018bf))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.4.5...v0.5.0) (2016-11-03)



<a name="0.4.5"></a>
## [0.4.5](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.4.4...v0.4.5) (2016-10-12)



<a name="0.4.4"></a>
## [0.4.4](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.4.3...v0.4.4) (2016-09-07)


### Bug Fixes

* **webrtc-star:** use destroy instead of emit for closing a conn ([90c93f0](https://github.com/libp2p/js-libp2p-webrtc-star/commit/90c93f0))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.4.1...v0.4.3) (2016-09-07)


### Bug Fixes

* **listener:** close events are propagated naturally ([590c67f](https://github.com/libp2p/js-libp2p-webrtc-star/commit/590c67f))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.4.0...v0.4.1) (2016-09-06)


### Features

* **readme:** update pull-streams section ([c629a83](https://github.com/libp2p/js-libp2p-webrtc-star/commit/c629a83))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.3.2...v0.4.0) (2016-09-05)


### Bug Fixes

* **deps:** downgrade aegir to v6 ([bd3e52e](https://github.com/libp2p/js-libp2p-webrtc-star/commit/bd3e52e))


### Features

* **pull-api:** update the tests accordingly ([0aa7761](https://github.com/libp2p/js-libp2p-webrtc-star/commit/0aa7761))
* **pull-api:** update to pull-api and the next interface-transport ([67aff97](https://github.com/libp2p/js-libp2p-webrtc-star/commit/67aff97))
* **readme:** complete the readme and add note about pull-streams ([b0821d3](https://github.com/libp2p/js-libp2p-webrtc-star/commit/b0821d3))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.3.1...v0.3.2) (2016-08-03)



<a name="0.3.1"></a>
## [0.3.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.3.0...v0.3.1) (2016-06-22)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.2.3...v0.3.0) (2016-06-22)



<a name="0.2.3"></a>
## [0.2.3](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.2.2...v0.2.3) (2016-06-01)


### Bug Fixes

* ensure emits are possible ([7631212](https://github.com/libp2p/js-libp2p-webrtc-star/commit/7631212))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.2.1...v0.2.2) (2016-05-30)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.2.0...v0.2.1) (2016-05-28)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.1.4...v0.2.0) (2016-05-27)



<a name="0.1.4"></a>
## [0.1.4](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.1.3...v0.1.4) (2016-05-23)



<a name="0.1.3"></a>
## [0.1.3](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.1.2...v0.1.3) (2016-05-22)



<a name="0.1.2"></a>
## [0.1.2](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.1.1...v0.1.2) (2016-05-22)



<a name="0.1.1"></a>
## [0.1.1](https://github.com/libp2p/js-libp2p-webrtc-star/compare/v0.1.0...v0.1.1) (2016-05-22)



<a name="0.1.0"></a>
# 0.1.0 (2016-05-22)



