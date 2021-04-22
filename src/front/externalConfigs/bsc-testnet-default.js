window.widgetERC20Comisions = {
  btc: {
    fee: '5',
    address: '2MuXz9BErMbWmoTshGgkjd7aMHeaxV8Bdkk',
    min: '0.00001',
  },
  ghost: {
    fee: '5',
    address: 'XUmEvrKkTEGPr8WaktQVVE49ZBxcaPUmwv',
    min: '0.00001',
  },
  next: {
    fee: '5',
    address: 'XMkvVVvuQJp4mp5hoVHUPumbnvh63xJsN4', // random address
    min: '0.00001',
  },
  bnb: {
    fee: '7',
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
    min: '0,001',
  },
  // TODO: rename with bep20
  erc20: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
}

window.buildOptions = {
  showWalletBanners: true, // Allow to see banners
  showHowItsWork: true, // Can be inited from window.showHowItWorksOnExchangePage
  // inited from window.EXCHANGE_DISABLED
  exchangeDisabled: false,
  curEnabled: { // Or 'false' if enabled all
    // inited from window.CUR_<NAME>_DISABLED
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
    buy: 'usdt',
    sell: 'btc',
  }
}