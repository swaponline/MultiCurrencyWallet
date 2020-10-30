[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Deploy to swaponline.github.io](https://github.com/swaponline/MultiCurrencyWallet/workflows/Deploy%20to%20swaponline.github.io/badge.svg)
[![About SWAP token](https://img.shields.io/badge/ERC20-SWAP-green)](https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/SWAPTOKEN.md)

## MultiCurrencyWallet

- 👛 Crypto wallet: BTC, ETН, USDT, {your_token}...
- 💵 Fiat gateway: USD, EUR, RUB, UAH...
- ⚛️ P2P exchange – atomic swaps
- 💡 Open-source, client-side
- 📦 Embeddable into your site!

Live version here: https://swaponline.github.io

No coding skills? Use :package: [WordPress plugin with admin panel](https://codecanyon.net/item/multicurrency-crypto-wallet-and-exchange-widgets-for-wordpress/23532064) :package: and installation service for \$100 (send [sashanoxon](https://t.me/sashanoxon) access to your server).

Looking for investment opportunity? Read about [ERC20:SWAP token](https://github.com/swaponline/MultiCurrencyWallet/blob/master/docs/SWAPTOKEN.md)

### 1. Multi-currency wallet: your users can store Bitcoin and custom assets

Add many assets to your wallet:

<img src="https://wallet.wpmix.net/codecanyon_description_3.jpg">

<br>
Checkout this case: <a href="https://twitter.com/Atomic_Wallet" target="_blank">https://twitter.com/Atomic_Wallet</a> (our real client)

### 2. ERC20 token wallet

<a href="https://generator.swaponline.site/livedemo/0x4E12EB8e506Ccd1427F6b8F7faa3e88fB698EB28/319aa913-4e84-483f-a0d1-8664a13f56b7/#/JACK-wallet">Wallet demo (custom asset "SWAP")</a>
<img src="https://generator.swaponline.site/generator/assets/img/example_wallet.png">

### 3. Buy/Sell assets (exchange widget)

<a href="https://generator.swaponline.site/livedemo/0x4E12EB8e506Ccd1427F6b8F7faa3e88fB698EB28/319aa913-4e84-483f-a0d1-8664a13f56b7/#/buy/btc-to-jack">Exchange widget live demo</a>
<img src="https://generator.swaponline.site/generator/assets/img/example_exchange.png">
<br>

### 4. Secondary market (trading between users)

1. <a href="https://swaponline.github.io/#/usdt-btc">Demo (orderbook)</a>
2. Real client: <a href="https://sonm.com/swap-online/">https://sonm.com/swap-online/</a>

### 5. Other demos

<a href="https://swaponline.github.io/#/usdt-wallet">USDT stablecoin wallet (payment system)</a>

## Usage

### Installation / how to start

1. Fork this repository (Click "Fork" on top of this page)
2. Clone repository

```
git clone https://github.com/swaponline/MultiCurrencyWallet.git
```

3. Use Node 11

(For change Node version on Linux use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
(For Windows use [nvm for Windows](https://github.com/coreybutler/nvm-windows))

```
nvm alias default 11.15.0
nvm use 11.15.0
```

4. Install modules

```
cd MultiCurrencyWallet
npm i
```

(Windows? Use [windows-build-tools](https://www.npmjs.com/package/windows-build-tools).)
(Linux? Install `build-essential`, `g++`, `python` and `make`)

5. Start dev mode

```
npm run start
```

The dev server is running! (http://localhost:9001)

To access from other devices on the local network, specify your IP address:

```
HOST=X.X.X.X npm run start
```

6. Build for prod

```
npm run build:mainnet https://yourcoolsite.com/
```

(don't forget to add a slash in the end of url)

### Build with your custom ERC20 token (among BTC, ETH)

1. npm run build:mainnet-widget {erc20contract} {name} {decimals} {ticker}

Example:

```
npm run build:mainnet-widget 0x4E12EB8e506Ccd1427F6b8F7faa3e88fB698EB28 jack 18 JACK full
```

2. upload to your domain (https://domain.com/build-mainnet-widget)
3. open in browser

Remember: you MUST be online and you can not process more than one exchange at the same time. Otherwise you can use our custodian service for 1% fee and \$50 setup (contact [sashanoxon](https://t.me/sashanoxon) for details).


## MultiCurrencyWallet is international

Supported languages:

- 🇬🇧 EN
- 🇷🇺 RU
- 🇳🇱 NL
- 🇪🇸 ES

Work in progress to add more languages.


## MultiCurrencyWallet is customizable (images, colors, texts, etc..) for your project

- Using [WordPress plugin](https://codecanyon.net/item/multicurrency-crypto-wallet-and-exchange-widgets-for-wordpress/23532064)? Сustomize right in the admin panel!
- Using your own build? Read the [customization guide](/docs/CUSTOMIZATION.md).


## MultiCurrencyWallet open for integrations

See the [list of our clients](/docs/CLIENTS.md).


---

Any questions [are welcome](https://t.me/mcvchat)
