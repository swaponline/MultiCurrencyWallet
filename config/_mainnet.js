export default {
  services: {
    web3: {
      provider: 'https://mainnet.infura.io/5lcMmHUURYg8F20GLGSr',
      noxonToken: '0x9E4AD79049282F942c1b4c9b418F0357A0637017',
      swapToken: '0x14a52cf6B4F68431bd5D9524E4fcD6F41ce4ADe9',
      rate: 0.1,
      gas: 1e5,
      gasPrice: '20000000000',
    },

    eos: {
      chainId: '',
      httpEndpoint: '',
      keyProvider: '',
      serviceAccount: '',
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
