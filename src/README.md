```
├── back
│   └── nextcoin
│       ├── nextd-install.sh
│       ├── nextd-logs.sh
│       ├── nextd-start.sh
│       ├── nextd-stop.sh
│       ├── next-options.txt
│       ├── nextp.js
│       ├── nextp-logs.sh
│       ├── nextp-start.sh
│       ├── nextp-stop.sh
│       ├── next-rpc-methods.txt
│       ├── package.json
│       ├── README.md
│       └── request-example.sh
├── bot
│   ├── app
│   │   ├── actions
│   │   │   ├── errors
│   │   │   │   ├── handleError.ts
│   │   │   │   └── handleSwapError.ts
│   │   │   └── fetchPrice.ts
│   │   └── middlewares
│   │       └── prices.ts
│   ├── app.ts
│   ├── cli
│   │   ├── algo.ts
│   │   ├── data-worker.ts
│   │   ├── helpers
│   │   │   ├── getOrderId.ts
│   │   │   ├── help.ts
│   │   │   ├── methods.ts
│   │   │   ├── readline.ts
│   │   │   └── text.ts
│   │   ├── interface.ts
│   │   ├── run.ts
│   │   ├── socket-bot.ts
│   │   └── trade.ts
│   ├── config
│   │   ├── constants.ts
│   │   ├── mainnet
│   │   │   ├── PAIR_TYPES.ts
│   │   │   ├── TOKEN_DECIMALS.ts
│   │   │   ├── TOKENS.ts
│   │   │   ├── TRADE_CONFIG.ts
│   │   │   ├── TRADE_LIMITS.ts
│   │   │   ├── TRADE_ORDER_MINAMOUNTS.ts
│   │   │   └── TRADE_TICKERS.ts
│   │   ├── storage.ts
│   │   └── testnet
│   │       ├── PAIR_TYPES.ts
│   │       ├── TOKEN_DECIMALS.ts
│   │       ├── TOKENS.ts
│   │       ├── TRADE_CONFIG.ts
│   │       ├── TRADE_LIMITS.ts
│   │       ├── TRADE_ORDER_MINAMOUNTS.ts
│   │       └── TRADE_TICKERS.ts
│   ├── Dockerfile
│   ├── ecosystem.config.ts
│   ├── helpers
│   │   ├── debugFeedBack.ts
│   │   ├── find.ts
│   │   ├── index.ts
│   │   ├── route.ts
│   │   ├── swap.ts
│   │   └── views.ts
│   ├── index.ts
│   ├── jest.config.ts
│   ├── microbot
│   │   ├── actions
│   │   │   ├── book
│   │   │   │   ├── fetchPrice.spec.ts
│   │   │   │   ├── fillOrderbook.spec.ts
│   │   │   │   ├── fillOrderbook.ts
│   │   │   │   ├── handleKeyboardInput.ts
│   │   │   │   └── startSaved.ts
│   │   │   ├── incoming
│   │   │   │   └── handleRequest.ts
│   │   │   ├── index.ts
│   │   │   ├── outcoming
│   │   │   │   ├── doRequest.ts
│   │   │   │   ├── handleOrder.spec.ts
│   │   │   │   └── handleOrder.ts
│   │   │   ├── start
│   │   │   │   ├── beginSwap.ts
│   │   │   │   └── swapStatus.ts
│   │   │   └── swap-flow
│   │   │       ├── DefaultFlowActions.ts
│   │   │       ├── index.ts
│   │   │       └── README.md
│   │   ├── app.ts
│   │   ├── core
│   │   │   ├── beginSwap.ts
│   │   │   ├── checkAddress.ts
│   │   │   ├── checkParticipant.ts
│   │   │   ├── checkSwapsCountLimit.ts
│   │   │   ├── doRequest.ts
│   │   │   ├── fetchOrder.ts
│   │   │   ├── history.ts
│   │   │   ├── orders.ts
│   │   │   └── replyToRequest.ts
│   │   ├── index.ts
│   │   ├── Pair.spec.ts
│   │   └── Pair.ts
│   ├── README.md
│   ├── routes
│   │   ├── auth.ts
│   │   ├── homepage
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   ├── info
│   │   │   └── index.ts
│   │   ├── kraken
│   │   │   └── index.ts
│   │   ├── me
│   │   │   ├── controller.ts
│   │   │   └── index.ts
│   │   ├── orders
│   │   │   ├── controller.ts
│   │   │   └── index.ts
│   │   ├── swaps
│   │   │   ├── controller.ts
│   │   │   └── index.ts
│   │   └── web
│   │       ├── home.html
│   │       └── js
│   │           ├── app.js
│   │           ├── bot.js
│   │           ├── history.js
│   │           ├── kraken.js
│   │           └── stats.js
│   ├── services
│   │   └── instances
│   │       └── kraken.ts
│   ├── swapApp.ts
│   ├── test
│   │   ├── order.example
│   │   ├── orders.ts
│   │   ├── README.md
│   │   ├── refund.sh
│   │   ├── testdrive.sh
│   │   └── token.example
│   ├── util
│   │   ├── listNotRefunded.ts
│   │   ├── refund.ts
│   │   └── repl.ts
│   ├── ws
│   │   ├── autopilot.ts
│   │   ├── run.ts
│   │   └── socket-bot.ts
│   └── ws.ts
├── common
│   ├── coins
│   │   ├── BTC.ts
│   │   ├── getCoinInfo.ts
│   │   ├── GHOST.ts
│   │   ├── index.ts
│   │   ├── interfaces.ts
│   │   ├── LTC.ts
│   │   └── NEXT.ts
│   ├── domain
│   │   ├── address.ts
│   │   ├── amount.ts
│   │   ├── coin.ts
│   │   ├── network.ts
│   │   └── swap.ts
│   ├── erc20Like
│   │   └── index.ts
│   ├── examples
│   │   ├── send.ts
│   │   └── unspents.ts
│   ├── firebug
│   │   ├── errorIcon.png
│   │   ├── firebug.css
│   │   ├── firebug.html
│   │   ├── firebug.js
│   │   ├── firebugx.js
│   │   ├── infoIcon.png
│   │   └── warningIcon.png
│   ├── helpers
│   │   ├── bip44.ts
│   │   ├── constants
│   │   │   ├── COINS_WITH_DYNAMIC_FEE.ts
│   │   │   ├── DEFAULT_CURRENCY_PARAMETERS.ts
│   │   │   ├── EVM_CONTRACTS_ABI.ts
│   │   │   ├── index.ts
│   │   │   ├── MIN_AMOUNT_OFFER.ts
│   │   │   ├── MIN_AMOUNT.ts
│   │   │   ├── SWAP_STEPS.ts
│   │   │   └── TRANSACTION.ts
│   │   ├── ethLikeHelper.ts
│   │   └── turboSwap.ts
│   ├── messaging
│   │   └── pubsubRoom
│   │       ├── connection.ts
│   │       ├── createP2PNode.ts
│   │       ├── direct-connection-handler.ts
│   │       ├── encoding.ts
│   │       ├── index.ts
│   │       └── protocol.ts
│   ├── utils
│   │   ├── apiLooper.ts
│   │   ├── coin
│   │   │   ├── btc.ts
│   │   │   ├── eth.ts
│   │   │   ├── gost.ts
│   │   │   ├── interface.txt
│   │   │   └── next.ts
│   │   ├── colorString.ts
│   │   ├── getUnixTimeStamp.ts
│   │   ├── mnemonic.ts
│   │   ├── namedQuery.ts
│   │   └── request.ts
│   ├── web3connect
│   │   ├── index.ts
│   │   └── providers
│   │       ├── index.ts
│   │       ├── InjectedProvider.ts
│   │       ├── InjectedType.ts
│   │       ├── supported.ts
│   │       └── WalletConnectProvider.ts
│   └── whitelists
│       ├── trustedMakers.ts
│       └── visibleMakers.ts
├── core
│   ├── index.ts
│   ├── simple
│   │   ├── examples
│   │   │   ├── bot.ts
│   │   │   ├── listFinished.ts
│   │   │   ├── listNotRefunded.ts
│   │   │   ├── recover.ts
│   │   │   ├── refund.ts
│   │   │   ├── repl.ts
│   │   │   └── startSaved.ts
│   │   ├── jest.config.ts
│   │   ├── jest.setup.ts
│   │   ├── README.md
│   │   ├── src
│   │   │   ├── config
│   │   │   │   ├── common.ts
│   │   │   │   ├── getConfig.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── mainnet.ts
│   │   │   │   ├── setupLocalStorage.ts
│   │   │   │   ├── testnet.ts
│   │   │   │   └── tokenSwap.ts
│   │   │   ├── helpers
│   │   │   │   ├── checkService.ts
│   │   │   │   ├── filter.ts
│   │   │   │   ├── history.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── on.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── request.ts
│   │   │   │   ├── room.ts
│   │   │   │   └── swap.ts
│   │   │   ├── index.ts
│   │   │   ├── instances
│   │   │   │   └── ethereum.ts
│   │   │   ├── setup.ts
│   │   │   └── wallet
│   │   │       └── index.ts
│   │   └── tests
│   │       ├── CustomConfig.test.ts
│   │       ├── SwapApp.test.ts
│   │       ├── SwapOrders.test.ts
│   │       └── SwapWallet.test.ts
│   ├── swap.app
│   │   ├── Collection.ts
│   │   ├── constants
│   │   │   ├── COINS.ts
│   │   │   ├── ENV.ts
│   │   │   ├── index.ts
│   │   │   ├── NETWORKS.ts
│   │   │   ├── PAIR_TYPES.ts
│   │   │   ├── SERVICES.ts
│   │   │   └── TRADE_TICKERS.ts
│   │   ├── Events.ts
│   │   ├── index.ts
│   │   ├── ServiceInterface.ts
│   │   ├── StorageFactory.ts
│   │   ├── SwapApp.ts
│   │   ├── SwapInterface.ts
│   │   └── util
│   │       ├── bep20.ts
│   │       ├── erc20matic.ts
│   │       ├── erc20.ts
│   │       ├── helpers.ts
│   │       ├── index.ts
│   │       ├── pullProps.ts
│   │       └── typeforce.ts
│   ├── swap.auth
│   │   ├── arbeth.ts
│   │   ├── bnb.ts
│   │   ├── btc.ts
│   │   ├── eth.ts
│   │   ├── ghost.ts
│   │   ├── index.ts
│   │   ├── matic.ts
│   │   ├── next.ts
│   │   └── SwapAuth.ts
│   ├── swap.flows
│   │   ├── ARBITRUM2BTC.ts
│   │   ├── atomic
│   │   │   ├── BtcToEthLikeToken.ts
│   │   │   ├── BtcToEthLike.ts
│   │   │   ├── EthLikeToBtc.ts
│   │   │   ├── EthLikeTokenToBtc.ts
│   │   │   ├── EvmTokenToNext.ts
│   │   │   ├── EvmToNext.ts
│   │   │   ├── NextToEvmToken.ts
│   │   │   └── NextToEvm.ts
│   │   ├── BNB2BTC.ts
│   │   ├── BSCTOKEN2BTC.ts
│   │   ├── BTC2ARBITRUM.ts
│   │   ├── BTC2BNB.ts
│   │   ├── BTC2BSCTOKEN.ts
│   │   ├── BTC2ETHTOKEN.ts
│   │   ├── BTC2ETH.ts
│   │   ├── BTC2MATICTOKEN.ts
│   │   ├── BTC2MATIC.ts
│   │   ├── ETH2BTC.ts
│   │   ├── ETH2GHOST.ts
│   │   ├── ETH2NEXT.ts
│   │   ├── ETHTOKEN2BTC.ts
│   │   ├── ETHTOKEN2GHOST.ts
│   │   ├── ETHTOKEN2NEXT.ts
│   │   ├── GHOST2BTC.ts
│   │   ├── GHOST2ETHTOKEN.ts
│   │   ├── GHOST2ETH.ts
│   │   ├── index.ts
│   │   ├── MATIC2BTC.ts
│   │   ├── MATICTOKEN2BTC.ts
│   │   ├── NEXT2BTC.ts
│   │   ├── NEXT2ETHTOKEN.ts
│   │   ├── NEXT2ETH.ts
│   │   └── turbo
│   │       ├── Maker.ts
│   │       └── Taker.ts
│   ├── swap.orders
│   │   ├── aggregation.ts
│   │   ├── events.ts
│   │   ├── index.ts
│   │   ├── Order.ts
│   │   ├── Pair.ts
│   │   └── SwapOrders.ts
│   ├── swap.room
│   │   ├── index.ts
│   │   └── SwapRoom.ts
│   ├── swap.swap
│   │   ├── AtomicAB2UTXO.ts
│   │   ├── Flow.ts
│   │   ├── index.ts
│   │   ├── Room.ts
│   │   ├── Steps.ts
│   │   └── Swap.ts
│   ├── swap.swaps
│   │   ├── ArbitrumSwap.ts
│   │   ├── BnbSwap.ts
│   │   ├── BscTokenSwap.ts
│   │   ├── BtcSwap.ts
│   │   ├── EthLikeSwap.ts
│   │   ├── EthLikeTokenSwap.ts
│   │   ├── EthSwap.ts
│   │   ├── EthTokenSwap.ts
│   │   ├── GhostSwap.ts
│   │   ├── index.ts
│   │   ├── MaticSwap.ts
│   │   ├── MaticTokenSwap.ts
│   │   ├── NextSwap.ts
│   │   └── UTXOBlockchain.ts
│   ├── tests
│   │   ├── btcSwap.test.ts
│   │   ├── config.ts
│   │   ├── ethSwap.test.ts
│   │   ├── fixtures
│   │   │   ├── index.ts
│   │   │   └── unspents.ts
│   │   ├── index.test.ts
│   │   ├── Pair.test.ts
│   │   ├── setupSwapApp.ts
│   │   └── swap.test.ts
│   └── webpack.config.babel.js
├── front
│   ├── bin
│   │   ├── bootstrap.js
│   │   ├── compile
│   │   │   ├── compile.js
│   │   │   └── index.js
│   │   └── server
│   │       ├── index.js
│   │       └── server.js
│   ├── chrome-extension
│   │   ├── icons
│   │   │   ├── icon-16.png
│   │   │   ├── icon-196.png
│   │   │   └── icon-32.png
│   │   └── manifest_eth.json
│   ├── client
│   │   ├── colors.css
│   │   ├── favicon.png
│   │   ├── fonts
│   │   │   └── Manrope
│   │   │       ├── index.css
│   │   │       ├── manrope-bold.otf
│   │   │       ├── manrope-bold.woff
│   │   │       ├── manrope-bold.woff2
│   │   │       ├── manrope-extrabold.otf
│   │   │       ├── manrope-extrabold.woff
│   │   │       ├── manrope-extrabold.woff2
│   │   │       ├── manrope-light.otf
│   │   │       ├── manrope-light.woff
│   │   │       ├── manrope-light.woff2
│   │   │       ├── manrope-medium.otf
│   │   │       ├── manrope-medium.woff
│   │   │       ├── manrope-medium.woff2
│   │   │       ├── manrope-regular.otf
│   │   │       ├── manrope-regular.woff
│   │   │       ├── manrope-regular.woff2
│   │   │       ├── manrope-semibold.otf
│   │   │       ├── manrope-semibold.woff
│   │   │       ├── manrope-semibold.woff2
│   │   │       ├── manrope-thin.otf
│   │   │       ├── manrope-thin.woff
│   │   │       └── manrope-thin.woff2
│   │   ├── index.html
│   │   ├── index.tsx
│   │   ├── ownBuffer.js
│   │   └── scss
│   │       ├── app.scss
│   │       ├── config
│   │       │   ├── index.scss
│   │       │   ├── mixins
│   │       │   │   ├── _common.scss
│   │       │   │   ├── _fonts.scss
│   │       │   │   ├── index.scss
│   │       │   │   ├── indexWidget.scss
│   │       │   │   ├── _media.scss
│   │       │   │   └── _mediaWidget.scss
│   │       │   ├── vars
│   │       │   │   ├── _animations.scss
│   │       │   │   ├── index.scss
│   │       │   │   └── _media.scss
│   │       │   └── widget.scss
│   │       └── fonts
│   │           ├── index.scss
│   │           └── _manrope.scss
│   ├── config
│   │   ├── chrome-extension-mainnet.prod.js
│   │   ├── chrome-extension-testnet.prod.js
│   │   ├── default.js
│   │   ├── gravatarUsers.js
│   │   ├── mainnet
│   │   │   ├── api.js
│   │   │   ├── bep20.js
│   │   │   ├── erc20.js
│   │   │   ├── erc20matic.js
│   │   │   ├── evmNetworks.js
│   │   │   ├── evmNetworkVersions.js
│   │   │   ├── feeRates.js
│   │   │   ├── hiddenCoins.js
│   │   │   ├── index.js
│   │   │   ├── link.js
│   │   │   ├── noExchangeCoins.js
│   │   │   ├── pubsubRoom.js
│   │   │   ├── swapConfig.js
│   │   │   ├── swapContract.js
│   │   │   └── web3.js
│   │   ├── mainnet.dev.js
│   │   ├── mainnet.firebug.js
│   │   ├── mainnet-local.prod.js
│   │   ├── mainnet.pages.prod.js
│   │   ├── mainnet.prod.js
│   │   ├── mainnet.widget.dev.js
│   │   ├── mainnet.widget.prod.js
│   │   ├── testnet
│   │   │   ├── api.js
│   │   │   ├── bep20.js
│   │   │   ├── erc20.js
│   │   │   ├── erc20matic.js
│   │   │   ├── evmNetworks.js
│   │   │   ├── evmNetworkVersions.js
│   │   │   ├── feeRates.js
│   │   │   ├── hiddenCoins.js
│   │   │   ├── index.js
│   │   │   ├── link.js
│   │   │   ├── noExchangeCoins.js
│   │   │   ├── pubsubRoom.js
│   │   │   ├── swapConfig.js
│   │   │   ├── swapContract.js
│   │   │   └── web3.js
│   │   ├── testnet.dev.js
│   │   ├── testnet.firebug.js
│   │   ├── testnet-local.prod.js
│   │   ├── testnet.prod.js
│   │   ├── testnet.widget.dev.js
│   │   └── testnet.widget.prod.js
│   ├── custom.d.ts
│   ├── externalConfigs
│   │   ├── mainnet-default.js
│   │   ├── mainnet-localhost.js
│   │   ├── swaponline.github.io.js
│   │   └── testnet-default.js
│   ├── fix-react-router-dom.d.ts
│   ├── global.d.ts
│   ├── local_modules
│   │   ├── app-config
│   │   │   ├── client.js
│   │   │   ├── index.js
│   │   │   └── webpack.js
│   │   └── sw-valuelink
│   │       ├── index.ts
│   │       └── tags.tsx
│   ├── shared
│   │   ├── components
│   │   │   ├── AdminFeeInfoBlock
│   │   │   │   ├── AdminFeeInfoBlock.scss
│   │   │   │   └── AdminFeeInfoBlock.tsx
│   │   │   ├── Avatar
│   │   │   │   ├── Avatar.scss
│   │   │   │   └── Avatar.tsx
│   │   │   ├── BalanceForm
│   │   │   │   ├── BalanceForm.tsx
│   │   │   │   └── images
│   │   │   │       ├── btcIcon.svg
│   │   │   │       ├── dollar2.svg
│   │   │   │       ├── dollar.svg
│   │   │   │       └── index.ts
│   │   │   ├── Coin
│   │   │   │   ├── Coin.scss
│   │   │   │   └── Coin.tsx
│   │   │   ├── Coins
│   │   │   │   ├── Coins.scss
│   │   │   │   └── Coins.tsx
│   │   │   ├── Comment
│   │   │   │   ├── Comment.scss
│   │   │   │   └── Comment.tsx
│   │   │   ├── Confirm
│   │   │   │   ├── Confirm.scss
│   │   │   │   └── Confirm.tsx
│   │   │   ├── controls
│   │   │   │   ├── Button
│   │   │   │   │   ├── Button.scss
│   │   │   │   │   └── Button.tsx
│   │   │   │   ├── CurrencyButton
│   │   │   │   │   ├── CurrencyButton.scss
│   │   │   │   │   └── CurrencyButton.tsx
│   │   │   │   ├── Flip
│   │   │   │   │   ├── Flip.scss
│   │   │   │   │   ├── Flip.tsx
│   │   │   │   │   └── images
│   │   │   │   │       └── flip.svg
│   │   │   │   ├── index.ts
│   │   │   │   ├── RemoveButton
│   │   │   │   │   ├── index.scss
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── ShareButton
│   │   │   │   │   ├── images
│   │   │   │   │   │   └── icon.svg
│   │   │   │   │   ├── ShareButton.scss
│   │   │   │   │   └── ShareButton.tsx
│   │   │   │   ├── ShareLink
│   │   │   │   │   ├── ShareLink.scss
│   │   │   │   │   └── ShareLink.tsx
│   │   │   │   ├── Switching
│   │   │   │   │   ├── Switching.scss
│   │   │   │   │   └── Switching.tsx
│   │   │   │   ├── TimerButton
│   │   │   │   │   └── TimerButton.tsx
│   │   │   │   ├── Toggle
│   │   │   │   │   ├── Toggle.scss
│   │   │   │   │   └── Toggle.tsx
│   │   │   │   └── WithdrawButton
│   │   │   │       ├── BtnTooltip.tsx
│   │   │   │       ├── WithdrawButton.scss
│   │   │   │       └── WithdrawButton.tsx
│   │   │   ├── CurrencyDirectionChooser
│   │   │   │   ├── CurrencyDirectionChooser.scss
│   │   │   │   └── CurrencyDirectionChooser.tsx
│   │   │   ├── ErrorBoundary
│   │   │   │   ├── index.scss
│   │   │   │   └── index.tsx
│   │   │   ├── ErrorPageNoSSL
│   │   │   │   ├── ErrorPageNoSSL.scss
│   │   │   │   └── ErrorPageNoSSL.tsx
│   │   │   ├── FAQ
│   │   │   │   ├── FAQ.tsx
│   │   │   │   └── styles.scss
│   │   │   ├── FaqExpandableItem
│   │   │   │   ├── FaqExpandableItem.scss
│   │   │   │   └── FaqExpandableItem.tsx
│   │   │   ├── FilterForm
│   │   │   │   ├── FilterForm.tsx
│   │   │   │   └── styles.scss
│   │   │   ├── Footer
│   │   │   │   ├── Footer.scss
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── SocialMenu
│   │   │   │   │   ├── SocialMenu.scss
│   │   │   │   │   └── SocialMenu.tsx
│   │   │   │   └── SwitchLang
│   │   │   │       ├── SwitchLang.scss
│   │   │   │       └── SwitchLang.tsx
│   │   │   ├── forms
│   │   │   │   ├── FieldLabel
│   │   │   │   │   ├── FieldLabel.scss
│   │   │   │   │   └── FieldLabel.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── Input
│   │   │   │   │   ├── Input.scss
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   └── style.css
│   │   │   │   ├── MnemonicInput
│   │   │   │   │   ├── MnemonicInput.css
│   │   │   │   │   └── MnemonicInput.tsx
│   │   │   │   ├── PhoneInput
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   └── TextArea
│   │   │   │       └── TextArea.tsx
│   │   │   ├── Header
│   │   │   │   ├── config.tsx
│   │   │   │   ├── Header.scss
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Logo
│   │   │   │   │   ├── Logo.scss
│   │   │   │   │   └── Logo.tsx
│   │   │   │   ├── Nav
│   │   │   │   │   ├── Nav.scss
│   │   │   │   │   └── Nav.tsx
│   │   │   │   ├── NavMobile
│   │   │   │   │   ├── NavMobile.scss
│   │   │   │   │   └── NavMobile.tsx
│   │   │   │   ├── ThemeSwitcher.tsx
│   │   │   │   ├── TourPartial
│   │   │   │   │   └── TourPartial.tsx
│   │   │   │   ├── UserTooltip
│   │   │   │   │   ├── images
│   │   │   │   │   │   ├── accept.svg
│   │   │   │   │   │   ├── arrow-right.svg
│   │   │   │   │   │   └── close.svg
│   │   │   │   │   ├── UserTooltip.scss
│   │   │   │   │   └── UserTooltip.tsx
│   │   │   │   ├── WalletTour
│   │   │   │   │   └── WalletTour.tsx
│   │   │   │   └── WidgetTours
│   │   │   │       ├── index.ts
│   │   │   │       └── WidgetWalletTour.tsx
│   │   │   ├── Href
│   │   │   │   ├── Href.scss
│   │   │   │   └── Href.tsx
│   │   │   ├── InvoiceInfoBlock
│   │   │   │   ├── InvoiceInfoBlock.scss
│   │   │   │   └── InvoiceInfoBlock.tsx
│   │   │   ├── layout
│   │   │   │   ├── Center
│   │   │   │   │   ├── Center.scss
│   │   │   │   │   └── Center.tsx
│   │   │   │   ├── DashboardLayout
│   │   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   ├── Overlay
│   │   │   │   │   ├── Overlay.scss
│   │   │   │   │   └── Overlay.tsx
│   │   │   │   ├── ScrollToTop
│   │   │   │   │   └── ScrollToTop.ts
│   │   │   │   └── WidthContainer
│   │   │   │       ├── WidthContainer.scss
│   │   │   │       └── WidthContainer.tsx
│   │   │   ├── loaders
│   │   │   │   ├── ContentLoader
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── BalanceSection
│   │   │   │   │   │   │   └── BalanceSection.tsx
│   │   │   │   │   │   ├── BannersSection
│   │   │   │   │   │   │   └── BannersSection.tsx
│   │   │   │   │   │   ├── ContentSection
│   │   │   │   │   │   │   └── ContentSection.tsx
│   │   │   │   │   │   └── DescrSection
│   │   │   │   │   │       └── DescrSection.tsx
│   │   │   │   │   ├── ContentLoader.scss
│   │   │   │   │   ├── ContentLoader.tsx
│   │   │   │   │   └── ElementLoading.scss
│   │   │   │   ├── InlineLoader
│   │   │   │   │   ├── InlineLoader.scss
│   │   │   │   │   └── InlineLoader.tsx
│   │   │   │   ├── Loader
│   │   │   │   │   ├── Loader.scss
│   │   │   │   │   └── Loader.tsx
│   │   │   │   └── RequestLoader
│   │   │   │       └── RequestLoader.tsx
│   │   │   ├── modal
│   │   │   │   ├── index.ts
│   │   │   │   ├── Modal
│   │   │   │   │   ├── Modal.scss
│   │   │   │   │   └── Modal.tsx
│   │   │   │   ├── ModalBox
│   │   │   │   │   ├── ModalBox.scss
│   │   │   │   │   └── ModalBox.tsx
│   │   │   │   ├── ModalConductor
│   │   │   │   │   ├── ModalConductor.scss
│   │   │   │   │   └── ModalConductor.tsx
│   │   │   │   ├── ModalConductorProvider
│   │   │   │   │   ├── ModalConductorProvider.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   └── ModalContainer
│   │   │   │       ├── ModalContainer.scss
│   │   │   │       └── ModalContainer.tsx
│   │   │   ├── modals
│   │   │   │   ├── AddCustomToken
│   │   │   │   │   ├── index.scss
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── Alert
│   │   │   │   │   ├── AlertModal.scss
│   │   │   │   │   └── AlertModal.tsx
│   │   │   │   ├── AlertWindow
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   ├── BtcMultisignConfirmTx
│   │   │   │   │   ├── BtcMultisignConfirmTx.scss
│   │   │   │   │   └── BtcMultisignConfirmTx.tsx
│   │   │   │   ├── BtcMultisignSwitch
│   │   │   │   │   ├── BtcMultisignSwitch.scss
│   │   │   │   │   ├── BtcMultisignSwitch.tsx
│   │   │   │   │   ├── WalletRow.scss
│   │   │   │   │   └── WalletRow.tsx
│   │   │   │   ├── Confirm
│   │   │   │   │   ├── Confirm.scss
│   │   │   │   │   └── Confirm.tsx
│   │   │   │   ├── ConfirmBeginSwap
│   │   │   │   │   ├── ConfirmBeginSwap.scss
│   │   │   │   │   └── ConfirmBeginSwap.tsx
│   │   │   │   ├── ConnectWalletModal
│   │   │   │   │   ├── ConnectWalletModal.scss
│   │   │   │   │   └── ConnectWalletModal.tsx
│   │   │   │   ├── CurrencyAction
│   │   │   │   │   ├── CurrencyAction.scss
│   │   │   │   │   └── CurrencyAction.tsx
│   │   │   │   ├── DeclineOrdersModal
│   │   │   │   │   ├── DeclineOrdersModal.scss
│   │   │   │   │   └── DeclineOrdersModal.tsx
│   │   │   │   ├── DownloadModal
│   │   │   │   │   ├── DownloadModal.scss
│   │   │   │   │   └── DownloadModal.tsx
│   │   │   │   ├── HowToWithdrawModal
│   │   │   │   │   ├── HowToWithdrawModal.scss
│   │   │   │   │   └── HowToWithdrawModal.tsx
│   │   │   │   ├── IncompletedSwaps
│   │   │   │   │   ├── IncompletedSwaps.scss
│   │   │   │   │   └── IncompletedSwaps.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── InfoInvoice
│   │   │   │   │   ├── images
│   │   │   │   │   │   ├── cancel.svg
│   │   │   │   │   │   ├── pending.svg
│   │   │   │   │   │   └── ready.svg
│   │   │   │   │   ├── InfoInvoice.scss
│   │   │   │   │   └── InfoInvoice.tsx
│   │   │   │   ├── InvoiceLinkModal
│   │   │   │   │   ├── InvoiceLinkModal.scss
│   │   │   │   │   └── InvoiceLinkModal.tsx
│   │   │   │   ├── InvoiceModal
│   │   │   │   │   ├── InvoiceModal.scss
│   │   │   │   │   └── InvoiceModal.tsx
│   │   │   │   ├── MultisignJoinLink
│   │   │   │   │   ├── MultisignJoinLink.scss
│   │   │   │   │   └── MultisignJoinLink.tsx
│   │   │   │   ├── OfferModal
│   │   │   │   │   ├── AddOffer
│   │   │   │   │   │   ├── AddOffer.scss
│   │   │   │   │   │   ├── AddOffer.tsx
│   │   │   │   │   │   ├── ExchangeRateGroup
│   │   │   │   │   │   │   ├── ExchangeRateGroup.scss
│   │   │   │   │   │   │   └── ExchangeRateGroup.tsx
│   │   │   │   │   │   ├── Group
│   │   │   │   │   │   │   ├── Group.scss
│   │   │   │   │   │   │   └── Group.tsx
│   │   │   │   │   │   ├── Select
│   │   │   │   │   │   │   ├── Select.scss
│   │   │   │   │   │   │   └── Select.tsx
│   │   │   │   │   │   └── SelectGroup
│   │   │   │   │   │       ├── SelectGroup.scss
│   │   │   │   │   │       └── SelectGroup.tsx
│   │   │   │   │   ├── ConfirmOffer
│   │   │   │   │   │   ├── Amounts
│   │   │   │   │   │   │   ├── Amounts.scss
│   │   │   │   │   │   │   └── Amounts.tsx
│   │   │   │   │   │   ├── ConfirmOffer.scss
│   │   │   │   │   │   ├── ConfirmOffer.tsx
│   │   │   │   │   │   ├── ExchangeRate
│   │   │   │   │   │   │   ├── ExchangeRate.scss
│   │   │   │   │   │   │   └── ExchangeRate.tsx
│   │   │   │   │   │   ├── Row
│   │   │   │   │   │   │   ├── Row.scss
│   │   │   │   │   │   │   └── Row.tsx
│   │   │   │   │   │   └── Value
│   │   │   │   │   │       ├── Value.scss
│   │   │   │   │   │       └── Value.tsx
│   │   │   │   │   ├── OfferModal.scss
│   │   │   │   │   └── OfferModal.tsx
│   │   │   │   ├── PrivateKeysModal
│   │   │   │   │   ├── PrivateKeysModal.scss
│   │   │   │   │   └── PrivateKeysModal.tsx
│   │   │   │   ├── ReceiveModal
│   │   │   │   │   ├── ReceiveModal.scss
│   │   │   │   │   └── ReceiveModal.tsx
│   │   │   │   ├── RegisterPINProtected
│   │   │   │   │   ├── RegisterPINProtected.scss
│   │   │   │   │   └── RegisterPINProtected.tsx
│   │   │   │   ├── RegisterSMSProtected
│   │   │   │   │   ├── RegisterSMSProtected.scss
│   │   │   │   │   └── RegisterSMSProtected.tsx
│   │   │   │   ├── RestoryMnemonicWallet
│   │   │   │   │   ├── RestoryMnemonicWallet.scss
│   │   │   │   │   └── RestoryMnemonicWallet.tsx
│   │   │   │   ├── SaveKeysModal
│   │   │   │   │   ├── SaveKeysModal.scss
│   │   │   │   │   └── SaveKeysModal.tsx
│   │   │   │   ├── SaveMnemonicModal
│   │   │   │   │   ├── SaveMnemonicModal.scss
│   │   │   │   │   └── SaveMnemonicModal.tsx
│   │   │   │   ├── Share
│   │   │   │   │   ├── Share.scss
│   │   │   │   │   └── Share.tsx
│   │   │   │   ├── Styles
│   │   │   │   │   └── default.scss
│   │   │   │   ├── WalletAddressModal
│   │   │   │   │   ├── WalletAddressModal.scss
│   │   │   │   │   └── WalletAddressModal.tsx
│   │   │   │   ├── WithdrawBtcMultisig
│   │   │   │   │   ├── WithdrawBtcMultisig.scss
│   │   │   │   │   └── WithdrawBtcMultisig.tsx
│   │   │   │   ├── WithdrawBtcPin
│   │   │   │   │   ├── WithdrawBtcPin.scss
│   │   │   │   │   └── WithdrawBtcPin.tsx
│   │   │   │   ├── WithdrawBtcSms
│   │   │   │   │   ├── WithdrawBtcSms.scss
│   │   │   │   │   └── WithdrawBtcSms.tsx
│   │   │   │   ├── WithdrawModal
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── CurrencyList
│   │   │   │   │   │   │   ├── index.scss
│   │   │   │   │   │   │   └── index.tsx
│   │   │   │   │   │   └── FeeInfoBlock
│   │   │   │   │   │       ├── FeeRadios
│   │   │   │   │   │       │   ├── index.scss
│   │   │   │   │   │       │   └── index.tsx
│   │   │   │   │   │       ├── index.scss
│   │   │   │   │   │       └── index.tsx
│   │   │   │   │   ├── WithdrawModal.scss
│   │   │   │   │   └── WithdrawModal.tsx
│   │   │   │   └── WithdrawModalMultisig
│   │   │   │       ├── WithdrawModalMultisig.scss
│   │   │   │       ├── WithdrawModalMultisig.tsx
│   │   │   │       ├── WithdrawModalMultisigUser.scss
│   │   │   │       └── WithdrawModalMultisigUser.tsx
│   │   │   ├── NetworkStatus
│   │   │   │   ├── NetworkStatus.scss
│   │   │   │   └── NetworkStatus.tsx
│   │   │   ├── notification
│   │   │   │   ├── Notification
│   │   │   │   │   ├── Notification.scss
│   │   │   │   │   └── Notification.tsx
│   │   │   │   └── NotificationConductor
│   │   │   │       ├── NotificationConductor.scss
│   │   │   │       └── NotificationConductor.tsx
│   │   │   ├── notifications
│   │   │   │   ├── BTCMultisignRequest
│   │   │   │   │   ├── BTCMultisignRequest.scss
│   │   │   │   │   └── BTCMultisignRequest.tsx
│   │   │   │   ├── ErrorNotification
│   │   │   │   │   └── ErrorNotification.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── Message
│   │   │   │   │   ├── Message.scss
│   │   │   │   │   └── Message.tsx
│   │   │   │   └── SuccessWithdraw
│   │   │   │       ├── SuccessWithdraw.scss
│   │   │   │       └── SuccessWithdraw.tsx
│   │   │   ├── OutsideClick
│   │   │   │   └── index.tsx
│   │   │   ├── PageHeadline
│   │   │   │   ├── PageHeadline.scss
│   │   │   │   ├── PageHeadline.tsx
│   │   │   │   ├── SubTitle
│   │   │   │   │   ├── SubTitle.scss
│   │   │   │   │   └── SubTitle.tsx
│   │   │   │   └── Title
│   │   │   │       ├── Title.scss
│   │   │   │       └── Title.tsx
│   │   │   ├── PreventMultiTabs
│   │   │   │   └── PreventMultiTabs.tsx
│   │   │   ├── QR
│   │   │   │   ├── QR.scss
│   │   │   │   └── QR.tsx
│   │   │   ├── QrReader
│   │   │   │   ├── index.tsx
│   │   │   │   └── styles.scss
│   │   │   ├── Row
│   │   │   │   ├── Row.scss
│   │   │   │   └── Row.tsx
│   │   │   ├── SaveKeys
│   │   │   │   ├── Field
│   │   │   │   │   ├── Field.scss
│   │   │   │   │   └── Field.tsx
│   │   │   │   ├── SaveKeys.scss
│   │   │   │   └── SaveKeys.tsx
│   │   │   ├── Seo
│   │   │   │   ├── JsonLd.tsx
│   │   │   │   ├── PageSeo.tsx
│   │   │   │   └── Seo.tsx
│   │   │   ├── tables
│   │   │   │   ├── InfiniteScrollTable
│   │   │   │   │   └── InfiniteScrollTable.tsx
│   │   │   │   └── Table
│   │   │   │       ├── Table.scss
│   │   │   │       └── Table.tsx
│   │   │   ├── Timer
│   │   │   │   └── Timer.ts
│   │   │   ├── TourWindow
│   │   │   │   ├── index.tsx
│   │   │   │   └── styles.scss
│   │   │   └── ui
│   │   │       ├── Address
│   │   │       │   ├── Address.scss
│   │   │       │   └── Address.tsx
│   │   │       ├── CloseIcon
│   │   │       │   ├── CloseIcon.scss
│   │   │       │   └── CloseIcon.tsx
│   │   │       ├── Copy
│   │   │       │   ├── Copy.scss
│   │   │       │   └── Copy.tsx
│   │   │       ├── CurrencyIcon
│   │   │       │   ├── CurrencyIcon.scss
│   │   │       │   ├── CurrencyIcon.tsx
│   │   │       │   └── images
│   │   │       │       ├── arbeth.svg
│   │   │       │       ├── arn.svg
│   │   │       │       ├── bnb.svg
│   │   │       │       ├── btc.svg
│   │   │       │       ├── bxb.svg
│   │   │       │       ├── dcn.svg
│   │   │       │       ├── drt.svg
│   │   │       │       ├── eth.svg
│   │   │       │       ├── eurs.svg
│   │   │       │       ├── ghost.svg
│   │   │       │       ├── icx.svg
│   │   │       │       ├── index.ts
│   │   │       │       ├── key.svg
│   │   │       │       ├── knc.png
│   │   │       │       ├── kn.svg
│   │   │       │       ├── lev.svg
│   │   │       │       ├── matic.svg
│   │   │       │       ├── next.svg
│   │   │       │       ├── nim.svg
│   │   │       │       ├── omg.svg
│   │   │       │       ├── pay.png
│   │   │       │       ├── scro.svg
│   │   │       │       ├── swap.svg
│   │   │       │       ├── syc2.svg
│   │   │       │       ├── usdt.svg
│   │   │       │       ├── waves.svg
│   │   │       │       ├── wbtc.svg
│   │   │       │       ├── xlm.svg
│   │   │       │       ├── xrp.svg
│   │   │       │       └── yup.svg
│   │   │       ├── CurrencySelect
│   │   │       │   ├── CurrencySelect.tsx
│   │   │       │   └── Option
│   │   │       │       ├── Option.scss
│   │   │       │       └── Option.tsx
│   │   │       ├── DropDown
│   │   │       │   ├── index.scss
│   │   │       │   └── index.tsx
│   │   │       ├── DropdownMenu
│   │   │       │   ├── DropdownMenu.scss
│   │   │       │   └── DropdownMenu.tsx
│   │   │       ├── Expandable
│   │   │       │   ├── Expandable.scss
│   │   │       │   └── Expandable.tsx
│   │   │       ├── Panel
│   │   │       │   ├── Panel.scss
│   │   │       │   └── Panel.tsx
│   │   │       ├── Tooltip
│   │   │       │   ├── ThemeTooltip.tsx
│   │   │       │   ├── Tooltip.scss
│   │   │       │   └── Tooltip.tsx
│   │   │       └── TurboIcon
│   │   │           ├── TurboIcon.scss
│   │   │           └── TurboIcon.tsx
│   │   ├── containers
│   │   │   ├── App
│   │   │   │   ├── App.scss
│   │   │   │   └── App.tsx
│   │   │   ├── Core
│   │   │   │   └── Core.tsx
│   │   │   └── Root
│   │   │       ├── IntlProviderContainer.tsx
│   │   │       └── Root.tsx
│   │   ├── decorators
│   │   │   └── withInfiniteScroll.tsx
│   │   ├── helpers
│   │   │   ├── adminFee.ts
│   │   │   ├── apiLooper.ts
│   │   │   ├── api.ts
│   │   │   ├── arbeth.ts
│   │   │   ├── bnb.ts
│   │   │   ├── btc.ts
│   │   │   ├── cache.ts
│   │   │   ├── constants
│   │   │   │   ├── index.ts
│   │   │   │   ├── localStorage.ts
│   │   │   │   ├── modals.ts
│   │   │   │   ├── notifications.ts
│   │   │   │   ├── PAIR_TYPES.ts
│   │   │   │   ├── privateKeyNames.ts
│   │   │   │   ├── TOKEN_DECIMALS.ts
│   │   │   │   ├── TOKEN_STANDARDS.ts
│   │   │   │   └── TRADE_TICKERS.ts
│   │   │   ├── domUtils.ts
│   │   │   ├── ethToken.ts
│   │   │   ├── eth.ts
│   │   │   ├── externalConfig.ts
│   │   │   ├── feedback.ts
│   │   │   ├── getCurrencyKey.ts
│   │   │   ├── getItezUrl.ts
│   │   │   ├── getPageOffset.ts
│   │   │   ├── getPairFees.ts
│   │   │   ├── getReduxState.ts
│   │   │   ├── ghost.ts
│   │   │   ├── handleGoTrade.ts
│   │   │   ├── ignoreProps.ts
│   │   │   ├── index.ts
│   │   │   ├── links.ts
│   │   │   ├── locale.ts
│   │   │   ├── localStorage.ts
│   │   │   ├── lsDataCache.ts
│   │   │   ├── matic.ts
│   │   │   ├── metamask.ts
│   │   │   ├── migrations
│   │   │   │   ├── 001_initMigration.ts
│   │   │   │   ├── 002_updateHiddenCoinsList.ts
│   │   │   │   └── index.ts
│   │   │   ├── next.ts
│   │   │   ├── routing.ts
│   │   │   ├── seo.ts
│   │   │   ├── Sound
│   │   │   │   └── alert.mp4
│   │   │   ├── stats.swaponline.ts
│   │   │   ├── swapsExplorer.ts
│   │   │   ├── swaps.ts
│   │   │   ├── transactions.ts
│   │   │   ├── user.ts
│   │   │   ├── utils.ts
│   │   │   ├── version.ts
│   │   │   ├── web3.ts
│   │   │   └── wpLogoutModal.ts
│   │   ├── images
│   │   │   ├── checked.svg
│   │   │   ├── close.svg
│   │   │   ├── custom.svg
│   │   │   ├── index.ts
│   │   │   ├── liquality.png
│   │   │   ├── logo
│   │   │   │   ├── logo-black.svg
│   │   │   │   └── logo-colored.svg
│   │   │   ├── metamask.svg
│   │   │   ├── ok.svg
│   │   │   ├── opera.svg
│   │   │   ├── trust.svg
│   │   │   ├── turbo.svg
│   │   │   ├── tx-status
│   │   │   │   ├── done.svg
│   │   │   │   └── pending.svg
│   │   │   ├── unknown.svg
│   │   │   └── walletconnect.svg
│   │   ├── instances
│   │   │   └── newSwap.ts
│   │   ├── localisation
│   │   │   ├── en.json
│   │   │   ├── es.json
│   │   │   ├── nl.json
│   │   │   ├── pl.json
│   │   │   └── ru.json
│   │   ├── pages
│   │   │   ├── CreateWallet
│   │   │   │   ├── chooseColor.ts
│   │   │   │   ├── CreateWallet.scss
│   │   │   │   ├── CreateWallet.tsx
│   │   │   │   ├── Explanation.tsx
│   │   │   │   ├── images
│   │   │   │   │   ├── check.tsx
│   │   │   │   │   ├── fingerprint.svg
│   │   │   │   │   ├── google2FA.svg
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── multisignature.svg
│   │   │   │   │   ├── pin.svg
│   │   │   │   │   ├── sms.svg
│   │   │   │   │   └── withoutSecure.svg
│   │   │   │   └── Steps
│   │   │   │       ├── FirstStep.tsx
│   │   │   │       ├── SecondStep.tsx
│   │   │   │       ├── startPacks.ts
│   │   │   │       ├── StepsWrapper.tsx
│   │   │   │       └── texts.tsx
│   │   │   ├── CurrencyWallet
│   │   │   │   ├── CurrencyWallet.scss
│   │   │   │   └── CurrencyWallet.tsx
│   │   │   ├── Exchange
│   │   │   │   ├── AddressSelect
│   │   │   │   │   ├── AddressSelect.scss
│   │   │   │   │   ├── AddressSelect.tsx
│   │   │   │   │   └── Option
│   │   │   │   │       ├── Option.scss
│   │   │   │   │       └── Option.tsx
│   │   │   │   ├── AtomicSwap
│   │   │   │   ├── Exchange.scss
│   │   │   │   ├── Exchange.tsx
│   │   │   │   ├── HowItWorks
│   │   │   │   │   ├── HowItWorks.scss
│   │   │   │   │   └── HowItWorks.tsx
│   │   │   │   ├── images
│   │   │   │   │   └── swapIcon.svg
│   │   │   │   ├── Orders
│   │   │   │   │   ├── MyOrders
│   │   │   │   │   │   ├── MyOrders.scss
│   │   │   │   │   │   ├── MyOrders.tsx
│   │   │   │   │   │   └── RowFeeds
│   │   │   │   │   │       ├── images
│   │   │   │   │   │       │   ├── accept.svg
│   │   │   │   │   │       │   ├── arrow-right.svg
│   │   │   │   │   │       │   └── share-alt-solid.svg
│   │   │   │   │   │       ├── RowFeeds.scss
│   │   │   │   │   │       └── RowFeeds.tsx
│   │   │   │   │   ├── OrderBook
│   │   │   │   │   │   ├── OrderBook.scss
│   │   │   │   │   │   ├── OrderBook.tsx
│   │   │   │   │   │   ├── RequestButton
│   │   │   │   │   │   │   ├── RequestButton.scss
│   │   │   │   │   │   │   └── RequestButton.tsx
│   │   │   │   │   │   └── Row
│   │   │   │   │   │       ├── Row.scss
│   │   │   │   │   │       └── Row.tsx
│   │   │   │   │   ├── Orders.scss
│   │   │   │   │   ├── Orders.tsx
│   │   │   │   │   ├── Pair.spec.ts
│   │   │   │   │   └── Pair.ts
│   │   │   │   ├── Promo
│   │   │   │   │   ├── Promo.scss
│   │   │   │   │   └── Promo.tsx
│   │   │   │   ├── Quote
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── styles.scss
│   │   │   │   ├── SelectGroup
│   │   │   │   │   ├── SelectGroup.scss
│   │   │   │   │   └── SelectGroup.tsx
│   │   │   │   └── VideoAndFeatures
│   │   │   │       ├── VideoAndFeatures.scss
│   │   │   │       └── VideoAndFeatures.tsx
│   │   │   ├── History
│   │   │   │   ├── Filter
│   │   │   │   │   ├── FilterLink
│   │   │   │   │   │   ├── FilterLink.scss
│   │   │   │   │   │   └── FilterLink.tsx
│   │   │   │   │   ├── Filter.scss
│   │   │   │   │   └── Filter.tsx
│   │   │   │   ├── History.scss
│   │   │   │   ├── History.tsx
│   │   │   │   ├── LinkTransaction
│   │   │   │   │   └── LinkTransaction.tsx
│   │   │   │   ├── Row
│   │   │   │   │   ├── Row.scss
│   │   │   │   │   └── Row.tsx
│   │   │   │   └── SwapsHistory
│   │   │   │       ├── RowHistory
│   │   │   │       │   ├── RowHistory.scss
│   │   │   │       │   └── RowHistory.tsx
│   │   │   │       ├── SwapsHistory.scss
│   │   │   │       └── SwapsHistory.tsx
│   │   │   ├── Invoices
│   │   │   │   ├── CreateInvoice
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── Invoice
│   │   │   │   │   └── index.tsx
│   │   │   │   └── InvoicesList
│   │   │   │       └── index.tsx
│   │   │   ├── LocalStorage
│   │   │   │   ├── LocalStorage.scss
│   │   │   │   └── LocalStorage.tsx
│   │   │   ├── Marketmaker
│   │   │   │   ├── FAQ.scss
│   │   │   │   ├── FAQ.tsx
│   │   │   │   ├── images
│   │   │   │   │   ├── btcIcon.svg
│   │   │   │   │   ├── extensionPromoDark.png
│   │   │   │   │   ├── extensionPromoLight.png
│   │   │   │   │   └── wbtcIcon.svg
│   │   │   │   ├── MarketmakerPromo.scss
│   │   │   │   ├── MarketmakerPromo.tsx
│   │   │   │   ├── MarketmakerSettings.scss
│   │   │   │   ├── MarketmakerSettings.tsx
│   │   │   │   ├── SwapRow.scss
│   │   │   │   └── SwapRow.tsx
│   │   │   ├── Multisign
│   │   │   │   └── Btc
│   │   │   │       ├── Btc.scss
│   │   │   │       └── Btc.tsx
│   │   │   ├── NotFound
│   │   │   │   ├── NotFound.scss
│   │   │   │   └── NotFound.tsx
│   │   │   ├── Swap
│   │   │   │   ├── Debug
│   │   │   │   │   ├── BtcScript.tsx
│   │   │   │   │   ├── Debug.scss
│   │   │   │   │   ├── Debug.tsx
│   │   │   │   │   └── ShowBtcScript.tsx
│   │   │   │   ├── DeleteSwapAfterEnd.tsx
│   │   │   │   ├── FailControler
│   │   │   │   │   ├── FailControler.scss
│   │   │   │   │   └── FailControler.tsx
│   │   │   │   ├── FeeControler
│   │   │   │   │   ├── FeeControler.scss
│   │   │   │   │   └── FeeControler.tsx
│   │   │   │   ├── SwapController.tsx
│   │   │   │   ├── swaps
│   │   │   │   │   ├── build.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Swap.scss
│   │   │   │   ├── Swap.tsx
│   │   │   │   ├── Timer
│   │   │   │   │   ├── Timer.scss
│   │   │   │   │   └── Timer.tsx
│   │   │   │   └── UTXOSwap
│   │   │   │       ├── DepositWindow
│   │   │   │       │   └── DepositWindow.tsx
│   │   │   │       ├── EthLikeToUTXO.tsx
│   │   │   │       ├── EthTokenToUTXO.tsx
│   │   │   │       ├── SwapList
│   │   │   │       │   ├── SwapList.scss
│   │   │   │       │   ├── SwapList.tsx
│   │   │   │       │   ├── SwapProgressTexts
│   │   │   │       │   │   ├── MakerAbToUtxo.tsx
│   │   │   │       │   │   ├── MakerUtxoToAb.tsx
│   │   │   │       │   │   ├── TakerAbToUtxo.tsx
│   │   │   │       │   │   └── TakerUtxoToAb.tsx
│   │   │   │       │   └── SwapSteps
│   │   │   │       │       ├── ABSteps
│   │   │   │       │       │   ├── SecondStep.tsx
│   │   │   │       │       │   └── ThirdStep.tsx
│   │   │   │       │       ├── FirstStep.tsx
│   │   │   │       │       ├── FourthStep.tsx
│   │   │   │       │       └── UTXOSteps
│   │   │   │       │           ├── SecondStep.tsx
│   │   │   │       │           └── ThirdStep.tsx
│   │   │   │       ├── SwapPairInfo.tsx
│   │   │   │       ├── SwapProgress
│   │   │   │       │   ├── PleaseDontLeaveWrapper.tsx
│   │   │   │       │   ├── SwapProgress.scss
│   │   │   │       │   └── SwapProgress.tsx
│   │   │   │       ├── UTXOToEthLike.tsx
│   │   │   │       └── UTXOToEthToken.tsx
│   │   │   ├── Transaction
│   │   │   │   ├── styles.scss
│   │   │   │   ├── Transaction.tsx
│   │   │   │   └── TxInfo
│   │   │   │       ├── index.tsx
│   │   │   │       └── styles.scss
│   │   │   ├── TurboSwap
│   │   │   │   ├── TurboSwap.scss
│   │   │   │   ├── TurboSwap.tsx
│   │   │   │   ├── Tx.scss
│   │   │   │   ├── TxSide.scss
│   │   │   │   ├── TxSide.tsx
│   │   │   │   └── Tx.tsx
│   │   │   └── Wallet
│   │   │       ├── CurrenciesList.tsx
│   │   │       ├── Endpoints
│   │   │       │   └── index.tsx
│   │   │       ├── images
│   │   │       │   ├── btc.svg
│   │   │       │   ├── dollar.svg
│   │   │       │   ├── pen.svg
│   │   │       │   └── security.svg
│   │   │       ├── NotityBlock
│   │   │       │   ├── NotifyBlock.scss
│   │   │       │   └── NotifyBlock.tsx
│   │   │       ├── PartOfAddress
│   │   │       │   └── index.tsx
│   │   │       ├── Row
│   │   │       │   ├── Row.scss
│   │   │       │   └── Row.tsx
│   │   │       ├── WallerSlider
│   │   │       │   └── index.tsx
│   │   │       ├── Wallet.scss
│   │   │       └── Wallet.tsx
│   │   ├── plugins
│   │   │   ├── backupUserData.ts
│   │   │   ├── index.ts
│   │   │   └── saveUserData.ts
│   │   ├── redux
│   │   │   ├── actions
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── backupManager.ts
│   │   │   │   ├── btcmultisig.ts
│   │   │   │   ├── btc.ts
│   │   │   │   ├── comments.ts
│   │   │   │   ├── core.ts
│   │   │   │   ├── erc20LikeAction.ts
│   │   │   │   ├── ethLikeAction.ts
│   │   │   │   ├── feed.ts
│   │   │   │   ├── filter.ts
│   │   │   │   ├── ghost.ts
│   │   │   │   ├── history.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── invoices.ts
│   │   │   │   ├── loader.ts
│   │   │   │   ├── modals.ts
│   │   │   │   ├── multisigTx.ts
│   │   │   │   ├── next.ts
│   │   │   │   ├── notifications.ts
│   │   │   │   ├── noxon.ts
│   │   │   │   ├── pairs.ts
│   │   │   │   ├── pubsubRoom.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── ui.ts
│   │   │   │   ├── usdt.ts
│   │   │   │   └── user.ts
│   │   │   ├── core
│   │   │   │   ├── index.ts
│   │   │   │   └── reducers.ts
│   │   │   ├── middleware
│   │   │   │   ├── index.ts
│   │   │   │   ├── saver.ts
│   │   │   │   └── selectiveSaver.ts
│   │   │   ├── reducers
│   │   │   │   ├── api.ts
│   │   │   │   ├── core.ts
│   │   │   │   ├── createWallet.ts
│   │   │   │   ├── currencies.ts
│   │   │   │   ├── feeds.ts
│   │   │   │   ├── history.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── inputActive.ts
│   │   │   │   ├── loader.ts
│   │   │   │   ├── modals.ts
│   │   │   │   ├── notifications.ts
│   │   │   │   ├── pubsubRoom.ts
│   │   │   │   ├── rememberedOrders.ts
│   │   │   │   ├── ui.ts
│   │   │   │   └── user.ts
│   │   │   └── store
│   │   │       └── index.ts
│   │   └── routes
│   │       └── index.tsx
│   └── tools
│       ├── libs
│       │   └── fs.js
│       ├── messages.js
│       └── run.js
└── README.md
```
339 directories, 1023 files