# ADD NEW COIN

Use `bitcore-lib` for btc-like currencies


## Add explorer api

- `config/mainnet/api.js`
- `config/testnet/api.js`


## Add explorer link

- `config/mainnet/link.js`
- `config/testnet/api.js`


## Set configs

- `/externalConfigs/swaponline.github.io`
- `/externalConfigs/mainnet-localhost.js` - ???enable
- `/externalConfigs/testnet-default.js`
- `/shared/helpers/externalConfig.js`


## Add coin on

- `config/testnet/hiddenCoins.js`
- `shared/components/Coin/Coin.js`
- `shared/components/modals/HowToExportModal/HowToExportModal.js`
- `shared/components/modals/WithdrawModal/WithdrawModal.js`
- `shared/helpers/getCurrencyKey.js`
- `shared/helpers/user.js`
- `shared/pages/CreateWallet/CreateWallet.js`
- `shared/pages/CreateWallet/CreateWallet.scss`
- `shared/pages/CreateWallet/Steps/FirstStep.js`
- `shared/pages/CreateWallet/Steps/SecondStep.js`
- `shared/pages/Currency/Currency.js`
- `shared/pages/Wallet/Wallet.js`
- `shared/redux/reducers/createWallet.js`
- `shared/redux/reducers/currencies.js`


## Add logo

- `shared/components/ui/CurrencyIcon/images/coin.svg`
- export it here: `shared/components/ui/CurrencyIcon/images/index.js`


## Set fee default

- `shared/helpers/constants/DEFAULT_FEE_RATES.js`


## Set coin decimals

- `shared/helpers/constants/TOKEN_DECIMALS.js`


## Add coin as dynamic fee

- `shared/helpers/constants/coinsWithDynamicFee.js`


## Add min amount

- `shared/helpers/constants/minAmount.js`


## Create `privateKey` / `mnemonicKey` names for your coin

- `shared/helpers/constants/privateKeyNames.js`


## Add coin accordingly as is done for btc

- `shared/redux/actions/user.js`


## More changes!

Create helper, use btc as reference:

- `shared/helpers/coin.js`
- import helper `shared/helpers/index.js`

Add swap instances:

- `shared/instances/newSwap.js`


## Create coin actions

- `shared/redux/actions/index.js`
- `shared/redux/actions/coin.js` - ???

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


## Add `coinData`

- `shared/components/CurrencyDirectionChooser/CurrencyDirectionChooser.js`
- `shared/components/Header/User/UserTooltip/UserTooltip.js`
- `shared/components/layout/DashboardLayout/DashboardLayout.js`
- `shared/components/modals/ConfirmBeginSwap/ConfirmBeginSwap.js`
- `shared/components/modals/DownloadModal/DownloadModal.js`
- `shared/components/modals/InvoiceModal/InvoiceModal.js`
- `shared/components/modals/OfferModal/AddOffer/AddOffer.js`
- `shared/components/modals/RestoryMnemonicWallet/RestoryMnemonicWallet.js`
- `shared/components/modals/ShowMoreCoins/ShowMoreCoins.js`
- `shared/components/modals/SignUpModal/SignUpModal.js`
- `shared/components/SaveKeys/SaveKeys.js`
- `shared/containers/App/App.js`
- `shared/helpers/firebase/index.js`
- `shared/pages/CurrencyWallet/CurrencyWallet.js`
- `shared/pages/Exchange/Exchange.js`
- `shared/pages/Exchange/SelectGroup/SelectGroup.js`
- `shared/pages/History/Row/Row.js`
- `shared/pages/History/SwapsHistory/RowHistory/RowHistory.js`
- `shared/pages/Invoices/CreateInvoice/index.js`
- `shared/pages/Invoices/Invoice/index.js`
- `shared/pages/Invoices/InvoicesList/index.js`
- `shared/pages/PointOfSell/PointOfSell.js`
- `shared/pages/Swap/Swap.js`
- `shared/redux/actions/core.js`
- `shared/redux/reducers/user.js`
- `shared/helpers/links`
- `shared/helpers/constants/TRADE_TICKERS.js`
- `shared/pages/Wallet/Row/Row.js`
- `shared/plugins/backupUserData.js`


## Set routes

- `shared/routes/index.js`


## Create localisation

???
- `shared/localisation/_default.json`
- `shared/localisation/en.json`
- `shared/localisation/nl.json`
- `shared/localisation/ru.json`


## Add swap directions

???
- `shared/pages/Swap/...`
- `shared/pages/Swap/CoinSwap/...`
- `shared/pages/Swap/SwapProgress/SwapProgress.js`
- `shared/pages/Swap/SwapProgress/SwapProgressText/...`
- `shared/pages/Swap/swaps/index.js`


## Other

- `shared/pages/Wallet/components/LinkAccount/index.js`


## Upate README

- `docs/ADD_BLOCKCHAIN.md` (improve this doc)
- `swap.core/docs/ADD_BLOCKCHAIN.md` (improve other doc)
- `swap.core/docs/README.md` (add coin to the table)
