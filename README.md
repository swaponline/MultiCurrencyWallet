![Deploy to swaponline.github.io](https://github.com/swaponline/swap.react/workflows/Deploy%20to%20swaponline.github.io/badge.svg)

## Open-source Multicurrency wallet for Bitcoin and custom assets, and p2p excahnge

Live version here: https://swaponline.github.io  

No coding skills? Buy WordPress plugin https://codecanyon.net/item/multicurrency-crypto-wallet-and-exchange-widgets-for-wordpress/23532064 with admin panel. Installation 100$ (send us assess to your server t.me/sashanoxon)


<h2>1. Multi-currency wallet. Your users can store Bitcoin and custom assets</h2>
Add many assets to your wallet. 

<img src="http://growup.wpmix.net/DesAndMob3.png">

<br>
Checkout this case: <a href="https://twitter.com/Atomic_Wallet" target="_blank">https://twitter.com/Atomic_Wallet</a> (our real client)


<h2>3. ERC20 wallet</h2>
<a href="https://generator.swaponline.site/livedemo/0x4E12EB8e506Ccd1427F6b8F7faa3e88fB698EB28/319aa913-4e84-483f-a0d1-8664a13f56b7/#/JACK-wallet">Wallet demo (custom asset "SWAP")</a>
<img src="https://generator.swaponline.site/generator/assets/img/example_wallet.png">


<h2>3. Buy/Sell assets . (Exchange widget)</h2>

<a href="https://generator.swaponline.site/livedemo/0x4E12EB8e506Ccd1427F6b8F7faa3e88fB698EB28/319aa913-4e84-483f-a0d1-8664a13f56b7/#/buy/btc-to-jack">Exchange widget live demo</a>
<img src="https://generator.swaponline.site/generator/assets/img/example_exchange.png">
 <br> <br>

<h3>4. Secondary market (trading btw users)</h3>
1. <a href="https://swaponline.github.io/#/usdt-btc">Demo (orderbook)</a>
2. Real client: <a href="https://sonm.com/swap-online/">https://sonm.com/swap-online/</a>

<h3>6. Other demos</h3>
<a href="https://swaponline.github.io/#/usdt-wallet">USDT stablecoin wallet (payment system)</a>

## Swap  React

### Install

#### Eng
1) Fork this repository (Click "Fork" on top of this page)
2) Clone repository with submodules (swap.core)
```
git clone --recurse-submodules https://github.com/swaponline/MultiCurrencyWallet.git
```

3) Do `npm i` (windows? https://www.npmjs.com/package/windows-build-tools )<br /> (node 10 required, not 12!)
```
nvm use 10.18.1 or 11.15.0
cd swap.react
npm i
```

4) Do `git submodule update` in swap.react directory
```
git submodule init
git submodule sync
git submodule update --remote
```

5) For dev mode `npm run start`, for prod `npm run build`
   > If you need to deploy it on your own (site) origin - run build like: `npm run build:mainnet https://yourcoolsite.com/`



```
npm run start
```

### Build with custom ERC20 token (BTC,ETH,)
1. npm run build:mainnet-widget {erc20contract} {name} {decimals} {tiker}

example:
```
npm run build:mainnet-widget 0x4E12EB8e506Ccd1427F6b8F7faa3e88fB698EB28 jack 18 JACK full
```
2. upoad to your domain (https://domain.com/build-mainnet-widget)
3. open in browser

Remember you MUST be online and you can not prosess more than one exchange at the same time. Otherwise you can use our custodian service for 1% fee and $50 setup. contact https://t.me/sashanoxon for details)
 
## How to change images and colors

### 1. Logo
swap.react/shared/components/Logo
* copy svg logos to  `images`folder
* in index.js set up your url and image
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
* For change preloader go to "client/index.html" and change url to tour image
```
  <div id="loader">
      <img src="https://wiki.swap.online/assets/swap-logo.png" />
  </div>
```
* change Cryptocurrency color `swap.react/shared/components/ui/CurrencyIcon/images`
* change icon to your (with the same name, e.x. "bitcoin.svg") 
* change cryptocurrency icon  `/swap.react/shared/pages/PartialClosure/CurrencySlider/images`
### HOW to ADD EXIT BUTTON TO UR WIDGET
in index html edit isUserRegisteredAndLoggedIn=false to isUserRegisteredAndLoggedIn=true

### 2. How to change links to social networks
    `swap.react/shared/helpers/links.js`
* в папке `links` меняем ссылки на свои

### 3. How to change text
   To prevent any conflicts in future (when you will update your source from our branch) 
   * find in sourse text like this: 
        ``` <FormattedMessage id="Row313" defaultMessage="Deposit" />  ```

   * go to folder `swap.react/shared/localisation`
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

### 4. How to add new ERC20 token

   * go to `swap.react/config/mainnet/erc20.js`
   * go to `swap.react/swap.core/src/swap.app/constants/COINS.js` and add token there too
   * go to `shared/redux/reducers/currencies.js` and add token there too

### 5. How to add token to "Create wallet" screen

* go to `shared/redux/reducers/currencies.js` and change `addAssets: false,` to `true`

![](https://screenshots.wpmix.net/chrome_J9boBqgIfnB5OHeDUtnCYcZ3kPQ4oJtN.png)


## update swap.core submodules 
if you have changed swap.core submodule don't forget to pull new "link" 
```
cd swap.core 
git checkout master 
git fetch
git pull
```

## how to update your version (fork) to latest version:
0. Make backup and "git push" all your changes to your repository
1. go here https://github.com/swaponline/swap.react/compare?expand=1 , click "Compare across forks"
2. select your repository in "base branch" (left)
3. click "Create pull request" (enter any title)
4. click "Merge pull request"

if you have conflicts (if sources has been changed on your side) click "resolve conflicts".

# DeFi style (borrow/lend) 
![](https://screenshots.wpmix.net/chrome_ta4cbcsWgMjqbYSp9rFTwMa5bJDBYjcF.png) 
https://drive.google.com/file/d/15e0ODxzbtiu0xJOeKKuJ2SzffZmc5_OA/view 

for any questions: telegram <a href="https://t.me/sashanoxon">sashanoxon</a>

## how to change project name in "many tabs" errors:
0. go to index.html
1. add / edit  ```window.widgetName``` to your own
.
## how to change title:
0. go to index.html
1. add / edit  ```window.defaultWindowTitle``` to your own
.

## how add custum exchange Rate:
0. add ```customEcxchangeRate``` to ```window.widgetERC20Tokens```
1. add usd price for ```window.widgetERC20Tokens```
.
SUM Branch init 5/9/20
