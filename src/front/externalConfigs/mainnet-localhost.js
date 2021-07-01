// mainnet-localhost

window.widgetEvmLikeTokens = [
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
  {
    standard: 'erc20',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    decimals: 6,
    name: 'USDT',
    fullName: 'Usdt',
    canSwap: true,
  },
  {
    standard: 'erc20',
    address: '0x1fe72034da777ef22533eaa6dd7cbe1d80be50fa',
    decimals: 18,
    name: 'PAY',
    fullName: 'PayAccept',
    canSwap: true,
  },
  {
    standard: 'erc20',
    address: '0xc060b26e60698e91a6acc84051a26b32e38dd1a4',
    decimals: 18,
    name: 'PROXIMA',
    fullName: 'Proxima',
    icon: 'https://growup.wpmix.net/wp-content/uploads/2016/10/favicon.png',
    iconBgColor: '#ccc',
    canSwap: true,
  },
]

window.buildOptions = {
  ownTokens: false, // Will be inited from window.widgetEvmLikeTokens
  addCustomTokens: true, // Allow user add custom evm like tokens
  curEnabled: { // Or 'false' if enabled all
    btc: true,
    eth: true,
    bnb: true,
    matic: true,
    arbeth: true,
    ghost: true,
    next: true,
  },
  blockchainSwapEnabled: {
    btc: true,
    eth: false,
    bnb: false,
    matic: false,
    arbeth: false,
    ghost: false,
    next: false,
  },
  defaultExchangePair: {
    buy: '{eth}wbtc',
    sell: 'btc',
  },
  invoiceEnabled: false, // Allow create invoices
}
