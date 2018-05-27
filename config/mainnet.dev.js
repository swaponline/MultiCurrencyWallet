import baseConfig from './default'


export default {
  env: 'development',
  entry: 'mainnet',

  base: `http://localhost:${baseConfig.http.port}/`,
  publicPath: `http://localhost:${baseConfig.http.port}${baseConfig.publicPath}`,

  services: {
    web3: {
      provider: 'https://mainnet.infura.io/5lcMmHUURYg8F20GLGSr',
      noxonToken: '0x60c205722c6c797c725a996cf9cca11291f90749',
      rate: 0.1,
      gas: 1e5,
      gasPrice: '20000000000',
    },
  },

  api: {
    blocktrail: 'https://api.blocktrail.com/v1/BTC',
    bitpay: 'https://insight.bitpay.com/api',
    etherscan: 'https://api.etherscan.io/api',
  },

  apiKeys: {
    etherscan: 'RHHFPNMAZMD6I4ZWBZBF6FA11CMW9AXZNM',
    // ???? blocktrail: '1835368c0fa8e71907ca26f3c978ab742a7db42e',
  },
}
