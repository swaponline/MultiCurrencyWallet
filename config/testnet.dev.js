import baseConfig from './default'


export default {
  env: 'development',
  entry: 'testnet',

  publicPath: `http://localhost:${baseConfig.http.port}/`,

  services: {
    base: 'https://wallet.swap.online/',
    rest: 'https://wallet.swap.online/rest/',
    web3Provider: 'https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl',
  },

  api: {
    blocktrail: 'https://api.blocktrail.com/v1/tBTC',
    bitpay: 'https://test-insight.bitpay.com/api',
    ethpay: 'https://rinkeby.etherscan.io/api',
  },
}
