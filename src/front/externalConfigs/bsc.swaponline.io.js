window.buildOptions = {
  showWalletBanners: true,
  showHowItsWork: true, // section on Exchange page
  curEnabled: {
    btc: true,
    bnb: true,
    ghost: true,
    next: true,
  },
  blockchainSwapEnabled: {
    btc: true,
    bnb: false,
    ghost: false,
    next: false,
  },
  defaultExchangePair: {
    buy: 'wbtc',
    sell: 'btc',
  }
}