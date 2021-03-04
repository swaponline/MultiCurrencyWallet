# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.5]
#### Bugfixes
- update aegir to latest
- update dependencies

## [2.0.4]

#### Bugfixes
- downgrade aegir because js files are missing in dist directory
## [2.0.3]

#### Bugfixes
- update peer-id dependency

## [2.0.2]

#### Bugfixes
- update dependencies

## [2.0.1]

#### Bugfixes
- security update for bl dependency
- add missing type declaration files in dist

## [2.0.0]

#### Features
- switched to aegir for building and linting
- using peer id with Uint8Arrays (breaking!)

## [1.1.2]

#### Bugfixes
- fix issue where web build depends on global regeneratorRuntime

## [1.1.1] - 2020-05-08

#### Bugfixes
- fix issue [#58](https://github.com/NodeFactoryIo/js-libp2p-noise/issues/58)

## [1.1.0] - 2020-04-23

Stable version, interoperable with go.

Using reduced size with bcrypto.

## [1.1.0-rc.1] - 2020-04-22

- Added early data API
- Dumping session keys
- Reducing package size

## [1.0.0]

Stable version, interobable with go-libp2p-noise!

### Bugfixes
- fix types to be compatible with rest of libp2p typescript projects
- update it-pb-rpc to 0.1.8 (contains proper typescript types)

### Bugfixes
- changed bcrypto imports to use pure js versions (web bundle size reduction)

## [1.0.0-rc.9] - 2019-03-11

### Bugfixes
- return handshake remote peer from secureOutbound
- fix browser usage of buffer

## [1.0.0-rc.8] - 2019-03-05

### Breaking changes
- Disabled noise pipes

### Bugfixes
- fixed empty ephemeral bug in XX
- verification of AEAD decryption


## [1.0.0-rc.7] - 2019-02-20

### Bugfixes
- attach/remove aead auth tag on cyphertext

## [1.0.0-rc.6] - 2019-02-20

### Bugfixes
- attach/remove aead auth tag on cyphertext
- better protobuf handling (static module generation)

## [1.0.0-rc.5] - 2019-02-10

### Bugfixes
- fix module compiling in node 10 (class properties)

## [1.0.0-rc4] - 2019-02-10

### Bugfixes
- resolved bug with key cache and null remote peer
- fixed IK flow as initiator and responder
