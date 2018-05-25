import baseConfig from './default'


export default {
  env: 'production',

  publicPath: 'http://localhost:63342/swap.react/build-testnet/',
  // publicPath: `https://wallet.swap.online${baseConfig.publicPath}`,

  services: {
    base: 'https://wallet.swap.online/',
    api: '',
  },
}
