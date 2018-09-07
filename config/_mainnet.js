export default {
  services: {
    web3: {
      provider: 'https://mainnet.infura.io/5lcMmHUURYg8F20GLGSr',
      rate: 0.1,
      gas: 1e5,
      gasPrice: '20000000000',
    },

    eos: {
      chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
      httpEndpoint: 'https://api.eosnewyork.io',
    },
  },

  ipfs: {
    swarm: '/dns4/discovery.libp2p.array.io/tcp/9091/wss/p2p-websocket-star/', // '/dns4/discovery.libp2p.array.io/tcp/9091/wss/p2p-websocket-star/'
    server: 'discovery.libp2p.array.io',
  },

  token: {
    contract: '0x85F806b0df30709886C22ed1be338d2c647Abd6B',
  },

  eth: {
    contract : '0x843FcaAeb0Cce5FFaf272F5F2ddFFf3603F9c2A0',
  },

  eos: {
    contract: 'swaponline42',
  },

  tokens: {
    swap: {
      address: '0x14a52cf6B4F68431bd5D9524E4fcD6F41ce4ADe9',
      decimals: 18,
    },
    lev: {
      address: '0x0f4ca92660efad97a9a70cb0fe969c755439772c',
      decimals: 9,
    },
    drt: {
      address: '0x9af4f26941677c706cfecf6d3379ff01bb85d5ab',
      decimals: 8,
    },
    syc: {
      address: '0x49feeF410293261c04F1d14600Ba427F8eED8723',
      decimals: 2,
    },
    yup: {
      address: '0xD9A12Cde03a86E800496469858De8581D3A5353d',
      decimals: 18,
    },
    jot: {
      address: '0xdb455c71c1bc2de4e80ca451184041ef32054001',
      decimals: 18,
    },
    noxon: {
      address: '0x9E4AD79049282F942c1b4c9b418F0357A0637017',
      decimals: 0,
    },
  },

  link: {
    bitpay: 'https://insight.bitpay.com',
    etherscan: 'https://etherscan.io',
    eos: '',
    omniexplorer: 'https://www.omniexplorer.info',
    bch: 'https://bch.btc.com',
  },

  api: {
    blocktrail: 'https://api.blocktrail.com/v1/BTC',
    bitpay: 'https://insight.bitpay.com/api',
    etherscan: 'https://api.etherscan.io/api',
    bch: 'https://bch-insight.bitpay.com/api',
  },

  apiAlternatives: {
    bitpay: [
      'https://insight.bitpay.com/api',
    ],
  },

  apiKeys: {
    etherscan: 'RHHFPNMAZMD6I4ZWBZBF6FA11CMW9AXZNM',
    blocktrail: '1835368c0fa8e71907ca26f3c978ab742a7db42e',
  },
}
