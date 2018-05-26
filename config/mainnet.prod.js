import baseConfig from './default'


export default {
  env: 'production',
  entry: 'mainnet',

  publicPath: `https://alpha.swaponline.com${baseConfig.publicPath}`,

  services: {
    base: 'https://alpha.swaponline.com/',
    api: '',
  },
}
