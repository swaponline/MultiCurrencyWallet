import path from 'path'


const rootPath = path.resolve(process.cwd(), '../')
const basePath = path.resolve(__dirname, '../')

const config = {
  propENV: process.env.CONFIG, // from package.json

  paths: {
    root:     (file = '') => path.join(rootPath, file),
    base:     (file = '') => path.join(basePath, file),
    shared:   (file = '') => path.join(basePath, 'shared', file),
    client:   (file = '') => path.join(basePath, 'client', file),
    // swapCore: (file = '') => path.join(basePath, 'node_modules', file),
    swapCore: (file = '') => path.join(rootPath, 'swap.core', file),
  },
  referral: {
    url:'https://wiki.swap.online/affiliate.php',
  },

  publicPath: '/',

  http: {
    host: 'localhost',
    port: process.env.PORT || 9001,
  },

  i18nDate: {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  },

  exchangeRates: {
    'swapeth': 1,
    'ethswap': 1,
    'swapnoxon': 1,
    'noxonswap': 1,
    'swapbtc': 0.07,
    'btcswap': 0.07,
    'etheth': 1,
    'ethbtc': 0.07,
    'btceth': 14,
    'ethnoxon': 1,
    'noxoneth': 1,
    'btcnoxon': 0.07,
    'noxonbtc': 0.07,
    'sycbtc': 0.001,
    'btcsyc': 1000,
  },

  currency: {
    eos: {
      description: 'EOS is domestic blockchain and basic cryptocurrency for the EOS.IO decentralised operating system, ' +
        'which serves as a hosting for dApps. This service covers the RAM trading, data storage and exchange ' +
        'options. EOS.IO is developed by the former leaders of SteemIt and BitShares and has a great scalability' +
        ' and commercial implementation prospects. EOS is well-known due to the largest ICO ever ' +
        '(349 days, $4B raised). Traditionally, EOS is purchased via centralized exchanges or EOS-only wallets.\n' +
        'Here you can exchange EOS for BTC, ETH, ERC-20 tokens with zero fee in decentralized and prompt manner. \n',
      title: 'Ethereum Operating System',
    },
    jot: {
      description: '',
      title: 'ERC 20 token',
    },
    noxon: {
      description: '',
      title: 'ERC 20 token',
    },
    swap: {
      description: '',
      title: 'ERC 20 token',
    },
    btc: {
      description: '',
      title: 'Bitcoin',
    },
    eth: {
      description: '',
      title: 'Ethereum',
    },
    syc: {
      description: '',
      title: 'ERC 20 token',
    },
    drt: {
      description: '',
      title: 'ERC 20 token',
    },
    yup: {
      description: '',
      title: 'ERC 20 token',
    },
  },
}


export default config
