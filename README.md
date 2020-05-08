
##Multicurrency wallet for Bitcoin and custom assets, and p2p excahnge


<h2>1. Multi-currency wallet. Your users can store Bitcoin and custom assets</h2>
Add many assets to your wallet. 



<h2>32 Buy/Sell assets . (Exchange widget)</h2>

## Swap  React

### Install

#### Eng
1) Clone repo
2) Clone repository with submodules (swap.core) in the root of project
```
git clone --recurse-submodules https://github.com/swaponline/swap.react.git
```

3) Do `npm i` (windows? https://www.npmjs.com/package/windows-build-tools )<br /> (node 10 required, not 12!)
```
nvm use 10.18.1
cd swap.react
npm i
```

4) Do `git submodule update` in swap.react directory

5) For dev mode `npm run start`, for prod `npm run build`
   > If you need to deploy it on your own (site) origin - run build like: `npm run build:mainnet https://yourcoolsite.com/`



```
npm run start
```

### Build with custom ERC20 token (BTC,ETH,)
1. npm run build:mainnet-widget {erc20contract} {name} {decimals} {tiker}

example:
```
npm run build:mainnet-widget 0x4E12EB8e506Ccd1427F6b8F7faa3e88fB698EB28 jack 18 JACK full
```
2. upoad to your domain (https://domain.com/build-mainnet-widget)
3. open in browser
 



### How to add new ERC20 token

   * go to `swap.react/config/mainnet/erc20.js`
   * go to `swap.react/swap.core/src/swap.app/constants/COINS.js` and add token there too
   * go to `shared/redux/reducers/currencies.js` and add token there too

### How to add token to "Create wallet" screen

* go to `shared/redux/reducers/currencies.js` and change `addAssets: false,` to `true`

![](https://screenshots.wpmix.net/chrome_J9boBqgIfnB5OHeDUtnCYcZ3kPQ4oJtN.png)




## how to update your version (fork) to latest version:
0. Make backup and "git push" all your changes to your repository
1. select your repository in "base branch" (left)
2. click "Create pull request" (enter any title)
3. click "Merge pull request"

if you have conflicts (if sources has been changed on your side) click "resolve conflicts".
