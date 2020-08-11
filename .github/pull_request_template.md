# Pull request

## Checklist

<!-- You have to tick all the boxes -->

- [x] I have read the [CONTRIBUTING](https://github.com/swaponline/swap.react/wiki/CONTRIBUTING) guide
- [x] Styleguide check `npm run validate`
- [x] Good naming
- [x] Keep simple
- [x] I checked desktop/mobile version
- [x] I checked bright/dark mode
- [x] I checked en/ru version
- [x] Affects money; I checked the functionality once again
- [x] Video or screenshot attached
- [x] Testing instruction attached
- [x] I checked the PR once again


### Description

<!-- Include issue number (#1234) or motivation for these code changes -->


### Video or screenshot

<!-- Paste video or screenshots -->


### What and how to test

<!-- What reviewer should do? -->

To test it locally run ```git fetch && fit checkout twelveWordsCreateBug``` where twelveWordsCreateBug is a name of this branch (see under title) OR ```PRID=2812; git fetch origin refs/pull/$PRID/merge:pr$PRID && git checkout pr$PRID``` where PRID is number of this pull request

```npm i && npm run build:mainnet``` then run MultiCurrencyWallet/build.mainnet/index.html in browse
