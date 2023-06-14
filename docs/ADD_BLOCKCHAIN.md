# Add new blockchain to multicurrency wallet with atomic swap exchange
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

# COSTS:
- 1 senior React JS developer ~ 3500 (remote) x 3 month ~ 7500 USD 
- swaponline team consultation, review -  <a href="https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/SWAPTOKEN.md">5 000 SWAP</a>
- maintaining and thechnical support ~ $500-3500 / month
- budget for testing, auditing or covering losses if users lose money as a result of errors in the swap process (we are not responsible for this) ~ from $0

Important note: Our core team focused on BTC-ETH swaps. If another blockchain added to our codebase it incurs additional cost for maintenance. mcw is going forward and a lot of things will be changed in the future (in our core code, in thousands of dependencies, in our design etc..). A developer must adopt new changes or we can lock the version on a separate domain and disable blockchain from our codebase due to outdated version. 

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
- `src/front/config/testnet/link.js`


### Set configs

- `src/front/externalConfigs/swaponline.github.io`
- `src/front/externalConfigs/mainnet-localhost.js`
- `src/front/externalConfigs/testnet-default.js`
- `src/front/shared/helpers/externalConfig.ts`


### Add coin on

- `src/front/config/testnet/hiddenCoins.js`
- `src/front/shared/components/modals/WithdrawModal/WithdrawModal.tsx`
- `src/front/shared/helpers/getCurrencyKey.ts`
- `src/front/shared/helpers/user.ts`
- `src/front/shared/helpers/metamask.ts`
- `src/front/shared/helpers/swaps.ts`
- `src/front/shared/pages/CreateWallet/CreateWallet.tsx`
- `src/front/shared/pages/CreateWallet/Steps/StepsWrapper.tsx`
- `src/front/shared/pages/CreateWallet/Steps/startPacks.ts`
- `src/front/shared/pages/Wallet/Wallet.tsx`
- `src/front/shared/redux/reducers/createWallet.ts`
- `src/front/shared/redux/reducers/currencies.ts`
- `src/front/shared/redux/reducers/user.ts`


### Add logo

- `src/front/shared/components/ui/CurrencyIcon/images/<coin>.svg`
- export it here: `src/front/shared/components/ui/CurrencyIcon/images/index.ts`

### Set coin decimals

- `src/front/shared/helpers/constants/TOKEN_DECIMALS.ts`


### Create `privateKey` / `mnemonicKey` names for your coin

- `src/front/shared/helpers/constants/privateKeyNames.js`


### Add coin accordingly as is done for btc/eth

- `src/front/shared/redux/actions/user.ts`


Create helper, use btc as reference:

- `src/front/shared/helpers/<coin>.ts`
- import helper `src/front/shared/helpers/index.js`

Add swap instances:

- `src/front/shared/instances/newSwap.js`


### Create coin actions

- `src/front/shared/redux/actions/coin.ts`
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

if you're adding an evm coin
- new instance `src/front/shared/redux/actions/ethLikeAction.ts`

if you're adding a new token standard
- new instance `src/front/shared/redux/actions/erc20LikeAction.ts`

- import a new file here `src/front/shared/redux/actions/index.ts`


### Add `coinData`

- `src/front/shared/components/modals/ConfirmBeginSwap/ConfirmBeginSwap.tsx`
- `src/front/shared/components/modals/DownloadModal/DownloadModal.tsx`
- `src/front/shared/components/modals/RestoryMnemonicWallet/RestoryMnemonicWallet.tsx`
- `src/front/shared/components/SaveKeys/SaveKeys.tsx`
- `src/front/shared/containers/App/App.tsx`
- `src/front/shared/pages/Exchange/Exchange.tsx`
- `src/front/shared/pages/History/SwapsHistory/RowHistory/RowHistory.tsx`
- `src/front/shared/pages/Invoices/CreateInvoice/index.tsx`
- `src/front/shared/pages/Invoices/InvoicesList/index.tsx`
- `src/front/shared/pages/Swap/Swap.tsx`
- `src/front/shared/redux/actions/core.ts`
- `src/front/shared/helpers/constants/TRADE_TICKERS.ts`
- `src/front/shared/plugins/backupUserData.ts`


### Set routes

- `src/front/shared/routes/index.js`


### Add swap directions

- `src/front/shared/pages/Swap/...`
- `src/front/shared/pages/Swap/swaps/buld.ts`
- `src/front/shared/pages/Swap/swaps/index.ts`


### Update localization for all languages if you add/change new messages

- run command `npm run messages:extract`
- translate new messages here `src/front/shared/localisation/...`

--------------------------------------------


## Common changes
- `src/common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS.ts`
- `src/common/helpers/constants/COINS_WITH_DYNAMIC_FEE.ts`
- `src/common/helpers/constants/MIN_AMOUNT.ts`
- `src/common/helpers/constants/MIN_AMOUNT_OFFER.ts`

if you're adding an evm chain
- `src/common/helpers/constants/AVAILABLE_EVM_NETWORKS.ts`

if you're adding a new token standard
- new instance in `common/erc20Like`

--------------------------------------------


## Core changes

- `src/core/swap.app/constants/COINS.ts`
- `src/core/swap.app/constants/ENV.ts`
- `src/core/swap.app/constants/TRADE_TICKERS.ts`
- `src/core/swap.app/util/typeforce.ts`
- `src/core/swap.app/SwapApp.ts`
- `src/core/swap.auth/*.ts`
- `src/core/swap.flows/index.ts`
- `src/core/swap.flows/<ETH,BNB,...>2*.ts`
- `src/core/swap.flows/<ETHTOKEN, BSCTOKEN, ...>2*.ts`
- `src/core/swap.flows/*2<ETH,BNB,...>.ts`
- `src/core/swap.flows/*2<ETHTOKEN, BSCTOKEN, ...>.ts`
- `src/core/swap.swaps/index.ts`
- `src/core/swap.swaps/*Swap.ts`

if you're adding a new token standard
- `src/core/swap.app/util/<standard>.ts`

`*` = `GHOST`, for example


--------------------------------------------


## Additional changes

### Tests

- `tests/unit/...`
- `tests/e2e/swap/...`

### Update README

- `docs/core/README.md` (add coin to the tables)
- `docs/ADD_BLOCKCHAIN.md` (improve this doc)


--------------------------------------------


## Examples

### GHOST

- https://github.com/swaponline/MultiCurrencyWallet/pull/2891
- https://github.com/swaponline/swap.core/pull/500
- https://github.com/swaponline/swap.core/pull/501


### NEXT.coin

- [Task + PRs](https://github.com/swaponline/swap.core/issues/504)

### Matic token with ERC20 Token on Polygon(Matic)

- [Task](https://github.com/swaponline/MultiCurrencyWallet/issues/4448)
- [Pull request](https://github.com/swaponline/MultiCurrencyWallet/pull/4496)
