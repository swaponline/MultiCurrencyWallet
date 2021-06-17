// mainnet-localhost
/*
window.widgetEvmLikeTokens = [
  {
    standard: '',
    address: '',
    decimals: ,
    name: '',
    fullName: '',
    icon: '',
    customExchangeRate: '',
    iconBgColor: '',
    howToDeposit: '',
    howToWithdraw: '',
  },
  {
    standard: 'erc20',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    decimals: 6,
    symbol: 'USDT',
    fullName: 'Usdt',
    icon: 'https://growup.wpmix.net/wp-content/uploads/2016/10/favicon.png',
  },
  {
    standard: 'erc20',
    address: '0xc060b26e60698e91a6acc84051a26b32e38dd1a4',
    decimals: 18,
    fullName: 'Proxima',
    icon: 'https://growup.wpmix.net/wp-content/uploads/2016/10/favicon.png',
    iconBgColor: '#ccc',
  },
]

window.buildOptions = {
  ownTokens: false, // Will be inited from window.widgetEvmLikeTokens
  addCustomTokens: true, // Allow user add custom evm like tokens
  curEnabled: { // Or 'false' if enabled all
    btc: true,
    eth: true,
  },
  blockchainSwapEnabled: { // Or 'false' if enabled all
    btc: true,
    eth: true,
  },
  defaultExchangePair: {
    buy: 'eth',
    sell: 'btc',
  }
  invoiceEnabled: false, // Allow create invoices
}
*/

window.buildOptions = {
  showWalletBanners: true, // Allow to see banners
}