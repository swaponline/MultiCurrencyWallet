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
    min: '0,01',
  },
  bnb: {
    fee: '7',
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
    min: '0,01',
  },
  erc20: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
  bep20: {
    address: '0x276747801B0dbb7ba04685BA27102F1B27Ca0815',
  },
}

// TODO: replace this window key with an array
// { name: {...}, ... } => [{...}, {...}]
/* window.widgetERC20Tokens = {
  usdt: {
    standard: 'erc20',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    decimals: 6,
    fullName: 'Usdt',
    icon: 'https://growup.wpmix.net/wp-content/uploads/2016/10/favicon.png',
    // customExchangeRate: '',
    // iconBgColor: '',
    // howToDeposit: '',
    // howToWithdraw: '',
  },
  // Symbol of ERC20 token in lowerCase
  proxima: {
    standard: 'erc20',
    // Address of ERC20 contract
    address: '0xc060b26e60698e91a6acc84051a26b32e38dd1a4',
    // Count of decimals after dot
    decimals: 18,
    // Display name in wallet (By default - its symbol of ERC20, but can be other userfriendy text)
    fullName: 'Proxima',
    // Icon of currency (image)
    icon: 'https://growup.wpmix.net/wp-content/uploads/2016/10/favicon.png',
    // Background color of icon
    iconBgColor: '#ccc',
  },
} */

window.buildOptions = {
  // ownTokens: true, // Will be inited from window.widgetERC20Tokens
  // addCustomERC20: true, // Allow user add custom erc20 tokens
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
    ghost: true,
    next: true,
  },
  blockchainSwapEnabled: {
    btc: true,
    eth: true,
    bnb: false,
    ghost: false,
    next: false,
  },
  defaultExchangePair: {
    buy: 'usdt',
    sell: 'btc',
  }
}
