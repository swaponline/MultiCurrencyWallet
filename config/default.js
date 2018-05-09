import path from 'path'

const rootPath = path.resolve(process.cwd(), '../')
const basePath = path.resolve(__dirname, '../')

const config = {
  propEnv: process.env.NODE_ENV,
  env: process.env.NODE_ENV,

  paths: {
    root: (file = '') => path.join(rootPath, file),
    base: (file = '') => path.join(basePath, file),
    client: (file = '') => path.join(basePath, 'client', file),
    shared: (file = '') => path.join(basePath, 'shared', file),
    build: (file = '') => path.join(basePath, 'build', file),
    server: (file = '') => path.join(basePath, 'server', file),
  },

  publicPath: '/',

  http: {
    host: 'localhost',
    port: process.env.PORT || 9100,
  },
}

export default config