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
    swarm: '/dns4/discovery.libp2p.array.io/tcp/9091/wss/p2p-websocket-star/',
    server: 'discovery.libp2p.array.io',
  },

  token: {
    contract: '0x8D880dff55a0c5620Cc617B0a34c83B87946783c', // пока под вопросом
  },

  eth: {
    contract : '0x025dce2d39a46296766db7cac8c322e8f59cd5d9',
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
  },

  link: {
    bitpay: 'https://insight.bitpay.com',
    etherscan: 'https://etherscan.io',
    eos: '',
  },

  api: {
    blocktrail: 'https://api.blocktrail.com/v1/BTC',
    bitpay: 'https://insight.bitpay.com/api',
    etherscan: 'https://api.etherscan.io/api',
  },

  apiKeys: {
    etherscan: 'RHHFPNMAZMD6I4ZWBZBF6FA11CMW9AXZNM',
    blocktrail: '1835368c0fa8e71907ca26f3c978ab742a7db42e',
  },
}
