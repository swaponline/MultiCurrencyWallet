# How to add BTC-like blockchain


## Edit `swap.core` 

### Edit files

+ `src/swap.app/constants/COINS.js`
+ `src/swap.app/constants/ENV.js`
+ `src/swap.app/constants/TRADE_TICKERS.js`
+ `src/swap.app/util/typeforce.js`
- (?) `src/swap.auth/*.js`
+ `src/swap.flows/index.js`
+ (need test) `src/swap.flows/ETH2*.js`
+ `src/swap.flows/ETHTOKEN2*.js`
+ (need test) `src/swap.flows/*2ETH.js`
+ (need test) `src/swap.flows/*2ETHTOKEN.js`
+ `src/swap.swaps/index.js`
+- (?) `src/swap.swaps/*Swap.js`
- `package.json` (install lib via `npm i`)

`*` = `ghost`, for example

### Example PR (`ghost` was added)

- https://github.com/swaponline/swap.core/pull/500
- https://github.com/swaponline/swap.core/pull/501


## Edit `MultiCurrencyWallet` repo

### Edit files

See [instruction](https://github.com/swaponline/MultiCurrencyWallet/blob/master/ADD_BLOCKCHAIN.md)

### Example PR (`ghost` was added)

- https://github.com/swaponline/MultiCurrencyWallet/pull/2891




