import baseConfig from './default'


export default {
  env: 'production',

  publicPath: `https://alpha.swaponline.com${baseConfig.publicPath}`,

  services: {
    base: 'https://alpha.swaponline.com/',
    api: '',
  },
}
