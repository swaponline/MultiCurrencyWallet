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
  eth: {
    fee: '7',
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
    min: '0,001',
  },
  bnb: {
    fee: '7',
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
    min: '0,001',
  },
  matic: {
    fee: '7',
    address: '0x57d49704F453CdD2b995280d9D7F557E42847d82',
    min: '0,01',
  },
  arbeth: {
    fee: '3',
    address: '0x57d49704F453CdD2b995280d9D7F557E42847d82',
    min: '0,001',
  },
  aureth: {
    fee: '3',
    address: '0x57d49704F453CdD2b995280d9D7F557E42847d82',
    min: '0,001',
  },
  xdai: {
    fee: '3',
    address: '0x57d49704F453CdD2b995280d9D7F557E42847d82',
    min: '0,01',
  },
  ftm: {
    fee: '3',
    address: '0x57d49704F453CdD2b995280d9D7F557E42847d82',
    min: '0,001',
  },
  avax: {
    fee: '3',
    address: '0x57d49704F453CdD2b995280d9D7F557E42847d82',
    min: '0,001',
  },
  movr: {
    fee: '3',
    address: '0x57d49704F453CdD2b995280d9D7F557E42847d82',
    min: '0,001',
  },
  one: {
    fee: '3',
    address: '0x57d49704F453CdD2b995280d9D7F557E42847d82',
    min: '0,01',
  },
  ame: {
    fee: '3',
    address: '0x57d49704F453CdD2b995280d9D7F557E42847d82',
    min: '0,01',
  },
  erc20: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
  bep20: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
  erc20matic: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
  erc20xdai: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
  erc20ftm: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
  erc20avax: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
  erc20movr: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
  erc20one: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
  erc20ame: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
  erc20aurora: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
}
/*
window.widgetEvmLikeTokens = [
  // {
  //   standard: '',
  //   address: '',
  //   decimals: ,
  //   name: '',
  //   fullName: '',
  //   icon: '',
  //   customExchangeRate: '',
  //   customFiatPrice: '',
  //   iconBgColor: '',
  //   howToDeposit: '',
  //   howToWithdraw: '',
  // },
  // {
  //   standard: 'erc20',
  //   address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  //   decimals: 6,
  //   name: 'USDT',
  //   fullName: 'Usdt',
  //   icon: 'https://growup.wpmix.net/wp-content/uploads/2016/10/favicon.png',
  // },
  // {
  //   standard: 'erc20',
  //   address: '0xc060b26e60698e91a6acc84051a26b32e38dd1a4',
  //   decimals: 18,
  //   name: 'PROXIMA',
  //   fullName: 'Proxima',
  //   icon: 'https://growup.wpmix.net/wp-content/uploads/2016/10/favicon.png',
  //   iconBgColor: '#ccc',
  // },
]
*/

window.buildOptions = {
  // ownTokens: true, // Will be inited from window.widgetEvmLikeTokens
  // addCustomTokens: true, // Allow user add custom evm like tokens
  // invoiceEnabled: true, // Allow create invoices
  // hideShowPrivateKey: true, // Hide 'Copy Private Key' Menu item, default false, inited also from window.SWAP_HIDE_EXPORT_PRIVATEKEY
  showWalletBanners: true, // Allow to see banners
  showHowItsWork: true, // Can be inited from window.showHowItWorksOnExchangePage
  // inited from window.EXCHANGE_DISABLED
  exchangeDisabled: false,
  curEnabled: { // Or 'false' if enabled all
    // inited from window.CUR_<NAME>_DISABLED
    btc: true,
    eth: true,
    bnb: true,
    matic: true,
    arbeth: true,
    aureth: true,
    xdai: true,
    ftm: true,
    avax: true,
    movr: true,
    one: true,
    ame: true,
    ghost: true,
    next: false,
  },
  blockchainSwapEnabled: {
    btc: true,
    eth: true,
    bnb: true,
    matic: true,
    arbeth: false,
    aureth: false,
    xdai: false,
    ftm: false,
    avax: false,
    movr: false,
    one: false,
    ame: false,
    ghost: false,
    next: false,
  },
  defaultExchangePair: {
    buy: '{eth}usdt',
    sell: 'btc',
  }
}
