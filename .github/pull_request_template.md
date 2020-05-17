# Pull request template

## Checklist

<!-- You have to tick all the boxes -->

- [ ] I have read the [CONTRIBUTING](https://github.com/swaponline/swap.react/wiki/CONTRIBUTING) guide
- [ ] branch rebased on `master`
- [ ] styleguide check `npm run validate`
- [ ] good naming
- [ ] keep simple
- [ ] video or screenshot attached
- [ ] testing instruction attached
- [ ] check your PR once again


### Description

<!-- Include issue number and motivation for these code changes -->




### Video or screenshot

<!-- Paste video or screenshots -->




### What and how to test

<!-- What reviewer should do? -->

To test it locally run ```git fetch && fit checkout twelveWordsCreateBug``` where twelveWordsCreateBug is a name of this branch (see under title) OR ```git fetch origin refs/pull/2590/merge:pr2590 && git checkout pr2590``` where 2590 is number of this pull request

```npm i && npm run build:mainnet``` then run MultiCurrencyWallet/build.mainnet/index.html in browse

