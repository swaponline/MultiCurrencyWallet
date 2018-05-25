import baseConfig from './default'


export default {
  publicPath: `http://localhost:${baseConfig.http.port}/`,

  services: {
    base: `http://localhost:${baseConfig.http.port}/`,
    api: '',
  },
}
