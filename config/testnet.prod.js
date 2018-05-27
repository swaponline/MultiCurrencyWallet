import baseConfig from './default'


export default {
  env: 'production',
  entry: 'testnet',

  base: 'https://wallet.swap.online/',
  publicPath: `https://wallet.swap.online${baseConfig.publicPath}`,

  services: {
    web3Provider: 'https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl',
  },

  api: {
    blocktrail: 'https://api.blocktrail.com/v1/tBTC',
    bitpay: 'https://test-insight.bitpay.com/api',
    ethpay: 'https://rinkeby.etherscan.io/api',
  },
}
