# Motivation
The rapid growth of decentralized exchanges shows the huge interest of the blockchain community in such projects. However, until recently, all this is possible only on ethereum. Most of trades on centralized exchanges was with non-ethereum blockchains, but such trades impossible without intermediases who takes %. 

Interoperability between different blockchains and cryptocurrencies is an ongoing struggle. We know a lot of projects who solve this problem with simple way by creating intermediate IOU system based on multisig. such projects as Cosmos, Kava, Polkadot, Ethereum "wrapped" tokens like WBTC, renBTC, etc. 

# Before start

Ask your community. Are they need this?  For example $350k Monero Atomic Swaps implementation funding has done (we are not performers, this is just an example). https://ccs.getmonero.org/proposals/h4sh3d-atomic-swap-implementation.html . Monero's community doesn't want to move their funds to another "better" blockchain to use. if yes ask them for little crowdfunding (see "How much?" below)

# TEHCNICAL INFORMATION (how it works)

The Atomic Swap is a complex operation which consists of multiple software/hardware elements controlled from different world regions. E.g, here is just a couple of the systems (elements):

- Multiple public nodes
- libp2p messaging system
- Two blockchains
- Smart contracts written on different languages with different processing features
- Public explorers
- External monitoring services (e.g. mining fee calculator)
- User's browser as the swap logic executioner (not only frontend but the entire dApp)
- The user as his or her actions affect the swap

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

- `src/front/config/mainnet/api.js`
- `src/front/config/testnet/api.js`


### Add explorer link

- `src/front/config/mainnet/link.js`
- `src/front/config/testnet/api.js`


### Set configs

- `src/front/externalConfigs/swaponline.github.io`
- `src/front/externalConfigs/mainnet-localhost.js`
- `src/front/externalConfigs/testnet-default.js`
- `src/front/shared/helpers/externalConfig.js`


### Add coin on

- `src/front/config/testnet/hiddenCoins.js`
- `src/front/shared/components/Coin/Coin.js`
- `src/front/shared/components/modals/HowToExportModal/HowToExportModal.js`
- `src/front/shared/components/modals/WithdrawModal/WithdrawModal.js`
- `src/front/shared/helpers/getCurrencyKey.js`
- `src/front/shared/helpers/user.js`
- `src/front/shared/pages/CreateWallet/CreateWallet.js`
- `src/front/shared/pages/CreateWallet/CreateWallet.scss`
- `src/front/shared/pages/CreateWallet/Steps/FirstStep.js`
- `src/front/shared/pages/CreateWallet/Steps/SecondStep.js`
- `src/front/shared/pages/Currency/Currency.js`
- `src/front/shared/pages/Wallet/Wallet.js`
- `src/front/shared/redux/reducers/createWallet.js`
- `src/front/shared/redux/reducers/currencies.js`


### Add logo

- `src/front/shared/components/ui/CurrencyIcon/images/coin.svg`
- export it here: `src/front/shared/components/ui/CurrencyIcon/images/index.js`


### Set fee default

- `src/front/shared/helpers/constants/DEFAULT_FEE_RATES.js`


### Set coin decimals

- `src/front/shared/helpers/constants/TOKEN_DECIMALS.js`


### Add coin as dynamic fee

- `src/front/shared/helpers/constants/coinsWithDynamicFee.js`


### Add min amount

- `src/front/shared/helpers/constants/minAmount.js`


### Create `privateKey` / `mnemonicKey` names for your coin

- `src/front/shared/helpers/constants/privateKeyNames.js`


### Add coin accordingly as is done for btc

- `src/front/shared/redux/actions/user.js`


### More changes!

Create helper, use btc as reference:

- `src/front/shared/helpers/coin.js`
- import helper `src/front/shared/helpers/index.js`

Add swap instances:

- `src/front/shared/instances/newSwap.js`


### Create coin actions

- `src/front/shared/redux/actions/index.js`
- `src/front/shared/redux/actions/coin.js`
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

- `src/front/shared/components/CurrencyDirectionChooser/CurrencyDirectionChooser.js`
- `src/front/shared/components/Header/User/UserTooltip/UserTooltip.js`
- `src/front/shared/components/layout/DashboardLayout/DashboardLayout.js`
- `src/front/shared/components/modals/ConfirmBeginSwap/ConfirmBeginSwap.js`
- `src/front/shared/components/modals/DownloadModal/DownloadModal.js`
- `src/front/shared/components/modals/InvoiceModal/InvoiceModal.js`
- `src/front/shared/components/modals/OfferModal/AddOffer/AddOffer.js`
- `src/front/shared/components/modals/RestoryMnemonicWallet/RestoryMnemonicWallet.js`
- `src/front/shared/components/modals/ShowMoreCoins/ShowMoreCoins.js`
- `src/front/shared/components/modals/SignUpModal/SignUpModal.js`
- `src/front/shared/components/SaveKeys/SaveKeys.js`
- `src/front/shared/containers/App/App.js`
- `src/front/shared/helpers/firebase/index.js`
- `src/front/shared/pages/CurrencyWallet/CurrencyWallet.js`
- `src/front/shared/pages/Exchange/Exchange.js`
- `src/front/shared/pages/Exchange/SelectGroup/SelectGroup.js`
- `src/front/shared/pages/History/Row/Row.js`
- `src/front/shared/pages/History/SwapsHistory/RowHistory/RowHistory.js`
- `src/front/shared/pages/Invoices/CreateInvoice/index.js`
- `src/front/shared/pages/Invoices/Invoice/index.js`
- `src/front/shared/pages/Invoices/InvoicesList/index.js`
- `src/front/shared/pages/PointOfSell/PointOfSell.js`
- `src/front/shared/pages/Swap/Swap.js`
- `src/front/shared/redux/actions/core.js`
- `src/front/shared/redux/reducers/user.js`
- `src/front/shared/helpers/links`
- `src/front/shared/helpers/constants/TRADE_TICKERS.js`
- `src/front/shared/pages/Wallet/Row/Row.js`
- `src/front/shared/plugins/backupUserData.js`


### Set routes

- `src/front/shared/routes/index.js`


### Add swap directions

- `src/front/shared/pages/Swap/...`
- `src/front/shared/pages/Swap/CoinSwap/...`
- `src/front/shared/pages/Swap/SwapProgress/SwapProgress.js`
- `src/front/shared/pages/Swap/SwapProgress/SwapProgressText/...`
- `src/front/shared/pages/Swap/swaps/index.js`


### Create swap localisation

- `src/front/shared/localisation/_default.json`
- `src/front/shared/localisation/en.json`
- `src/front/shared/localisation/nl.json`
- `src/front/shared/localisation/ru.json`


### Other

- `src/front/shared/pages/Wallet/components/LinkAccount/index.js`


--------------------------------------------


## Core changes

- `src/core/swap.app/constants/COINS.js`
- `src/core/swap.app/constants/ENV.js`
- `src/core/swap.app/constants/TRADE_TICKERS.js`
- `src/core/swap.app/util/typeforce.js`
- `src/core/swap.auth/*.js`
- `src/core/swap.flows/index.js`
- `src/core/swap.flows/ETH2*.js`
- `src/core/swap.flows/ETHTOKEN2*.js`
- `src/core/swap.flows/*2ETH.js`
- `src/core/swap.flows/*2ETHTOKEN.js`
- `src/core/swap.swaps/index.js`
- `src/core/swap.swaps/*Swap.js`
- `package.json` (install lib via `npm i`)

`*` = `GHOST`, for example


--------------------------------------------


## Additional changes

### Update README

- `src/core/README.md` (add coin to the table)
- `docs/ADD_BLOCKCHAIN.md` (improve this doc)


--------------------------------------------


## Examples

### GHOST

- https://github.com/swaponline/MultiCurrencyWallet/pull/2891
- https://github.com/swaponline/swap.core/pull/500
- https://github.com/swaponline/swap.core/pull/501


### NEXT.coin

- [Task + PRs](https://github.com/swaponline/swap.core/issues/504)
