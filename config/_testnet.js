export default {
  services: {
    web3: {
      provider: 'https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl',
      rate: 0.1,
      gas: 1e5,
      gasPrice: '20000000000',
    },

    tokens: {
      swap: '0x5f53dc58cad6101d943b26ffb9427723aeb816f9',
      noxon: '0x60c205722c6c797c725a996cf9cca11291f90749',
    },

    eos: {
      chainId: '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca',
      httpEndpoint: 'https://jungle.eosio.cr',
      keyProvider: '5JYP2L1NMcZ6ZhQD4WZAtsV8t6UdkzGFob3ca676m7zD7gm2Lmj',
      serviceAccount: 'swaponline',
    },
  },

  link: {
    bitpay: 'https://test-insight.bitpay.com',
    etherscan: 'https://rinkeby.etherscan.io',
    eos: 'http://jungle.cryptolions.io/#accountInfo',
  },

  api: {
    blocktrail: 'https://api.blocktrail.com/v1/tBTC',
    bitpay: 'https://test-insight.bitpay.com/api',
    etherscan: 'https://rinkeby.etherscan.io/api',
  },

  apiKeys: {
    etherscan: 'RHHFPNMAZMD6I4ZWBZBF6FA11CMW9AXZNM',
    blocktrail: '1835368c0fa8e71907ca26f3c978ab742a7db42e',
  },
}
