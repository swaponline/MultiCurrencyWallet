# Customization guide

## 1. Change logo

- copy svg logos to `MultiCurrencyWallet/src/front/shared/components/Logo/images` folder
- in `MultiCurrencyWallet/src/front/client/index.js` set up your url and image

```
export default {
  colored: {
    yourUrl: imageName,
    localhost: base,
    'swap.online': swapOnlineColored,
  },
  common: {
    yourUrl: imageName,
    'swap.online': swapOnline,
  },
}
```

(Way to index.html: `MultiCurrencyWallet/src/front/client/index.html`)

- For change preloader go to `index.html` and change url to tour image

```
  <div id="loader" class="loader">
      <img id="loaderImg" src="https://wiki.swap.online/assets/swap-logo.png" />
  </div>
```

- change Cryptocurrency color `MultiCurrencyWallet/src/front/shared/components/ui/CurrencyIcon/images`
- change icon to your (with the same name, e.x. "bitcoin.svg")
- change Cryptocurrency icon `MultiCurrencyWallet/src/front/shared/pages/Exchange/CurrencySlider/images`


## 2. Change links to social networks

Set your own links in `MultiCurrencyWallet/src/front/shared/helpers/links.js`


## 3. Change text

To prevent any conflicts in future (when you will update your source from our branch)

- find in source text like this:
  `<FormattedMessage id="Row313" defaultMessage="Deposit" /> `

- go to folder `MultiCurrencyWallet/src/front/shared/localisation`
  open en.json
  find string with the same id ("Row313")

  ```
    {
      "id": "Row313",
      "message": "Deposit",
      "files": [
        "shared/pages/Currency/Currency.js"
      ]
    },
  ```

- change text in `message` value


## 4. Add your ERC20 token

- go to `MultiCurrencyWallet/src/front/config/mainnet/erc20.js`
- go to `MultiCurrencyWallet/src/core/swap.app/constants/COINS.js` and add token there too
- go to `MultiCurrencyWallet/src/front/shared/redux/reducers/currencies.js` and add token there too


## 5. Add token to "Create wallet" screen

- go to `MultiCurrencyWallet/src/front/shared/redux/reducers/currencies.js` and change `addAssets: false,` to `true`


## 6. Change project name in "too many tabs" screen

0. go to `index.html`
1. add / edit `window.widgetName` to your own


## 7. Change title

0. go to `index.html`
1. add / edit `window.defaultWindowTitle` to your own


## 8. Change logo link (default main wallet page)

0. go to `index.html`
1. add / edit `window.LOGO_REDIRECT_LINK` to your own


## 9. Set custom exchange rate

0. add `customExchangeRate` to `window.widgetEvmLikeTokens`
1. add usd price for `window.widgetEvmLikeTokens`


## 10. Add exit button to your widget

in `index.html` edit `window.isUserRegisteredAndLoggedIn = false` to `true`


## enable/disbale blockchains on domain

add config named as your domain to `MultiCurrencyWallet/src/front/externalConfigs/swaponline.github.io.js`

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

Example: [swaponline.github.io.js](https://github.com/swaponline/MultiCurrencyWallet/blob/master/src/front/externalConfigs/swaponline.github.io.js#L43)


## How to update your version (fork) to latest version

0. Make backup and `git push` all your changes to your repository
1. go here https://github.com/swaponline/MultiCurrencyWallet/compare?expand=1 , click <kbd>Compare across forks</kbd>
2. select your repository in "base branch" (left)
3. click "Create pull request" (enter any title)
4. click "Merge pull request"

If you have conflicts (if sources has been changed on your side) click "resolve conflicts".