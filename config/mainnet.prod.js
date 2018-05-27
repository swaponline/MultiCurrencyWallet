import baseConfig from './default'


export default {
  env: 'production',
  entry: 'mainnet',

  base: 'https://alpha.swaponline.com/',
  publicPath: `https://alpha.swaponline.com${baseConfig.publicPath}`,

  services: {

  },
}
