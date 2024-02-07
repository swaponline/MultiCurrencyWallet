// swaponline.github.io

/* window.widgetEvmLikeTokens = [
  // {
  //   standard: '',
  //   address: '',
  //   decimals: ,
  //   name: '',
  //   fullName: '',
  //   icon: '',
  //   customExchangeRate: '',
  //   iconBgColor: '',
  //   howToDeposit: '',
  //   howToWithdraw: '',
  // },
  // {
  //   standard: 'erc20',
  //   address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  //   decimals: 6,
  //   symbol: 'USDT',
  //   fullName: 'Usdt',
  //   icon: 'https://growup.wpmix.net/wp-content/uploads/2016/10/favicon.png',
  // },
  // {
  //   standard: 'erc20',
  //   address: '0xc060b26e60698e91a6acc84051a26b32e38dd1a4',
  //   decimals: 18,
  //   fullName: 'Proxima',
  //   icon: 'https://growup.wpmix.net/wp-content/uploads/2016/10/favicon.png',
  //   iconBgColor: '#ccc',
  // },
] */

/* window.buildOptions = {
  ownTokens: false, // Will be inited from window.widgetEvmLikeTokens
  addCustomTokens: false, // Allow user add custom evm like tokens
  curEnabled: { // Or 'false' if enabled all
    btc: true,
    eth: true,
  },
  showWalletBanners: true, // Allow to see banners
  invoiceEnabled: false, // Allow create invoices
} */



window.buildOptions = {
  showWalletBanners: true, // Allow to see banners
  showHowItsWork: true, // Allow show block 'How its work' on exchange page
  curEnabled: {
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
    phi_v1: true,
    phi: true,
    fkw: true,
    phpx: true,
  },
  blockchainSwapEnabled: {
    btc: true,
    eth: false,
    bnb: false,
    matic: false,
    arbeth: false,
    aureth: false,
    xdai: false,
    ftm: false,
    avax: false,
    movr: false,
    one: false,
    ame: true,
    ghost: false,
    next: false,
    phi_v1: false,
    phi: false,
    fkw: false,
    phpx: false,
  },
  defaultExchangePair: {
    buy: '{eth}wbtc',
    sell: 'btc',
  }
}
