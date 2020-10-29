# ADD NEW BLOCKCHAIN

The Atomic Swap is a complex operation which consists of multiple software/hardware elements controlled from different world regions. E.g, here is just a couple of the systems (elements):

- Multiple public nodes.
- libp2p messaging system.
- Two blockchains.
- Smart contracts written on different languages with different processing features.
- Public explorers.
- External monitoring services (e.g. mining fee calculator).
- User's browser as the swap logic executioner (not only frontend but the entire dApp).
- The user as his or her actions affect the swap.

<b>Mining fee</b>. How much is the fee and which fee is optimal? How this fee will be calculated? How much cryptocurrency will be spend in both blockchains and who will pay this amount of crypto? Which sum will be final for the maker to send and for the taker to get?

<b>Blockchain features</b>. E.g. for the ERC20-tokens the operation should be 'approved' and client must have some ETH to receive the tokens. For the EOS, the paid account activation is required. This problems shouldn't be of user's concern.

<b>How do the public nodes work?</b> Three public nodes activity is required during the swap (two blockchains and orderbook). What if one node works better than the other or is blocked in some countries?

<br>Correct swap recovery after the update of page. How the swap progress can be recovered from the last point if some problem occured and page was updated?

We elolve. We update our system timely and the blockchains' interoperability management takes time. 

## How much? 

For successful connection need 2 people: 1 senior React JS developer (you or your) and one tech Lead (from us). <Br>

A new senior JS developer, without blockchain skills, connect takes 2-3 month for:
- Research of atomic swap technology
- Research of our app arhitecture
- Do Plan A (see below)

COSTS:  
- 1 senior React JS developer ~ 2500 x 3 month ~ 7500 USD 
- swaponline team consultation, review - stake <a href="https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/SWAPTOKEN.md"> 5 000 SWAP</a>

## Plan A

### Phase 1 `Example`

- Find JS library (use `bitcore-lib` for btc-like currencies)
- Create the simplest example of atomic swap


### Phase 2 `Wallet`

- Mnemonic -> keys, address generation
- Balance
- tx/rx
- PR, reviews, merge


### Phase 3 `Swaps`

- Implement swaps
- PR, reviews, merge


--------------------------------------------


## Front changes

### Add explorer api

- `config/mainnet/api.js`
- `config/testnet/api.js`


### Add explorer link

- `config/mainnet/link.js`
- `config/testnet/api.js`


### Set configs

- `/externalConfigs/swaponline.github.io`
- `/externalConfigs/mainnet-localhost.js`
- `/externalConfigs/testnet-default.js`
- `/shared/helpers/externalConfig.js`


### Add coin on

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


### Add logo

- `shared/components/ui/CurrencyIcon/images/coin.svg`
- export it here: `shared/components/ui/CurrencyIcon/images/index.js`


### Set fee default

- `shared/helpers/constants/DEFAULT_FEE_RATES.js`


### Set coin decimals

- `shared/helpers/constants/TOKEN_DECIMALS.js`


### Add coin as dynamic fee

- `shared/helpers/constants/coinsWithDynamicFee.js`


### Add min amount

- `shared/helpers/constants/minAmount.js`


### Create `privateKey` / `mnemonicKey` names for your coin

- `shared/helpers/constants/privateKeyNames.js`


### Add coin accordingly as is done for btc

- `shared/redux/actions/user.js`


### More changes!

Create helper, use btc as reference:

- `shared/helpers/coin.js`
- import helper `shared/helpers/index.js`

Add swap instances:

- `shared/instances/newSwap.js`


### Create coin actions

- `shared/redux/actions/index.js`
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
	* `bitcore-lib` - add network settings
	* signMessage


### Add `coinData`

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


### Set routes

- `shared/routes/index.js`


### Add swap directions

- `shared/pages/Swap/...`
- `shared/pages/Swap/CoinSwap/...`
- `shared/pages/Swap/SwapProgress/SwapProgress.js`
- `shared/pages/Swap/SwapProgress/SwapProgressText/...`
- `shared/pages/Swap/swaps/index.js`


### Create swap localisation

- `shared/localisation/_default.json`
- `shared/localisation/en.json`
- `shared/localisation/nl.json`
- `shared/localisation/ru.json`


### Other

- `shared/pages/Wallet/components/LinkAccount/index.js`


### Update README

- `docs/ADD_BLOCKCHAIN.md` (improve this doc)


--------------------------------------------


## Core changes

### Change files

- See [swap.core/docs/ADD_BLOCKCHAIN.md](https://github.com/swaponline/swap.core/blob/master/docs/ADD_BLOCKCHAIN.md)


### Update README

- `swap.core/docs/ADD_BLOCKCHAIN.md` (improve core doc)
- `swap.core/docs/README.md` (add coin to the table)


--------------------------------------------


## Examples

### GHOST

- See [swap.core/docs/ADD_BLOCKCHAIN.md](https://github.com/swaponline/swap.core/blob/master/docs/ADD_BLOCKCHAIN.md)


### NEXT.coin

- [Task + PRs](https://github.com/swaponline/swap.core/issues/504)
