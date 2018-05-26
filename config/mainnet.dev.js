import baseConfig from './default'


export default {
  env: 'development',
  entry: 'mainnet',

  publicPath: `http://localhost:${baseConfig.http.port}/`,

  services: {
    base: 'https://alpha.swaponline.com/',
    api: '',
  },
}
