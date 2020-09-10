# ADD NEW COIN

To add coin to MultiCurrencyWallet you must add


## Changes needed

Add explorer api on:

- `config/mainnet/api.js`
- `config/testnet/api.js`

Add explorer link:

- `config/mainnet/link.js`
- `config/testnet/api.js`

Add coin on:

- `config/testnet/hiddenCoins.js`
- `shared/components/Coin/Coin.js`
- `shared/components/modals/WithdrawModal/WithdrawModal.js`
- `shared/helpers/getCurrencyKey.js`
- `shared/helpers/user.js`
- `shared/pages/CreateWallet/CreateWallet.js`
- `shared/pages/CreateWallet/Steps/FirstStep.js`
- `shared/pages/CreateWallet/Steps/SecondStep.js`
- `shared/pages/Currency/Currency.js`
- `shared/pages/Wallet/Wallet.js`
- `shared/redux/reducers/createWallet.js`
- `shared/redux/reducers/currencies.js`

Add logo:

- `shared/components/ui/CurrencyIcon/images/coin.svg`
- export it here: `shared/components/ui/CurrencyIcon/images/index.js`

Add fee default:

- `shared/helpers/constants/DEFAULT_FEE_RATES.js`

Add coin decimals:

- `shared/helpers/constants/TOKEN_DECIMALS.js`

Add coin as dynamic fee:

- `shared/helpers/constants/coinsWithDynamicFee.js`

Add min amount:

- `shared/helpers/constants/minAmount.js`

Create `privateKey` / `mnemonicKey` names for your coin:

- `shared/helpers/constants/privateKeyNames.js`

Add coin accordingly as is done for btc:

- `shared/redux/actions/user.js`


## More changes!

Create helper, use btc as reference:

- `shared/helpers/coin.js`
- import helper `shared/helpers/index.js`

Add swap instances:

- `shared/instances/newSwap.js`


## Create coin actions

- `shared/redux/actions/coin.js`

* use `btc.js` as reference
* getWalletByWords - set coin index
* set urls
	- `getTxRouter`
	- `getLinkToInfo`
	- `fetchBalanceStatus`
	- `fetchBalance`
	- `getTransaction`
	- `fetchUnspents`
	- `broadcastTx`
	- `checkWithdraw`
* `bitcore-lib` - add network settings - ???
* signMessage - [net, net] - ???
