```
src/
├── back
│   └── nextcoin
│       ├── nextd-install.sh
│       ├── nextd-logs.sh
│       ├── nextd-start.sh
│       ├── nextd-stop.sh
│       ├── next-options.txt
│       ├── nextp.js
│       ├── nextp-logs.sh
│       ├── nextp-start.sh
│       ├── nextp-stop.sh
│       ├── next-rpc-methods.txt
│       ├── package.json
│       ├── README.md
│       └── request-example.sh
├── bot
│   ├── app
│   │   ├── actions
│   │   │   ├── errors
│   │   │   │   ├── handleError.ts
│   │   │   │   └── handleSwapError.ts
│   │   │   └── fetchPrice.ts
│   │   └── middlewares
│   │       └── prices.ts
│   ├── app.ts
│   ├── cli
│   │   ├── algo.ts
│   │   ├── data-worker.ts
│   │   ├── helpers
│   │   │   ├── getOrderId.ts
│   │   │   ├── help.ts
│   │   │   ├── methods.ts
│   │   │   ├── readline.ts
│   │   │   └── text.ts
│   │   ├── interface.ts
│   │   ├── run.ts
│   │   ├── socket-bot.ts
│   │   └── trade.ts
│   ├── config
│   │   ├── constants.ts
│   │   ├── mainnet
│   │   │   ├── index.ts
│   │   │   ├── PAIR_TYPES.ts
│   │   │   ├── TOKEN_DECIMALS.ts
│   │   │   ├── TOKENS.ts
│   │   │   ├── TRADE_CONFIG.ts
│   │   │   ├── TRADE_LIMITS.ts
│   │   │   ├── TRADE_ORDER_MINAMOUNTS.ts
│   │   │   └── TRADE_TICKERS.ts
│   │   ├── storage.ts
│   │   └── testnet
│   │       ├── index.ts
│   │       ├── PAIR_TYPES.ts
│   │       ├── TOKEN_DECIMALS.ts
│   │       ├── TOKENS.ts
│   │       ├── TRADE_CONFIG.ts
│   │       ├── TRADE_LIMITS.ts
│   │       ├── TRADE_ORDER_MINAMOUNTS.ts
│   │       └── TRADE_TICKERS.ts
│   ├── Dockerfile
│   ├── ecosystem.config.ts
│   ├── helpers
│   │   ├── debugFeedBack.ts
│   │   ├── find.ts
│   │   ├── index.ts
│   │   ├── route.ts
│   │   ├── swap.ts
│   │   └── views.ts
│   ├── index.ts
│   ├── jest.config.ts
│   ├── microbot
│   │   ├── actions
│   │   │   ├── book
│   │   │   │   ├── fetchPrice.spec.ts
│   │   │   │   ├── fillOrderbook.spec.ts
│   │   │   │   ├── fillOrderbook.ts
│   │   │   │   ├── handleKeyboardInput.ts
│   │   │   │   └── startSaved.ts
│   │   │   ├── incoming
│   │   │   │   └── handleRequest.ts
│   │   │   ├── index.ts
│   │   │   ├── outcoming
│   │   │   │   ├── doRequest.ts
│   │   │   │   ├── handleOrder.spec.ts
│   │   │   │   └── handleOrder.ts
│   │   │   ├── start
│   │   │   │   ├── beginSwap.ts
│   │   │   │   └── swapStatus.ts
│   │   │   └── swap-flow
│   │   │       ├── BTC2ETHFlow.ts
│   │   │       ├── ETH2BTCFlow.ts
│   │   │       ├── ETH2UTXOFlow.ts
│   │   │       ├── genSecret.ts
│   │   │       ├── index.ts
│   │   │       └── UTXO2ETHFlow.ts
│   │   ├── app.ts
│   │   ├── core
│   │   │   ├── beginSwap.ts
│   │   │   ├── checkAddress.ts
│   │   │   ├── checkParticipant.ts
│   │   │   ├── checkSwapsCountLimit.ts
│   │   │   ├── doRequest.ts
│   │   │   ├── fetchOrder.ts
│   │   │   ├── history.ts
│   │   │   ├── orders.ts
│   │   │   └── replyToRequest.ts
│   │   ├── index.ts
│   │   ├── lineInput.ts
│   │   ├── Pair.spec.ts
│   │   └── Pair.ts
│   ├── monitor.ts
│   ├── README.md
│   ├── routes
│   │   ├── auth.ts
│   │   ├── homepage
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   ├── info
│   │   │   └── index.ts
│   │   ├── kraken
│   │   │   └── index.ts
│   │   ├── me
│   │   │   ├── controller.ts
│   │   │   └── index.ts
│   │   ├── orders
│   │   │   ├── controller.ts
│   │   │   └── index.ts
│   │   ├── swaps
│   │   │   ├── controller.ts
│   │   │   └── index.ts
│   │   └── web
│   │       ├── home.html
│   │       └── js
│   │           ├── app.js
│   │           ├── bot.js
│   │           ├── history.js
│   │           ├── kraken.js
│   │           └── stats.js
│   ├── services
│   │   └── instances
│   │       └── kraken.ts
│   ├── swapApp.ts
│   ├── test
│   │   ├── order.example
│   │   ├── orders.ts
│   │   ├── README.md
│   │   ├── refund.sh
│   │   ├── testdrive.sh
│   │   └── token.example
│   ├── util
│   │   ├── listNotRefunded.ts
│   │   ├── refund.ts
│   │   └── repl.ts
│   ├── ws
│   │   ├── autopilot.ts
│   │   ├── run.ts
│   │   └── socket-bot.ts
│   └── ws.ts
├── common
│   ├── coins
│   │   ├── BTC.ts
│   │   ├── GHOST.ts
│   │   ├── index.ts
│   │   ├── interfaces.ts
│   │   ├── LTC.ts
│   │   └── NEXT.ts
│   ├── domain
│   │   ├── address.ts
│   │   ├── amount.ts
│   │   ├── coin.ts
│   │   └── network.ts
│   ├── examples
│   │   ├── send.ts
│   │   └── unspents.ts
│   ├── firebug
│   │   ├── errorIcon.png
│   │   ├── firebug.css
│   │   ├── firebug.html
│   │   ├── firebug.js
│   │   ├── firebugx.js
│   │   ├── infoIcon.png
│   │   └── warningIcon.png
│   ├── helpers
│   │   └── bip44.ts
│   ├── messaging
│   │   └── pubsubRoom
│   │       ├── connection.ts
│   │       ├── createP2PNode.ts
│   │       ├── direct-connection-handler.ts
│   │       ├── encoding.ts
│   │       ├── index.ts
│   │       └── protocol.ts
│   ├── tests
│   │   ├── test-accountFromMnemonic.ts
│   │   ├── test-getBalance.ts
│   │   └── tests.ts
│   ├── utils
│   │   ├── apiLooper.ts
│   │   ├── coin
│   │   │   ├── btc.ts
│   │   │   ├── eth.ts
│   │   │   ├── gost.ts
│   │   │   ├── interface.txt
│   │   │   └── next.ts
│   │   ├── colorString.ts
│   │   ├── getUnixTimeStamp.ts
│   │   ├── mnemonic.ts
│   │   ├── namedQuery.ts
│   │   └── request.ts
│   └── web3connect
│       ├── index.ts
│       └── providers
│           ├── index.ts
│           ├── InjectedProvider.ts
│           ├── InjectedType.ts
│           ├── supported.ts
│           └── WalletConnectProvider.ts
├── core
│   ├── index.ts
│   ├── simple
│   │   ├── examples
│   │   │   ├── bot.ts
│   │   │   ├── listFinished.ts
│   │   │   ├── listNotRefunded.ts
│   │   │   ├── package.json
│   │   │   ├── recover.ts
│   │   │   ├── refund.ts
│   │   │   ├── repl.ts
│   │   │   └── startSaved.ts
│   │   ├── jest.config.ts
│   │   ├── jest.setup.ts
│   │   ├── README.md
│   │   ├── src
│   │   │   ├── config
│   │   │   │   ├── common.ts
│   │   │   │   ├── getConfig.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── mainnet.ts
│   │   │   │   ├── setupLocalStorage.ts
│   │   │   │   ├── testnet.ts
│   │   │   │   └── tokenSwap.ts
│   │   │   ├── helpers
│   │   │   │   ├── checkService.ts
│   │   │   │   ├── filter.ts
│   │   │   │   ├── history.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── on.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── request.ts
│   │   │   │   ├── room.ts
│   │   │   │   └── swap.ts
│   │   │   ├── index.ts
│   │   │   ├── instances
│   │   │   │   ├── ethereum.ts
│   │   │   │   └── index.ts
│   │   │   ├── setup.ts
│   │   │   └── wallet
│   │   │       └── index.ts
│   │   └── tests
│   │       ├── CustomConfig.test.ts
│   │       ├── SwapApp.test.ts
│   │       ├── SwapOrders.test.ts
│   │       └── SwapWallet.test.ts
│   ├── swap.app
│   │   ├── Collection.ts
│   │   ├── constants
│   │   │   ├── COINS.ts
│   │   │   ├── ENV.ts
│   │   │   ├── index.ts
│   │   │   ├── NETWORKS.ts
│   │   │   ├── PAIR_TYPES.ts
│   │   │   ├── SERVICES.ts
│   │   │   └── TRADE_TICKERS.ts
│   │   ├── Events.ts
│   │   ├── index.ts
│   │   ├── ServiceInterface.ts
│   │   ├── StorageFactory.ts
│   │   ├── SwapApp.ts
│   │   ├── SwapInterface.ts
│   │   └── util
│   │       ├── erc20.ts
│   │       ├── helpers.ts
│   │       ├── index.ts
│   │       ├── pullProps.ts
│   │       └── typeforce.ts
│   ├── swap.auth
│   │   ├── btc.ts
│   │   ├── eth.ts
│   │   ├── ghost.ts
│   │   ├── index.ts
│   │   ├── next.ts
│   │   └── SwapAuth.ts
│   ├── swap.flows
│   │   ├── BTC2ETHTOKEN.ts
│   │   ├── BTC2ETH.ts
│   │   ├── ETH2BTC.ts
│   │   ├── ETH2GHOST.ts
│   │   ├── ETH2NEXT.ts
│   │   ├── ETHTOKEN2BTC.ts
│   │   ├── ETHTOKEN2GHOST.ts
│   │   ├── ETHTOKEN2NEXT.ts
│   │   ├── ETHTOKEN2USDT.ts
│   │   ├── GHOST2BTC.ts
│   │   ├── GHOST2ETHTOKEN.ts
│   │   ├── GHOST2ETH.ts
│   │   ├── index.ts
│   │   ├── NEXT2BTC.ts
│   │   ├── NEXT2ETHTOKEN.ts
│   │   ├── NEXT2ETH.ts
│   │   └── USDT2ETHTOKEN.ts
│   ├── swap.orders
│   │   ├── aggregation.ts
│   │   ├── events.ts
│   │   ├── index.ts
│   │   ├── Order.ts
│   │   ├── Pair.ts
│   │   └── SwapOrders.ts
│   ├── swap.room
│   │   ├── index.ts
│   │   └── SwapRoom.ts
│   ├── swap.swap
│   │   ├── Flow.ts
│   │   ├── index.ts
│   │   ├── Room.ts
│   │   ├── Steps.ts
│   │   └── Swap.ts
│   ├── swap.swaps
│   │   ├── BtcSwap.ts
│   │   ├── EthSwap.ts
│   │   ├── EthTokenSwap.ts
│   │   ├── GhostSwap.ts
│   │   ├── index.ts
│   │   ├── integration
│   │   │   └── BtcLikeSwap.js
│   │   ├── NextSwap.ts
│   │   ├── usdt
│   │   │   ├── funding_tx.ts
│   │   │   ├── omni_script.test.ts
│   │   │   ├── omni_script.ts
│   │   │   ├── omni_tx.ts
│   │   │   └── swap_script.ts
│   │   └── UsdtSwap.ts
│   ├── tests
│   │   ├── btcSwap.test.ts
│   │   ├── config.ts
│   │   ├── ethSwap.test.ts
│   │   ├── fixtures
│   │   │   ├── index.ts
│   │   │   └── unspents.ts
│   │   ├── index.test.ts
│   │   ├── Pair.test.ts
│   │   ├── setupSwapApp.ts
│   │   └── swap.test.ts
│   └── webpack.config.babel.js
├── front
│   ├── bin
│   │   ├── bootstrap.js
│   │   ├── compile
│   │   │   ├── compile.js
│   │   │   └── index.js
│   │   └── server
│   │       ├── index.js
│   │       └── server.js
│   ├── chrome-extension
│   │   ├── extension
│   │   │   ├── images
│   │   │   │   └── icons
│   │   │   │       ├── icon-16.png
│   │   │   │       ├── icon-196.png
│   │   │   │       └── icon-32.png
│   │   │   └── js
│   │   │       └── background.js
│   │   └── manifest.json
│   ├── client
│   │   ├── favicon.png
│   │   ├── firebase-messaging-sw.js
│   │   ├── fonts
│   │   │   └── Manrope
│   │   │       ├── index.css
│   │   │       ├── manrope-bold.otf
│   │   │       ├── manrope-bold.woff
│   │   │       ├── manrope-bold.woff2
│   │   │       ├── manrope-extrabold.otf
│   │   │       ├── manrope-extrabold.woff
│   │   │       ├── manrope-extrabold.woff2
│   │   │       ├── manrope-light.otf
│   │   │       ├── manrope-light.woff
│   │   │       ├── manrope-light.woff2
│   │   │       ├── manrope-medium.otf
│   │   │       ├── manrope-medium.woff
│   │   │       ├── manrope-medium.woff2
│   │   │       ├── manrope-regular.otf
│   │   │       ├── manrope-regular.woff
│   │   │       ├── manrope-regular.woff2
│   │   │       ├── manrope-semibold.otf
│   │   │       ├── manrope-semibold.woff
│   │   │       ├── manrope-semibold.woff2
│   │   │       ├── manrope-thin.otf
│   │   │       ├── manrope-thin.woff
│   │   │       ├── manrope-thin.woff2
│   │   │       └── package.json
│   │   ├── images
│   │   │   └── logo.png
│   │   ├── index.html
│   │   ├── index.tsx
│   │   └── scss
│   │       ├── app.scss
│   │       ├── config
│   │       │   ├── index.scss
│   │       │   ├── mixins
│   │       │   │   ├── _common.scss
│   │       │   │   ├── _fonts.scss
│   │       │   │   ├── index.scss
│   │       │   │   ├── indexWidget.scss
│   │       │   │   ├── _media.scss
│   │       │   │   └── _mediaWidget.scss
│   │       │   ├── vars
│   │       │   │   ├── _animations.scss
│   │       │   │   ├── _colors.scss
│   │       │   │   ├── index.scss
│   │       │   │   ├── _media.scss
│   │       │   │   └── _sizes.scss
│   │       │   └── widget.scss
│   │       └── fonts
│   │           ├── index.scss
│   │           └── _manrope.scss
│   ├── config
│   │   ├── chrome-extension-mainnet.prod.js
│   │   ├── chrome-extension-testnet.prod.js
│   │   ├── default.js
│   │   ├── mainnet
│   │   │   ├── api.js
│   │   │   ├── erc20.js
│   │   │   ├── feeRates.js
│   │   │   ├── hiddenCoins.js
│   │   │   ├── index.js
│   │   │   ├── link.js
│   │   │   ├── noExchangeCoins.js
│   │   │   ├── pubsubRoom.js
│   │   │   ├── swapConfig.js
│   │   │   ├── swapContract.js
│   │   │   └── web3.js
│   │   ├── mainnet.dev.js
│   │   ├── mainnet.firebug.js
│   │   ├── mainnet-local.prod.js
│   │   ├── mainnet.pages.prod.js
│   │   ├── mainnet.prod.js
│   │   ├── mainnet.widget.dev.js
│   │   ├── mainnet.widget.prod.js
│   │   ├── testnet
│   │   │   ├── api.js
│   │   │   ├── erc20.js
│   │   │   ├── feeRates.js
│   │   │   ├── hiddenCoins.js
│   │   │   ├── index.js
│   │   │   ├── link.js
│   │   │   ├── noExchangeCoins.js
│   │   │   ├── pubsubRoom.js
│   │   │   ├── swapConfig.js
│   │   │   ├── swapContract.js
│   │   │   └── web3.js
│   │   ├── testnet.dev.js
│   │   ├── testnet.firebug.js
│   │   ├── testnet-local.prod.js
│   │   ├── testnet.prod.js
│   │   ├── testnet.widget.dev.js
│   │   └── testnet.widget.prod.js
│   ├── custom.d.ts
│   ├── externalConfigs
│   │   ├── mainnet-default.js
│   │   ├── mainnet-localhost.js
│   │   ├── swaponline.github.io.js
│   │   └── testnet-default.js
│   ├── global.d.ts
│   ├── local_modules
│   │   ├── app-config
│   │   │   ├── client.js
│   │   │   ├── index.js
│   │   │   └── webpack.js
│   │   └── sw-valuelink
│   │       ├── index.ts
│   │       └── tags.tsx
│   ├── shared
│   │   ├── components
│   │   │   ├── AdminFeeInfoBlock
│   │   │   │   ├── AdminFeeInfoBlock.scss
│   │   │   │   └── AdminFeeInfoBlock.tsx
│   │   │   ├── Avatar
│   │   │   │   ├── Avatar.scss
│   │   │   │   └── Avatar.tsx
│   │   │   ├── BalanceForm
│   │   │   │   ├── BalanceForm.tsx
│   │   │   │   └── images
│   │   │   │       ├── btcIcon.svg
│   │   │   │       ├── dollar2.svg
│   │   │   │       ├── dollar.svg
│   │   │   │       └── index.ts
│   │   │   ├── Coin
│   │   │   │   ├── Coin.scss
│   │   │   │   └── Coin.tsx
│   │   │   ├── Coins
│   │   │   │   ├── Coins.scss
│   │   │   │   └── Coins.tsx
│   │   │   ├── Comment
│   │   │   │   ├── Comment.scss
│   │   │   │   └── Comment.tsx
│   │   │   ├── Confirm
│   │   │   │   ├── Confirm.scss
│   │   │   │   └── Confirm.tsx
│   │   │   ├── controls
│   │   │   │   ├── Button
│   │   │   │   │   ├── Button.scss
│   │   │   │   │   └── Button.tsx
│   │   │   │   ├── CurrencyButton
│   │   │   │   │   ├── CurrencyButton.scss
│   │   │   │   │   └── CurrencyButton.tsx
│   │   │   │   ├── DepositButton
│   │   │   │   │   ├── DepositButton.scss
│   │   │   │   │   └── DepositButton.tsx
│   │   │   │   ├── Flip
│   │   │   │   │   ├── Flip.scss
│   │   │   │   │   ├── Flip.tsx
│   │   │   │   │   └── images
│   │   │   │   │       └── flip.svg
│   │   │   │   ├── index.ts
│   │   │   │   ├── RemoveButton
│   │   │   │   │   ├── RemoveButton.scss
│   │   │   │   │   └── RemoveButton.tsx
│   │   │   │   ├── ShareButton
│   │   │   │   │   ├── images
│   │   │   │   │   │   └── icon.svg
│   │   │   │   │   ├── ShareButton.scss
│   │   │   │   │   └── ShareButton.tsx
│   │   │   │   ├── ShareLink
│   │   │   │   │   ├── ShareLink.scss
│   │   │   │   │   └── ShareLink.tsx
│   │   │   │   ├── Switching
│   │   │   │   │   ├── images
│   │   │   │   │   │   └── swapIcon.svg
│   │   │   │   │   ├── Switching.scss
│   │   │   │   │   └── Switching.tsx
│   │   │   │   ├── TimerButton
│   │   │   │   │   └── TimerButton.tsx
│   │   │   │   ├── Toggle
│   │   │   │   │   ├── Toggle.scss
│   │   │   │   │   └── Toggle.tsx
│   │   │   │   └── WithdrawButton
│   │   │   │       ├── BtnTooltip.tsx
│   │   │   │       ├── WithdrawButton.scss
│   │   │   │       └── WithdrawButton.tsx
│   │   │   ├── CurrencyDirectionChooser
│   │   │   │   ├── CurrencyDirectionChooser.scss
│   │   │   │   └── CurrencyDirectionChooser.tsx
│   │   │   ├── ErrorPageNoSSL
│   │   │   │   ├── ErrorPageNoSSL.scss
│   │   │   │   └── ErrorPageNoSSL.tsx
│   │   │   ├── FAQ
│   │   │   │   ├── FAQ.tsx
│   │   │   │   └── styles.scss
│   │   │   ├── FaqExpandableItem
│   │   │   │   ├── FaqExpandableItem.scss
│   │   │   │   └── FaqExpandableItem.tsx
│   │   │   ├── FeeInfoBlock
│   │   │   │   ├── FeeInfoBlock.scss
│   │   │   │   └── FeeInfoBlock.tsx
│   │   │   ├── FilterForm
│   │   │   │   ├── FilterForm.tsx
│   │   │   │   └── styles.scss
│   │   │   ├── Footer
│   │   │   │   ├── Footer.scss
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Links
│   │   │   │   │   ├── Links.scss
│   │   │   │   │   └── Links.tsx
│   │   │   │   ├── ProgressBar
│   │   │   │   │   └── ProgressBar.tsx
│   │   │   │   ├── Referral
│   │   │   │   │   ├── Referral.scss
│   │   │   │   │   └── Referral.tsx
│   │   │   │   ├── SocialMenu
│   │   │   │   │   ├── SocialMenu.scss
│   │   │   │   │   └── SocialMenu.tsx
│   │   │   │   └── SwitchLang
│   │   │   │       ├── SwitchLang.scss
│   │   │   │       └── SwitchLang.tsx
│   │   │   ├── forms
│   │   │   │   ├── FieldLabel
│   │   │   │   │   ├── FieldLabel.scss
│   │   │   │   │   └── FieldLabel.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── Input
│   │   │   │   │   ├── Input.scss
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   └── style.css
│   │   │   │   ├── MnemonicInput
│   │   │   │   │   ├── MnemonicInput.css
│   │   │   │   │   └── MnemonicInput.tsx
│   │   │   │   ├── PhoneInput
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   └── TextArea
│   │   │   │       └── TextArea.tsx
│   │   │   ├── Header
│   │   │   │   ├── config.tsx
│   │   │   │   ├── Header.scss
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Logo
│   │   │   │   │   ├── Logo.scss
│   │   │   │   │   └── Logo.tsx
│   │   │   │   ├── Nav
│   │   │   │   │   ├── images
│   │   │   │   │   │   └── ArrowDown.svg
│   │   │   │   │   ├── Nav.scss
│   │   │   │   │   └── Nav.tsx
│   │   │   │   ├── NavMobile
│   │   │   │   │   ├── NavMobile.scss
│   │   │   │   │   └── NavMobile.tsx
│   │   │   │   ├── SubMenu
│   │   │   │   │   ├── SubMenu.scss
│   │   │   │   │   └── SubMenu.tsx
│   │   │   │   ├── ThemeSwitcher.tsx
│   │   │   │   ├── TourPartial
│   │   │   │   │   └── TourPartial.tsx
│   │   │   │   ├── User
│   │   │   │   │   ├── Question
│   │   │   │   │   │   ├── Question.scss
│   │   │   │   │   │   └── Question.tsx
│   │   │   │   │   ├── UserAvatar
│   │   │   │   │   │   ├── images
│   │   │   │   │   │   │   ├── avatar.jpg
│   │   │   │   │   │   │   └── avatar.svg
│   │   │   │   │   │   ├── UserAvatar.scss
│   │   │   │   │   │   └── UserAvatar.tsx
│   │   │   │   │   ├── User.scss
│   │   │   │   │   ├── UserTooltip
│   │   │   │   │   │   ├── images
│   │   │   │   │   │   │   ├── accept.svg
│   │   │   │   │   │   │   ├── arrow-right.svg
│   │   │   │   │   │   │   └── close.svg
│   │   │   │   │   │   ├── UserTooltip.scss
│   │   │   │   │   │   └── UserTooltip.tsx
│   │   │   │   │   └── User.tsx
│   │   │   │   ├── WalletTour
│   │   │   │   │   └── WalletTour.tsx
│   │   │   │   └── WidgetTours
│   │   │   │       ├── index.ts
│   │   │   │       └── WidgetWalletTour.tsx
│   │   │   ├── Href
│   │   │   │   ├── Href.scss
│   │   │   │   ├── Href.tsx
│   │   │   │   └── TransactionLink.tsx
│   │   │   ├── InvoiceInfoBlock
│   │   │   │   ├── InvoiceInfoBlock.scss
│   │   │   │   └── InvoiceInfoBlock.tsx
│   │   │   ├── layout
│   │   │   │   ├── Center
│   │   │   │   │   ├── Center.scss
│   │   │   │   │   └── Center.tsx
│   │   │   │   ├── DashboardLayout
│   │   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   ├── Overlay
│   │   │   │   │   ├── Overlay.scss
│   │   │   │   │   └── Overlay.tsx
│   │   │   │   ├── ScrollToTop
│   │   │   │   │   └── ScrollToTop.ts
│   │   │   │   ├── WidthContainer
│   │   │   │   │   ├── WidthContainer.scss
│   │   │   │   │   └── WidthContainer.tsx
│   │   │   │   ├── WidthContainerCompensator
│   │   │   │   │   ├── WidthContainerCompensator.scss
│   │   │   │   │   └── WidthContainerCompensator.tsx
│   │   │   │   └── Wrapper
│   │   │   │       ├── Wrapper.scss
│   │   │   │       └── Wrapper.tsx
│   │   │   ├── loaders
│   │   │   │   ├── ContentLoader
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── BalanceSection
│   │   │   │   │   │   │   └── BalanceSection.tsx
│   │   │   │   │   │   ├── BannersSection
│   │   │   │   │   │   │   └── BannersSection.tsx
│   │   │   │   │   │   ├── ContentSection
│   │   │   │   │   │   │   └── ContentSection.tsx
│   │   │   │   │   │   └── DescrSection
│   │   │   │   │   │       └── DescrSection.tsx
│   │   │   │   │   ├── ContentLoader.scss
│   │   │   │   │   ├── ContentLoader.tsx
│   │   │   │   │   └── ElementLoading.scss
│   │   │   │   ├── InlineLoader
│   │   │   │   │   ├── InlineLoader.scss
│   │   │   │   │   └── InlineLoader.tsx
│   │   │   │   ├── Loader
│   │   │   │   │   ├── Loader.scss
│   │   │   │   │   └── Loader.tsx
│   │   │   │   └── RequestLoader
│   │   │   │       └── RequestLoader.tsx
│   │   │   ├── modal
│   │   │   │   ├── index.ts
│   │   │   │   ├── Modal
│   │   │   │   │   ├── Modal.scss
│   │   │   │   │   └── Modal.tsx
│   │   │   │   ├── ModalBox
│   │   │   │   │   ├── ModalBox.scss
│   │   │   │   │   └── ModalBox.tsx
│   │   │   │   ├── ModalConductor
│   │   │   │   │   ├── ModalConductor.scss
│   │   │   │   │   └── ModalConductor.tsx
│   │   │   │   ├── ModalConductorProvider
│   │   │   │   │   ├── ModalConductorProvider.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   └── ModalContainer
│   │   │   │       ├── ModalContainer.scss
│   │   │   │       └── ModalContainer.tsx
│   │   │   ├── modals
│   │   │   │   ├── AddCustomERC20
│   │   │   │   │   ├── AddCustomERC20.scss
│   │   │   │   │   └── AddCustomERC20.tsx
│   │   │   │   ├── Alert
│   │   │   │   │   ├── AlertModal.scss
│   │   │   │   │   └── AlertModal.tsx
│   │   │   │   ├── AlertWindow
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   ├── Approve
│   │   │   │   │   ├── Approve.scss
│   │   │   │   │   └── Approve.tsx
│   │   │   │   ├── BtcMultisignConfirmTx
│   │   │   │   │   ├── BtcMultisignConfirmTx.scss
│   │   │   │   │   └── BtcMultisignConfirmTx.tsx
│   │   │   │   ├── BtcMultisignSwitch
│   │   │   │   │   ├── BtcMultisignSwitch.scss
│   │   │   │   │   ├── BtcMultisignSwitch.tsx
│   │   │   │   │   ├── WalletRow.scss
│   │   │   │   │   └── WalletRow.tsx
│   │   │   │   ├── Confirm
│   │   │   │   │   ├── Confirm.scss
│   │   │   │   │   └── Confirm.tsx
│   │   │   │   ├── ConfirmBeginSwap
│   │   │   │   │   ├── ConfirmBeginSwap.scss
│   │   │   │   │   └── ConfirmBeginSwap.tsx
│   │   │   │   ├── ConnectWalletModal
│   │   │   │   │   ├── ConnectWalletModal.scss
│   │   │   │   │   └── ConnectWalletModal.tsx
│   │   │   │   ├── CurrencyAction
│   │   │   │   │   ├── CurrencyAction.scss
│   │   │   │   │   ├── CurrencyAction.tsx
│   │   │   │   │   └── images
│   │   │   │   │       └── index.ts
│   │   │   │   ├── DeclineOrdersModal
│   │   │   │   │   ├── DeclineOrdersModal.scss
│   │   │   │   │   └── DeclineOrdersModal.tsx
│   │   │   │   ├── DownloadModal
│   │   │   │   │   ├── DownloadModal.scss
│   │   │   │   │   └── DownloadModal.tsx
│   │   │   │   ├── EthChecker
│   │   │   │   │   ├── EthChecker.scss
│   │   │   │   │   └── EthChecker.tsx
│   │   │   │   ├── HowToExportModal
│   │   │   │   │   ├── HowToExportModal.scss
│   │   │   │   │   └── HowToExportModal.tsx
│   │   │   │   ├── HowToWithdrawModal
│   │   │   │   │   ├── HowToWithdrawModal.scss
│   │   │   │   │   └── HowToWithdrawModal.tsx
│   │   │   │   ├── IncompletedSwaps
│   │   │   │   │   ├── IncompletedSwaps.scss
│   │   │   │   │   └── IncompletedSwaps.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── InfoInvoice
│   │   │   │   │   ├── images
│   │   │   │   │   │   ├── cancel.svg
│   │   │   │   │   │   ├── pending.svg
│   │   │   │   │   │   └── ready.svg
│   │   │   │   │   ├── InfoInvoice.scss
│   │   │   │   │   └── InfoInvoice.tsx
│   │   │   │   ├── InfoPay
│   │   │   │   │   ├── InfoPay.scss
│   │   │   │   │   └── InfoPay.tsx
│   │   │   │   ├── InvoiceLinkModal
│   │   │   │   │   ├── InvoiceLinkModal.scss
│   │   │   │   │   └── InvoiceLinkModal.tsx
│   │   │   │   ├── InvoiceModal
│   │   │   │   │   ├── InvoiceModal.scss
│   │   │   │   │   └── InvoiceModal.tsx
│   │   │   │   ├── MobMenu
│   │   │   │   │   ├── MobMenu.scss
│   │   │   │   │   └── MobMenu.tsx
│   │   │   │   ├── MultisignJoinLink
│   │   │   │   │   ├── MultisignJoinLink.scss
│   │   │   │   │   └── MultisignJoinLink.tsx
│   │   │   │   ├── OfferModal
│   │   │   │   │   ├── AddOffer
│   │   │   │   │   │   ├── AddOffer.scss
│   │   │   │   │   │   ├── AddOffer.tsx
│   │   │   │   │   │   ├── ExchangeRateGroup
│   │   │   │   │   │   │   ├── ExchangeRateGroup.scss
│   │   │   │   │   │   │   └── ExchangeRateGroup.tsx
│   │   │   │   │   │   ├── Group
│   │   │   │   │   │   │   ├── Group.scss
│   │   │   │   │   │   │   └── Group.tsx
│   │   │   │   │   │   ├── Select
│   │   │   │   │   │   │   ├── Select.scss
│   │   │   │   │   │   │   └── Select.tsx
│   │   │   │   │   │   └── SelectGroup
│   │   │   │   │   │       ├── SelectGroup.scss
│   │   │   │   │   │       └── SelectGroup.tsx
│   │   │   │   │   ├── ConfirmOffer
│   │   │   │   │   │   ├── Amounts
│   │   │   │   │   │   │   ├── Amounts.scss
│   │   │   │   │   │   │   └── Amounts.tsx
│   │   │   │   │   │   ├── ConfirmOffer.scss
│   │   │   │   │   │   ├── ConfirmOffer.tsx
│   │   │   │   │   │   ├── ExchangeRate
│   │   │   │   │   │   │   ├── ExchangeRate.scss
│   │   │   │   │   │   │   └── ExchangeRate.tsx
│   │   │   │   │   │   ├── Fee
│   │   │   │   │   │   │   └── Fee.tsx
│   │   │   │   │   │   ├── Row
│   │   │   │   │   │   │   ├── Row.scss
│   │   │   │   │   │   │   └── Row.tsx
│   │   │   │   │   │   └── Value
│   │   │   │   │   │       ├── Value.scss
│   │   │   │   │   │       └── Value.tsx
│   │   │   │   │   ├── OfferModal.scss
│   │   │   │   │   └── OfferModal.tsx
│   │   │   │   ├── PrivateKeysModal
│   │   │   │   │   ├── PrivateKeysModal.scss
│   │   │   │   │   └── PrivateKeysModal.tsx
│   │   │   │   ├── ReceiveModal
│   │   │   │   │   ├── ReceiveModal.scss
│   │   │   │   │   └── ReceiveModal.tsx
│   │   │   │   ├── RegisterPINProtected
│   │   │   │   │   ├── RegisterPINProtected.scss
│   │   │   │   │   └── RegisterPINProtected.tsx
│   │   │   │   ├── RegisterSMSProtected
│   │   │   │   │   ├── RegisterSMSProtected.scss
│   │   │   │   │   └── RegisterSMSProtected.tsx
│   │   │   │   ├── RestoryMnemonicWallet
│   │   │   │   │   ├── RestoryMnemonicWallet.scss
│   │   │   │   │   └── RestoryMnemonicWallet.tsx
│   │   │   │   ├── SaveKeysModal
│   │   │   │   │   ├── SaveKeysModal.scss
│   │   │   │   │   └── SaveKeysModal.tsx
│   │   │   │   ├── SaveMnemonicModal
│   │   │   │   │   ├── SaveMnemonicModal.scss
│   │   │   │   │   └── SaveMnemonicModal.tsx
│   │   │   │   ├── Share
│   │   │   │   │   ├── Share.scss
│   │   │   │   │   └── Share.tsx
│   │   │   │   ├── SignUpModal
│   │   │   │   │   ├── SignUpModal.scss
│   │   │   │   │   └── SignUpModal.tsx
│   │   │   │   ├── Styles
│   │   │   │   │   └── default.scss
│   │   │   │   ├── SweepToMnemonicKeys
│   │   │   │   │   ├── SweepToMnemonicKeys.scss
│   │   │   │   │   └── SweepToMnemonicKeys.tsx
│   │   │   │   ├── WalletAddressModal
│   │   │   │   │   ├── WalletAddressModal.scss
│   │   │   │   │   └── WalletAddressModal.tsx
│   │   │   │   ├── WithdrawBtcMultisig
│   │   │   │   │   ├── WithdrawBtcMultisig.scss
│   │   │   │   │   └── WithdrawBtcMultisig.tsx
│   │   │   │   ├── WithdrawBtcPin
│   │   │   │   │   ├── WithdrawBtcPin.scss
│   │   │   │   │   └── WithdrawBtcPin.tsx
│   │   │   │   ├── WithdrawBtcSms
│   │   │   │   │   ├── WithdrawBtcSms.scss
│   │   │   │   │   └── WithdrawBtcSms.tsx
│   │   │   │   ├── WithdrawModal
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── CurrencyList.scss
│   │   │   │   │   │   └── CurrencyList.tsx
│   │   │   │   │   ├── WithdrawModal.scss
│   │   │   │   │   └── WithdrawModal.tsx
│   │   │   │   └── WithdrawModalMultisig
│   │   │   │       ├── WithdrawModalMultisig.scss
│   │   │   │       ├── WithdrawModalMultisig.tsx
│   │   │   │       ├── WithdrawModalMultisigUser.scss
│   │   │   │       └── WithdrawModalMultisigUser.tsx
│   │   │   ├── NetworkStatus
│   │   │   │   ├── NetworkStatus.scss
│   │   │   │   └── NetworkStatus.tsx
│   │   │   ├── notification
│   │   │   │   ├── Notification
│   │   │   │   │   ├── Notification.scss
│   │   │   │   │   └── Notification.tsx
│   │   │   │   └── NotificationConductor
│   │   │   │       ├── NotificationConductor.scss
│   │   │   │       └── NotificationConductor.tsx
│   │   │   ├── notifications
│   │   │   │   ├── BTCMultisignRequest
│   │   │   │   │   ├── BTCMultisignRequest.scss
│   │   │   │   │   └── BTCMultisignRequest.tsx
│   │   │   │   ├── ErrorNotification
│   │   │   │   │   └── ErrorNotification.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── Message
│   │   │   │   │   ├── Message.scss
│   │   │   │   │   └── Message.tsx
│   │   │   │   └── SuccessWithdraw
│   │   │   │       ├── SuccessWithdraw.scss
│   │   │   │       └── SuccessWithdraw.tsx
│   │   │   ├── PageHeadline
│   │   │   │   ├── PageHeadline.scss
│   │   │   │   ├── PageHeadline.tsx
│   │   │   │   ├── SubTitle
│   │   │   │   │   ├── SubTitle.scss
│   │   │   │   │   └── SubTitle.tsx
│   │   │   │   └── Title
│   │   │   │       ├── Title.scss
│   │   │   │       └── Title.tsx
│   │   │   ├── PreventMultiTabs
│   │   │   │   └── PreventMultiTabs.tsx
│   │   │   ├── QR
│   │   │   │   ├── QR.scss
│   │   │   │   └── QR.tsx
│   │   │   ├── QrReader
│   │   │   │   ├── index.tsx
│   │   │   │   └── styles.scss
│   │   │   ├── Row
│   │   │   │   ├── Row.scss
│   │   │   │   └── Row.tsx
│   │   │   ├── SaveKeys
│   │   │   │   ├── Field
│   │   │   │   │   ├── Field.scss
│   │   │   │   │   └── Field.tsx
│   │   │   │   ├── SaveKeys.scss
│   │   │   │   └── SaveKeys.tsx
│   │   │   ├── Seo
│   │   │   │   ├── JsonLd.tsx
│   │   │   │   ├── PageSeo.tsx
│   │   │   │   └── Seo.tsx
│   │   │   ├── tables
│   │   │   │   ├── InfiniteScrollTable
│   │   │   │   │   └── InfiniteScrollTable.tsx
│   │   │   │   └── Table
│   │   │   │       ├── Table.scss
│   │   │   │       └── Table.tsx
│   │   │   ├── Timer
│   │   │   │   └── Timer.ts
│   │   │   ├── TourWindow
│   │   │   │   ├── index.tsx
│   │   │   │   └── styles.scss
│   │   │   └── ui
│   │   │       ├── Address
│   │   │       │   ├── Address.scss
│   │   │       │   └── Address.tsx
│   │   │       ├── CloseIcon
│   │   │       │   ├── CloseIcon.scss
│   │   │       │   └── CloseIcon.tsx
│   │   │       ├── Copy
│   │   │       │   ├── Copy.scss
│   │   │       │   └── Copy.tsx
│   │   │       ├── CurrencyIcon
│   │   │       │   ├── CurrencyIcon.scss
│   │   │       │   ├── CurrencyIcon.tsx
│   │   │       │   └── images
│   │   │       │       ├── arn.svg
│   │   │       │       ├── bnb.svg
│   │   │       │       ├── btc.svg
│   │   │       │       ├── bxb.svg
│   │   │       │       ├── dcn.svg
│   │   │       │       ├── drt.svg
│   │   │       │       ├── eth.svg
│   │   │       │       ├── eurs.svg
│   │   │       │       ├── ghost.svg
│   │   │       │       ├── icx.svg
│   │   │       │       ├── index.ts
│   │   │       │       ├── key.svg
│   │   │       │       ├── knc.png
│   │   │       │       ├── kn.svg
│   │   │       │       ├── lev.svg
│   │   │       │       ├── next.svg
│   │   │       │       ├── nim.svg
│   │   │       │       ├── omg.svg
│   │   │       │       ├── pay.png
│   │   │       │       ├── scro.svg
│   │   │       │       ├── swap.svg
│   │   │       │       ├── syc2.svg
│   │   │       │       ├── usdt.svg
│   │   │       │       ├── waves.svg
│   │   │       │       ├── xlm.svg
│   │   │       │       ├── xrp.svg
│   │   │       │       └── yup.svg
│   │   │       ├── CurrencySelect
│   │   │       │   ├── CurrencySelect.scss
│   │   │       │   ├── CurrencySelect.tsx
│   │   │       │   └── Option
│   │   │       │       ├── Option.scss
│   │   │       │       └── Option.tsx
│   │   │       ├── DropDown
│   │   │       │   ├── DropDown.scss
│   │   │       │   ├── DropDown.tsx
│   │   │       │   └── images
│   │   │       │       └── close.svg
│   │   │       ├── DropdownMenu
│   │   │       │   ├── DropdownMenu.scss
│   │   │       │   ├── DropdownMenu.tsx
│   │   │       │   └── images
│   │   │       │       ├── dots.svg
│   │   │       │       └── greyDots.svg
│   │   │       ├── MenuIcon
│   │   │       │   ├── images
│   │   │       │   │   └── menu.svg
│   │   │       │   ├── MenuIcon.scss
│   │   │       │   └── MenuIcon.tsx
│   │   │       ├── Panel
│   │   │       │   ├── Panel.scss
│   │   │       │   └── Panel.tsx
│   │   │       └── Tooltip
│   │   │           ├── ThemeTooltip.tsx
│   │   │           ├── Tooltip.scss
│   │   │           └── Tooltip.tsx
│   │   ├── containers
│   │   │   ├── App
│   │   │   │   ├── App.scss
│   │   │   │   └── App.tsx
│   │   │   ├── Core
│   │   │   │   └── Core.tsx
│   │   │   └── Root
│   │   │       ├── IntlProviderContainer.tsx
│   │   │       └── Root.tsx
│   │   ├── decorators
│   │   │   └── withInfiniteScroll.tsx
│   │   ├── helpers
│   │   │   ├── adminFee.ts
│   │   │   ├── apiLooper.ts
│   │   │   ├── api.ts
│   │   │   ├── btc.ts
│   │   │   ├── cache.ts
│   │   │   ├── constants
│   │   │   │   ├── coinsWithDynamicFee.ts
│   │   │   │   ├── customEcxchangeRate.ts
│   │   │   │   ├── DEFAULT_FEE_RATES.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── localStorage.ts
│   │   │   │   ├── minAmountOffer.ts
│   │   │   │   ├── minAmount.ts
│   │   │   │   ├── modals.ts
│   │   │   │   ├── notifications.ts
│   │   │   │   ├── PAIR_TYPES.ts
│   │   │   │   ├── privateKeyNames.ts
│   │   │   │   ├── TOKEN_DECIMALS.ts
│   │   │   │   └── TRADE_TICKERS.ts
│   │   │   ├── domUtils.ts
│   │   │   ├── estimateFeeValue.ts
│   │   │   ├── ethToken.ts
│   │   │   ├── eth.ts
│   │   │   ├── event.ts
│   │   │   ├── externalConfig.ts
│   │   │   ├── feedback.ts
│   │   │   ├── firebase
│   │   │   │   ├── config
│   │   │   │   │   ├── firebase-client-config.ts
│   │   │   │   │   └── firebase.ts
│   │   │   │   ├── firestore.ts
│   │   │   │   └── index.ts
│   │   │   ├── getCurrencyKey.ts
│   │   │   ├── getItezUrl.ts
│   │   │   ├── getPageOffset.ts
│   │   │   ├── getPairFees.ts
│   │   │   ├── getScrollBarWidth.ts
│   │   │   ├── getTopLocation.ts
│   │   │   ├── getUnixTimeStamp.ts
│   │   │   ├── getWalletLink.ts
│   │   │   ├── ghost.ts
│   │   │   ├── handleGoTrade.ts
│   │   │   ├── ignoreProps.ts
│   │   │   ├── index.ts
│   │   │   ├── links.ts
│   │   │   ├── locale.ts
│   │   │   ├── localStorage.ts
│   │   │   ├── locationPaths.ts
│   │   │   ├── lsDataCache.ts
│   │   │   ├── metamask.ts
│   │   │   ├── migrations
│   │   │   │   ├── 001_initMigration.ts
│   │   │   │   └── index.ts
│   │   │   ├── next.ts
│   │   │   ├── redirectTo.ts
│   │   │   ├── seo.ts
│   │   │   ├── Sound
│   │   │   │   └── alert.mp4
│   │   │   ├── stats.swaponline.ts
│   │   │   ├── swapsExplorer.ts
│   │   │   ├── transactions.ts
│   │   │   ├── user.ts
│   │   │   ├── utils.ts
│   │   │   ├── version.ts
│   │   │   ├── web3.ts
│   │   │   └── wpLogoutModal.ts
│   │   ├── images
│   │   │   ├── custom.svg
│   │   │   ├── index.ts
│   │   │   ├── liquality.png
│   │   │   ├── logo
│   │   │   │   ├── logo-black.svg
│   │   │   │   └── logo-colored.svg
│   │   │   ├── metamask.svg
│   │   │   ├── ok.svg
│   │   │   ├── opera.svg
│   │   │   ├── trust.svg
│   │   │   ├── unknown.svg
│   │   │   └── walletconnect.svg
│   │   ├── instances
│   │   │   └── newSwap.ts
│   │   ├── localisation
│   │   │   ├── _default.json
│   │   │   ├── en.json
│   │   │   ├── es.json
│   │   │   ├── nl.json
│   │   │   └── ru.json
│   │   ├── pages
│   │   │   ├── About
│   │   │   │   └── About.tsx
│   │   │   ├── CreateWallet
│   │   │   │   ├── chooseColor.ts
│   │   │   │   ├── CreateWallet.scss
│   │   │   │   ├── CreateWallet.tsx
│   │   │   │   ├── Explanation.tsx
│   │   │   │   ├── images
│   │   │   │   │   ├── check.tsx
│   │   │   │   │   ├── fingerprint.svg
│   │   │   │   │   ├── google2FA.svg
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── multisignature.svg
│   │   │   │   │   ├── pin.svg
│   │   │   │   │   ├── sms.svg
│   │   │   │   │   └── withoutSecure.svg
│   │   │   │   └── Steps
│   │   │   │       ├── FirstStep.tsx
│   │   │   │       ├── SecondStep.tsx
│   │   │   │       ├── StepsWrapper.tsx
│   │   │   │       └── texts.tsx
│   │   │   ├── Currency
│   │   │   │   ├── Currency.scss
│   │   │   │   ├── Currency.tsx
│   │   │   │   └── Row
│   │   │   │       ├── Row.scss
│   │   │   │       └── Row.tsx
│   │   │   ├── CurrencyWallet
│   │   │   │   ├── CurrencyWallet.scss
│   │   │   │   ├── CurrencyWallet.tsx
│   │   │   │   └── images
│   │   │   │       └── index.ts
│   │   │   ├── Exchange
│   │   │   │   ├── AddressSelect
│   │   │   │   │   ├── AddressSelect.scss
│   │   │   │   │   ├── AddressSelect.tsx
│   │   │   │   │   └── Option
│   │   │   │   │       ├── Option.scss
│   │   │   │   │       └── Option.tsx
│   │   │   │   ├── CurrencySlider
│   │   │   │   │   ├── CurrencySlider.scss
│   │   │   │   │   ├── CurrencySlider.tsx
│   │   │   │   │   └── images
│   │   │   │   │       ├── bch.svg
│   │   │   │   │       ├── btc.svg
│   │   │   │   │       ├── dash.svg
│   │   │   │   │       ├── eth.svg
│   │   │   │   │       ├── fire.svg
│   │   │   │   │       ├── index.ts
│   │   │   │   │       ├── ltc.svg
│   │   │   │   │       ├── swap.svg
│   │   │   │   │       ├── trx.svg
│   │   │   │   │       ├── usdt.svg
│   │   │   │   │       └── xrp.svg
│   │   │   │   ├── Exchange.scss
│   │   │   │   ├── Exchange.tsx
│   │   │   │   ├── FAQ
│   │   │   │   │   ├── FAQ.css
│   │   │   │   │   └── FAQ.tsx
│   │   │   │   ├── HowItWorks
│   │   │   │   │   ├── HowItWorks.scss
│   │   │   │   │   └── HowItWorks.tsx
│   │   │   │   ├── images
│   │   │   │   │   └── swapIcon.svg
│   │   │   │   ├── Orders
│   │   │   │   │   ├── MyOrders
│   │   │   │   │   │   ├── MyOrders.scss
│   │   │   │   │   │   ├── MyOrders.tsx
│   │   │   │   │   │   └── RowFeeds
│   │   │   │   │   │       ├── images
│   │   │   │   │   │       │   ├── accept.svg
│   │   │   │   │   │       │   ├── arrow-right.svg
│   │   │   │   │   │       │   └── share-alt-solid.svg
│   │   │   │   │   │       ├── RowFeeds.scss
│   │   │   │   │   │       └── RowFeeds.tsx
│   │   │   │   │   ├── OrderBook
│   │   │   │   │   │   ├── OrderBook.scss
│   │   │   │   │   │   ├── OrderBook.tsx
│   │   │   │   │   │   ├── RequestButton
│   │   │   │   │   │   │   ├── RequestButton.scss
│   │   │   │   │   │   │   └── RequestButton.tsx
│   │   │   │   │   │   └── Row
│   │   │   │   │   │       ├── Row.scss
│   │   │   │   │   │       └── Row.tsx
│   │   │   │   │   ├── Orders.scss
│   │   │   │   │   ├── Orders.tsx
│   │   │   │   │   ├── Pair.spec.ts
│   │   │   │   │   └── Pair.ts
│   │   │   │   ├── Promo
│   │   │   │   │   ├── Promo.scss
│   │   │   │   │   └── Promo.tsx
│   │   │   │   ├── PromoText
│   │   │   │   │   ├── PromoText.scss
│   │   │   │   │   └── PromoText.tsx
│   │   │   │   ├── PureComponents
│   │   │   │   │   ├── Advantages.scss
│   │   │   │   │   └── Advantages.tsx
│   │   │   │   ├── Quote
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   ├── SelectGroup
│   │   │   │   │   ├── SelectGroup.scss
│   │   │   │   │   └── SelectGroup.tsx
│   │   │   │   └── VideoAndFeatures
│   │   │   │       ├── VideoAndFeatures.scss
│   │   │   │       └── VideoAndFeatures.tsx
│   │   │   ├── History
│   │   │   │   ├── Filter
│   │   │   │   │   ├── FilterLink
│   │   │   │   │   │   ├── FilterLink.scss
│   │   │   │   │   │   └── FilterLink.tsx
│   │   │   │   │   ├── Filter.scss
│   │   │   │   │   └── Filter.tsx
│   │   │   │   ├── History.scss
│   │   │   │   ├── History.tsx
│   │   │   │   ├── LinkTransaction
│   │   │   │   │   └── LinkTransaction.tsx
│   │   │   │   ├── Row
│   │   │   │   │   ├── Row.scss
│   │   │   │   │   └── Row.tsx
│   │   │   │   └── SwapsHistory
│   │   │   │       ├── RowHistory
│   │   │   │       │   ├── images
│   │   │   │       │   │   ├── accept.svg
│   │   │   │       │   │   └── arrow-right.svg
│   │   │   │       │   ├── RowHistory.scss
│   │   │   │       │   └── RowHistory.tsx
│   │   │   │       ├── SwapsHistory.scss
│   │   │   │       └── SwapsHistory.tsx
│   │   │   ├── Home
│   │   │   │   └── Orders
│   │   │   │       └── RequestButton
│   │   │   │           └── RequestButton.scss
│   │   │   ├── Invoices
│   │   │   │   ├── CreateInvoice
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   ├── Invoice
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   └── InvoicesList
│   │   │   │       └── index.tsx
│   │   │   ├── LocalStorage
│   │   │   │   ├── LocalStorage.scss
│   │   │   │   └── LocalStorage.tsx
│   │   │   ├── Multisign
│   │   │   │   └── Btc
│   │   │   │       ├── Btc.scss
│   │   │   │       └── Btc.tsx
│   │   │   ├── NotFound
│   │   │   │   ├── NotFound.scss
│   │   │   │   └── NotFound.tsx
│   │   │   ├── PointOfSell
│   │   │   │   ├── CurrencySlider
│   │   │   │   │   ├── CurrencySlider.scss
│   │   │   │   │   ├── CurrencySlider.tsx
│   │   │   │   │   └── images
│   │   │   │   │       ├── bch.svg
│   │   │   │   │       ├── btc.svg
│   │   │   │   │       ├── dash.svg
│   │   │   │   │       ├── eth.svg
│   │   │   │   │       ├── fire.svg
│   │   │   │   │       ├── index.ts
│   │   │   │   │       ├── ltc.svg
│   │   │   │   │       ├── swap.svg
│   │   │   │   │       ├── trx.svg
│   │   │   │   │       ├── usdt.svg
│   │   │   │   │       └── xrp.svg
│   │   │   │   ├── FAQ
│   │   │   │   │   ├── FAQ.css
│   │   │   │   │   └── FAQ.tsx
│   │   │   │   ├── HowItWorks
│   │   │   │   │   ├── HowItWorks.scss
│   │   │   │   │   └── HowItWorks.tsx
│   │   │   │   ├── images
│   │   │   │   │   └── swapIcon.svg
│   │   │   │   ├── PointOfSell.tsx
│   │   │   │   ├── Promo
│   │   │   │   │   ├── Promo.scss
│   │   │   │   │   └── Promo.tsx
│   │   │   │   ├── PromoText
│   │   │   │   │   ├── PromoText.scss
│   │   │   │   │   └── PromoText.tsx
│   │   │   │   ├── PureComponents
│   │   │   │   │   ├── Advantages.scss
│   │   │   │   │   └── Advantages.tsx
│   │   │   │   ├── Quote
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   ├── SelectGroup
│   │   │   │   │   ├── SelectGroup.scss
│   │   │   │   │   └── SelectGroup.tsx
│   │   │   │   └── VideoAndFeatures
│   │   │   │       ├── VideoAndFeatures.scss
│   │   │   │       └── VideoAndFeatures.tsx
│   │   │   ├── Swap
│   │   │   │   ├── _BtcToGhost.tsx_
│   │   │   │   ├── Debug
│   │   │   │   │   ├── BtcScript.tsx
│   │   │   │   │   ├── Debug.scss
│   │   │   │   │   ├── Debug.tsx
│   │   │   │   │   └── ShowBtcScript.tsx
│   │   │   │   ├── DeleteSwapAfterEnd.tsx
│   │   │   │   ├── _EthTokenToUsdt.tsx_
│   │   │   │   ├── FailControler
│   │   │   │   │   ├── FailControler.scss
│   │   │   │   │   └── FailControler.tsx
│   │   │   │   ├── FeeControler
│   │   │   │   │   ├── FeeControler.scss
│   │   │   │   │   └── FeeControler.tsx
│   │   │   │   ├── _GhostToBtc.tsx_
│   │   │   │   ├── images
│   │   │   │   │   ├── cc-visa-brands.svg
│   │   │   │   │   └── nodemon.svg
│   │   │   │   ├── Share
│   │   │   │   │   ├── Share.scss
│   │   │   │   │   └── Share.tsx
│   │   │   │   ├── SwapController.tsx
│   │   │   │   ├── swaps
│   │   │   │   │   ├── build.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Swap.scss
│   │   │   │   ├── Swap.tsx
│   │   │   │   ├── Timer
│   │   │   │   │   ├── Timer.scss
│   │   │   │   │   └── Timer.tsx
│   │   │   │   ├── _UsdtToEthToken.tsx_
│   │   │   │   └── UTXOSwap
│   │   │   │       ├── DepositWindow
│   │   │   │       │   └── DepositWindow.tsx
│   │   │   │       ├── EthTokenToUTXO.tsx
│   │   │   │       ├── EthToUTXO.tsx
│   │   │   │       ├── SwapList
│   │   │   │       │   ├── steps
│   │   │   │       │   │   ├── FirstStep.tsx
│   │   │   │       │   │   ├── FourthStep.tsx
│   │   │   │       │   │   ├── SecondStep.tsx
│   │   │   │       │   │   └── ThirdStep.tsx
│   │   │   │       │   ├── SwapList.scss
│   │   │   │       │   └── SwapList.tsx
│   │   │   │       ├── SwapProgress
│   │   │   │       │   ├── images
│   │   │   │       │   │   ├── finish.svg
│   │   │   │       │   │   ├── icon0.gif
│   │   │   │       │   │   ├── icon1.gif
│   │   │   │       │   │   ├── icon2.gif
│   │   │   │       │   │   ├── icon3.gif
│   │   │   │       │   │   ├── icon4.gif
│   │   │   │       │   │   ├── icon5.gif
│   │   │   │       │   │   ├── icon6.gif
│   │   │   │       │   │   ├── icon7.gif
│   │   │   │       │   │   ├── icon8.gif
│   │   │   │       │   │   ├── icon9.gif
│   │   │   │       │   │   └── index.js
│   │   │   │       │   ├── SwapProgress.scss
│   │   │   │       │   ├── SwapProgressText
│   │   │   │       │   │   ├── BtcLikeToEthToken.tsx
│   │   │   │       │   │   ├── BtcLikeToEth.tsx
│   │   │   │       │   │   ├── EthToBtcLike.tsx
│   │   │   │       │   │   ├── EthTokenToBtcLike.tsx
│   │   │   │       │   │   └── PleaseDontLeaveWrapper.tsx
│   │   │   │       │   └── SwapProgress.tsx
│   │   │   │       ├── UTXOToEthToken.tsx
│   │   │   │       └── UTXOToEth.tsx
│   │   │   ├── Transaction
│   │   │   │   ├── styles.scss
│   │   │   │   ├── Transaction.tsx
│   │   │   │   └── TxInfo
│   │   │   │       ├── index.tsx
│   │   │   │       └── styles.scss
│   │   │   └── Wallet
│   │   │       ├── components
│   │   │       │   ├── LinkAccount
│   │   │       │   │   └── index.tsx
│   │   │       │   ├── NotityBlock
│   │   │       │   │   ├── images
│   │   │       │   │   │   ├── btcUsdt.svg
│   │   │       │   │   │   ├── info-solid.svg
│   │   │       │   │   │   ├── mail.svg
│   │   │       │   │   │   ├── manageImg.jpg
│   │   │       │   │   │   └── security.svg
│   │   │       │   │   ├── NotifyBlock.scss
│   │   │       │   │   └── NotifyBlock.tsx
│   │   │       │   ├── PartOfAddress
│   │   │       │   │   └── index.tsx
│   │   │       │   └── WallerSlider
│   │   │       │       └── index.tsx
│   │   │       ├── CurrenciesList.tsx
│   │   │       ├── images
│   │   │       │   ├── btc.svg
│   │   │       │   ├── dollar.svg
│   │   │       │   └── pen.svg
│   │   │       ├── Row
│   │   │       │   ├── Row.scss
│   │   │       │   └── Row.tsx
│   │   │       ├── Wallet.scss
│   │   │       └── Wallet.tsx
│   │   ├── plugins
│   │   │   ├── backupUserData.ts
│   │   │   ├── index.ts
│   │   │   └── saveUserData.ts
│   │   ├── redux
│   │   │   ├── actions
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── backupManager.ts
│   │   │   │   ├── btcmultisig.ts
│   │   │   │   ├── btc.ts
│   │   │   │   ├── comments.ts
│   │   │   │   ├── core.ts
│   │   │   │   ├── eth.ts
│   │   │   │   ├── feed.ts
│   │   │   │   ├── filter.ts
│   │   │   │   ├── firebase.ts
│   │   │   │   ├── ghost.ts
│   │   │   │   ├── history.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── invoices.ts
│   │   │   │   ├── loader.ts
│   │   │   │   ├── menu.ts
│   │   │   │   ├── modals.ts
│   │   │   │   ├── multisigTx.ts
│   │   │   │   ├── next.ts
│   │   │   │   ├── notifications.ts
│   │   │   │   ├── noxon.ts
│   │   │   │   ├── pairs.ts
│   │   │   │   ├── pubsubRoom.ts
│   │   │   │   ├── referral.ts
│   │   │   │   ├── token.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── ui.ts
│   │   │   │   ├── usdt.ts
│   │   │   │   └── user.ts
│   │   │   ├── core
│   │   │   │   ├── index.ts
│   │   │   │   └── reducers.ts
│   │   │   ├── middleware
│   │   │   │   ├── index.ts
│   │   │   │   ├── saver.ts
│   │   │   │   └── selectiveSaver.ts
│   │   │   ├── reducers
│   │   │   │   ├── api.ts
│   │   │   │   ├── core.ts
│   │   │   │   ├── createWallet.ts
│   │   │   │   ├── currencies.ts
│   │   │   │   ├── feeds.ts
│   │   │   │   ├── history.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── inputActive.ts
│   │   │   │   ├── loader.ts
│   │   │   │   ├── menu.ts
│   │   │   │   ├── modals.ts
│   │   │   │   ├── notifications.ts
│   │   │   │   ├── pubsubRoom.ts
│   │   │   │   ├── rememberedOrders.ts
│   │   │   │   ├── signUp.ts
│   │   │   │   ├── ui.ts
│   │   │   │   └── user.ts
│   │   │   └── store
│   │   │       └── index.ts
│   │   └── routes
│   │       └── index.tsx
│   └── tools
│       ├── libs
│       │   └── fs.js
│       ├── messages.js
│       └── run.js
├── readme.md
└── README.md

386 directories, 1097 files
```
