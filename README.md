## swap.online

Atomic swap cryptocurrency protocol. Live version here: https://swaponline.github.io . Atomic swap library at http://github.com/swaponline/swap.core.

important: 
- 1/ atomic swap feature works without backend. It means that if you place order and go offline your order go offline too (nobody see him and make swap with you). 
- 2/ Your exchange takes 2 minutes, some mining fee (BTC and ETH).
- 3/ If you want to create wallet for your token, create build and place it onto your site (as HTML) https://generator.swaponline.site/generator/ . (If you want to accept bitcoin in your crowdsale - remember you MUST be online and you can not prosess more than 1 exchange at the same time. Otherwise you can use our custodian service for 1% fee. contact https://t.me/sashanoxon for details)


## Swap  React

### Install

#### Eng
1) Fork this repository (Click "Fork" on top of this page)
2) Clone repository with submodules (swap.core)
```
git clone --recurse-submodules https://github.com/swaponline/swap.react.git
```

3) Do `npm i` (windows? https://www.npmjs.com/package/windows-build-tools )<br /> (node 10 required, not 12!)
```
nvm use 10.18.1
cd swap.react
npm i
```

4) Do `git submodule update` in swap.react directory

5) For dev mode `npm run start`, for prod `npm run build`
   > If you need to deploy it on your own (site) origin - run build like: `npm run build:mainnet https://yourcoolsite.com/`

```
npm run start
```

#### Ru

1) Склонируйте репозиторий со вложенными модулями (swap.core)
```
git clone --recurse-submodules https://github.com/swaponline/swap.react.git
```

2) Установите зависимости с помощью пакетного менеджера `npm i` <br />
```
cd swap.react
npm i
```

3) Обновите вложенные модули с помощью `git submodule update` в папке swap.react

4) Чтобы начать разработку - запустите `npm run start`, для сборки продуктовой версии - `npm run build`
   > Если нужно поместить сборку на ваш собственный домен - запустите сборку с указанием вашего домена: `npm run build:mainnet https://your.cool.origin/`

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

Remember you MUST be online and you can not prosess more than one exchange at the same time. Otherwise you can use our custodian service for 1% fee and $100 setup. contact https://t.me/sashanoxon for details)
 
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
            "shared/pages/OldWallet/Row/Row.js"
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





## how to update your version (fork) to latest version:
0. Make backup and "git push" all your changes to your repository
1. go here https://github.com/swaponline/swap.react/compare?expand=1
2. select your repository in "base branch" (left)
3. click "Create pull request" (enter any title)
4. click "Merge pull request"

if you have conflicts (if sources has been changed on your side) click "resolve conflicts".

