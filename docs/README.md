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

No coding skills? Use :package: [WordPress plugin with admin panel](https://codecanyon.net/item/multicurrency-crypto-wallet-and-exchange-widgets-for-wordpress/23532064) :package: and installation service for $100 (send [sashanoxon](https://t.me/sashanoxon) access to your server).

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

1) Fork this repository (Click "Fork" on top of this page)
2) Clone repository
```
git clone https://github.com/swaponline/MultiCurrencyWallet.git
```
3) Use Node 11
```
nvm alias default 11.15.0
nvm use 11.15.0
```
4) Install modules
```
cd MultiCurrencyWallet
npm i
```
(Windows? Use [windows-build-tools](https://www.npmjs.com/package/windows-build-tools).)
(Linux? Install `build-essential`, `g++`, `python` and `make`)

5) Start dev mode
```
npm run start
```
The dev server is running! (http://localhost:9001)

To access from other devices on the local network, specify your IP address:
```
HOST=X.X.X.X npm run start
```

6) Build for prod
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
2. upoad to your domain (https://domain.com/build-mainnet-widget)
3. open in browser

Remember: you MUST be online and you can not prosess more than one exchange at the same time. Otherwise you can use our custodian service for 1% fee and $50 setup (contact [sashanoxon](https://t.me/sashanoxon) for details).

## How to customize (images, colors, etc..)

### 1. Change logo
* copy svg logos to `MultiCurrencyWallet/shared/components/Logo/images` folder
* in `index.js` set up your url and image
```
export default {
  colored: {
    yourUrl: imagename,
    localhost: base,
    'swap.online': swapOnlineColored,
  },
  common: {
    сyourUrl: imageName,
    'swap.online': swapOnline,
  },
}
```
* For change preloader go to `client/index.html` and change url to tour image
```
  <div id="loader">
      <img src="https://wiki.swap.online/assets/swap-logo.png" />
  </div>
```
* change Cryptocurrency color `MultiCurrencyWallet/shared/components/ui/CurrencyIcon/images`
* change icon to your (with the same name, e.x. "bitcoin.svg") 
* change cryptocurrency icon  `MultiCurrencyWallet/shared/pages/Exchange/CurrencySlider/images`

### 2. Change links to social networks
Set your own links in `MultiCurrencyWallet/shared/helpers/links.js`

### 3. Change text
   To prevent any conflicts in future (when you will update your source from our branch)
   * find in sourse text like this:
        ``` <FormattedMessage id="Row313" defaultMessage="Deposit" />  ```

   * go to folder `MultiCurrencyWallet/shared/localisation`
     open en.js
     find string with the same id ("Row313")

      ```
        {
            "id": "Row313",
            "message": "Deposit",
            "files": [
            "shared/pages/Currency/Currency.js",
            "shared/pages/CurrencyWallet/CurrencyWallet.js",
            ]
        },
      ```

   * change text in `message` var

### 4. Add your ERC20 token

   * go to `MultiCurrencyWallet/config/mainnet/erc20.js`
   * go to `MultiCurrencyWallet/swap.core/src/swap.app/constants/COINS.js` and add token there too
   * go to `MultiCurrencyWallet/shared/redux/reducers/currencies.js` and add token there too

### 5. Add token to "Create wallet" screen

* go to `shared/redux/reducers/currencies.js` and change `addAssets: false,` to `true`

![](https://screenshots.wpmix.net/chrome_J9boBqgIfnB5OHeDUtnCYcZ3kPQ4oJtN.png)

### 6. Change project name in "too many tabs" screen
0. go to `index.html`
1. add / edit ```window.widgetName``` to your own

### 7. Change title
0. go to `index.html`
1. add / edit ```window.defaultWindowTitle``` to your own

### 8. Change logo link (default main wallet page)
0. go to `index.html`
1. add / edit ```window.LOGO_REDIRECT_LINK``` to your own

### 9. Set custom exchange rate
0. add ```customEcxchangeRate``` to ```window.widgetERC20Tokens```
1. add usd price for ```window.widgetERC20Tokens```

### 10. Add exit button to your widget
in `index.html` edit `isUserRegisteredAndLoggedIn=false` to `isUserRegisteredAndLoggedIn=true`

### enable/disbale blockchains on domain
add config named as your domain to /src/front/externalConfigs/

```
window.buildOptions = {
  showWalletBanners: true, // Allow to see banners
  showHowItsWork: true, // Allow show block 'How its work' on exchange page
  curEnabled: {
    btc: true,
    eth: true,
    ghost: true,
    next: true,
  },
}
```

Example https://github.com/swaponline/MultiCurrencyWallet/blob/master/src/front/externalConfigs/swaponline.github.io.js#L43


## How to update your version (fork) to latest version
0. Make backup and `git push` all your changes to your repository
1. go here https://github.com/swaponline/MultiCurrencyWallet/compare?expand=1 , click <kbd>Compare across forks</kbd>
2. select your repository in "base branch" (left)
3. click "Create pull request" (enter any title)
4. click "Merge pull request"

If you have conflicts (if sources has been changed on your side) click "resolve conflicts".

---

Any questions are welcome: [sashanoxon](https://t.me/sashanoxon)
