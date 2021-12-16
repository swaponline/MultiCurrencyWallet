window.widgetERC20Comisions = {
  eth: {
    fee: '7',
    address: '0x695aB700B6d98D12d84E691537570318E7646526',
    min: '0,01',
  },
  bnb: {
    fee: '7',
    address: '0x695aB700B6d98D12d84E691537570318E7646526',
    min: '0,01',
  },
  matic: {
    fee: '7',
    address: '0x695aB700B6d98D12d84E691537570318E7646526',
    min: '0,01',
  },
  arbeth: {
    fee: '3',
    address: '0x695aB700B6d98D12d84E691537570318E7646526',
    min: '0,001',
  },
  xdai: {
    fee: '3',
    address: '0x695aB700B6d98D12d84E691537570318E7646526',
    min: '0,001',
  },
  erc20: {
    address: '0x01F69aEfdb0AdE89BC8f8dD9712c4CC4899621E2',
  },
  bep20: {
    address: '0x01F69aEfdb0AdE89BC8f8dD9712c4CC4899621E2',
  },
  erc20matic: {
    address: '0x01F69aEfdb0AdE89BC8f8dD9712c4CC4899621E2',
  },
  erc20xdai: {
    address: '0x01F69aEfdb0AdE89BC8f8dD9712c4CC4899621E2',
  },
}

window.widgetEvmLikeTokens = [
  {
    name: 'usdt',
    symbol: 'usdt',
    standard: 'erc20',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    decimals: 6,
    fullName: 'Tether',
  },
  {
    name: 'share',
    symbol: 'share',
    standard: 'erc20',
    // Address of ERC20 contract
    address: '0xc787a019ea4e0700e997c8e7d26ba2efa2e6862a',
    // Count of decimals after dot
    decimals: 0,
    // Display name in wallet (By default - its symbol of ERC20, but can be other userfriendy text)
    fullName: 'Mining.Taxi',
    // Icon of currency (image)
    icon: 'https://wallet.miningtaxi.com/images/1_4.svg',
    // Background color of icon
    iconBgColor: '#7158e8',
  },
  {
    name: 'uni',
    symbol: 'uni',
    standard: 'erc20',
    // Address of ERC20 contract
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    // Count of decimals after dot
    decimals: 18,
    // Display name in wallet (By default - its symbol of ERC20, but can be other userfriendy text)
    fullName: 'Uniswap',
    // Icon of currency (image)
    icon: 'https://wallet.miningtaxi.com/images/uniswap.svg',
    // Background color of icon
    iconBgColor: '#ff007a',
    howToDeposit: 'Just do it!',
    howToWithdraw: 'Do not do it!',
    customExchangeRate: '123454321',
  },
  {
    name: 'weth',
    symbol: 'weth',
    standard: 'erc20matic',
    address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    decimals: 18,
    fullName: 'Wrapped Ether',
    customExchangeRate: '2',
  },
]

//window.SO_defaultQuickSell = `BNB`
//window.SO_defaultQuickBuy = `{BNB}SUBX`
//window.SO_fiatBuySupperted = [`bnb`]
window.buildOptions = {
  ownTokens: false, // Will be inited from window.widgetEvmLikeTokens
  addCustomTokens: true, // Allow user add custom evm like tokens
  // Or 'false' if enabled all
  curEnabled: {
    btc: true,
    eth: true,
    bnb: true,
    matic: true,
    arbeth: true,
    xdai: true,
    ghost: true,
    next: true,
  },
  blockchainSwapEnabled: {
    btc: true,
    eth: false,
    bnb: false,
    matic: false,
    arbeth: false,
    xdai: false,
    ghost: false,
    next: false,
  },
  defaultExchangePair: {
    buy: '{eth}wbtc',
    sell: 'btc',
  },
  /*
    Порядок валют на странице создания кошелька
    CUSTOM_ERC20, CUSTOM_BEP20, CUSTOM_ERC20MATIC - Добавление пользовательского токена (при условии addCustomERC20 = true)
    {ERC20}UNI - Токен в сети Эфира
    {BEP20}TOKENSYMBOL - Токен в сети бинанс
    {ERC20MATIC}TOKENSYMBOL - Токен в сети матик
    Все остальные коины, которые не указаны, будут помещены в конец списка в произвольном порядке
  */
  createWalletCoinsOrder: [
    '{ETH}UNI',
    'CUSTOM_ERC20',
    '{ETH}SHARE',
    'BTC',
    'CUSTOM_ERC20MATIC',
    'MATIC',
    'BNB',
    'CUSTOM_BEP20',
    'XDAI',
    'CUSTOM_ERC20XDAI',
  ],
  invoiceEnabled: true, // Allow create invoices
  showWalletBanners: true,
}
