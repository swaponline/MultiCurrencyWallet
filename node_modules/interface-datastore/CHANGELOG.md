## [3.0.4](https://github.com/ipfs/interface-datastore/compare/v3.0.3...v3.0.4) (2021-02-05)


### Bug Fixes

* renames .ts to .d.ts and copies to dist/src on build ([#71](https://github.com/ipfs/interface-datastore/issues/71)) ([568ee54](https://github.com/ipfs/interface-datastore/commit/568ee54323e487bff191437e13b1aeaa0a85f411)), closes [#68](https://github.com/ipfs/interface-datastore/issues/68) [#69](https://github.com/ipfs/interface-datastore/issues/69)



## [3.0.3](https://github.com/ipfs/interface-datastore/compare/v3.0.2...v3.0.3) (2021-01-22)


### Bug Fixes

* fix datastore factory ([#65](https://github.com/ipfs/interface-datastore/issues/65)) ([586f883](https://github.com/ipfs/interface-datastore/commit/586f883d3f5ea0391cf3184024db9a60d9b4aa56))



## [3.0.2](https://github.com/ipfs/interface-datastore/compare/v3.0.1...v3.0.2) (2021-01-22)


### Bug Fixes

* open store in tests ([#66](https://github.com/ipfs/interface-datastore/issues/66)) ([6092b10](https://github.com/ipfs/interface-datastore/commit/6092b103b40cb8ee1c57d42082221c1e899bdc14))



## [3.0.1](https://github.com/ipfs/interface-datastore/compare/v3.0.0...v3.0.1) (2021-01-17)



# [3.0.0](https://github.com/ipfs/interface-datastore/compare/v2.0.1...v3.0.0) (2021-01-15)


### Bug Fixes

* ci ([f197aa4](https://github.com/ipfs/interface-datastore/commit/f197aa4a719a388ba91c65ea49ee3cdc5be4dc84))
* feedback ([248cddb](https://github.com/ipfs/interface-datastore/commit/248cddb7d14ee9f29e92fdbe24916578577f4f6d))
* fix some types ([42aebd5](https://github.com/ipfs/interface-datastore/commit/42aebd5f56e4577e6743f0c3861ea0a558e142b7))
* remove types versions and tweak orders ([e449528](https://github.com/ipfs/interface-datastore/commit/e449528d5b98edf6b62e770033d59686928fe67e))
* types ([f8fe99e](https://github.com/ipfs/interface-datastore/commit/f8fe99ec949a694434564b0494bc9f6b57351df4))
* update aegir and feedback ([eab84b0](https://github.com/ipfs/interface-datastore/commit/eab84b025c03b6a2fff805af3a238cefd57545f2))


### Features

* ts types, github ci and clean up ([2afd9be](https://github.com/ipfs/interface-datastore/commit/2afd9be3abf747528473c46550671f92acc5792e))



## [2.0.1](https://github.com/ipfs/interface-datastore/compare/v2.0.0...v2.0.1) (2020-11-09)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/ipfs/interface-datastore/compare/v1.0.4...v2.0.0) (2020-07-29)


### Bug Fixes

* remove node buffer ([#43](https://github.com/ipfs/interface-datastore/issues/43)) ([b2f0963](https://github.com/ipfs/interface-datastore/commit/b2f0963))


### BREAKING CHANGES

* - node Buffers have been replaced with Uint8Arrays
- `key.toBuffer` has been replaced with `key.uint8Array()`



<a name="1.0.4"></a>
## [1.0.4](https://github.com/ipfs/interface-datastore/compare/v1.0.3...v1.0.4) (2020-06-10)



<a name="1.0.3"></a>
## [1.0.3](https://github.com/ipfs/interface-datastore/compare/v1.0.2...v1.0.3) (2020-06-10)


### Bug Fixes

* remove .has method from interface ([a0ebd3a](https://github.com/ipfs/interface-datastore/commit/a0ebd3a))


### BREAKING CHANGES

* - The `.has` method has been removed, call `.get` instead



<a name="1.0.2"></a>
## [1.0.2](https://github.com/ipfs/interface-datastore/compare/v1.0.1...v1.0.2) (2020-05-07)


### Features

* add adapter ([4223581](https://github.com/ipfs/interface-datastore/commit/4223581))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/ipfs/interface-datastore/compare/v1.0.0...v1.0.1) (2020-05-07)



<a name="1.0.0"></a>
# [1.0.0](https://github.com/ipfs/interface-datastore/compare/v0.8.3...v1.0.0) (2020-05-07)


### Features

* add streaming methods and allow passing AbortSignals ([#36](https://github.com/ipfs/interface-datastore/issues/36)) ([6dace38](https://github.com/ipfs/interface-datastore/commit/6dace38))



<a name="0.8.3"></a>
## [0.8.3](https://github.com/ipfs/interface-datastore/compare/v0.8.2...v0.8.3) (2020-04-07)



<a name="0.8.2"></a>
## [0.8.2](https://github.com/ipfs/interface-datastore/compare/v0.8.1...v0.8.2) (2020-04-01)


### Bug Fixes

* remove node globals ([#35](https://github.com/ipfs/interface-datastore/issues/35)) ([a9130c0](https://github.com/ipfs/interface-datastore/commit/a9130c0))



<a name="0.8.1"></a>
## [0.8.1](https://github.com/ipfs/interface-datastore/compare/v0.8.0...v0.8.1) (2020-02-17)


### Bug Fixes

* do not stringify potentially invalid characters ([#34](https://github.com/ipfs/interface-datastore/issues/34)) ([0034ede](https://github.com/ipfs/interface-datastore/commit/0034ede))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/ipfs/interface-datastore/compare/v0.7.0...v0.8.0) (2019-08-09)


### Features

* concat operation on Key ([8c9226c](https://github.com/ipfs/interface-datastore/commit/8c9226c))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipfs/interface-datastore/compare/v0.6.0...v0.7.0) (2019-05-01)


### Features

* refactor to async iterators ([#25](https://github.com/ipfs/interface-datastore/issues/25)) ([ab2f2b9](https://github.com/ipfs/interface-datastore/commit/ab2f2b9))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipfs/interface-datastore/compare/v0.5.0...v0.6.0) (2018-10-24)


### Bug Fixes

* add _key to the API functions using the instance ([5a377ed](https://github.com/ipfs/interface-datastore/commit/5a377ed))


### Features

* add class-is module ([362eff8](https://github.com/ipfs/interface-datastore/commit/362eff8))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipfs/interface-datastore/compare/v0.4.2...v0.5.0) (2018-09-17)


### Features

* add basic error codes ([bbf5f70](https://github.com/ipfs/interface-datastore/commit/bbf5f70))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/ipfs/interface-datastore/compare/v0.4.1...v0.4.2) (2017-12-05)



<a name="0.4.1"></a>
## [0.4.1](https://github.com/ipfs/interface-datastore/compare/v0.4.0...v0.4.1) (2017-11-04)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/interface-datastore/compare/v0.3.1...v0.4.0) (2017-11-03)


### Bug Fixes

* make datastore OS agnostic (path things) ([#13](https://github.com/ipfs/interface-datastore/issues/13)) ([5697173](https://github.com/ipfs/interface-datastore/commit/5697173))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/ipfs/interface-datastore/compare/v0.3.0...v0.3.1) (2017-09-07)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipfs/interface-datastore/compare/v0.2.2...v0.3.0) (2017-07-22)



<a name="0.2.2"></a>
## [0.2.2](https://github.com/ipfs/interface-datastore/compare/v0.2.1...v0.2.2) (2017-06-03)


### Bug Fixes

* use os specific path separator ([d7ec65a](https://github.com/ipfs/interface-datastore/commit/d7ec65a))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ipfs/interface-datastore/compare/v0.2.0...v0.2.1) (2017-05-23)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/interface-datastore/compare/v0.1.1...v0.2.0) (2017-03-23)


### Features

* add open method ([#4](https://github.com/ipfs/interface-datastore/issues/4)) ([cbe8f7f](https://github.com/ipfs/interface-datastore/commit/cbe8f7f))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipfs/interface-datastore/compare/v0.1.0...v0.1.1) (2017-03-15)


### Bug Fixes

* libp2p-crypto is a regular dependency ([3db267b](https://github.com/ipfs/interface-datastore/commit/3db267b))



