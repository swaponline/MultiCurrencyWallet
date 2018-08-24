export default {
  services: {
    web3: {
      provider: 'https://mainnet.infura.io/5lcMmHUURYg8F20GLGSr',
      rate: 0.1,
      gas: 1e5,
      gasPrice: '20000000000',
    },

    eos: {
      chainId: '',
      httpEndpoint: '',
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

  tokens: {
    swap: {
      address: '0x14a52cf6B4F68431bd5D9524E4fcD6F41ce4ADe9',
      decimals: 18,
    },
    noxon: {
      address: '0x9E4AD79049282F942c1b4c9b418F0357A0637017',
      decimals: 0,
    },
    jot: {
      address: '0xdb455c71c1bc2de4e80ca451184041ef32054001',
      decimals: 18,
    },
    btrm: {
      address: '0xae72146eb535607Ee79f5D8834303ea18751845f',
      decimals: 18,
    },
    omgtoken: {
      address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
      decimals: 18,
    },
  },

  link: {
    bitpay: 'https://insight.bitpay.com',
    etherscan: 'https://etherscan.io',
    eos: '',
    omniexplorer: 'https://www.omniexplorer.info',
  },

  api: {
    blocktrail: 'https://api.blocktrail.com/v1/BTC',
    bitpay: 'https://insight.bitpay.com/api',
    etherscan: 'https://api.etherscan.io/api',
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
