import path from 'path'


const rootPath = path.resolve(process.cwd(), '../')
const basePath = path.resolve(__dirname, '../')

const config = {
  propENV: process.env.NODE_ENV,
  env: process.env.NODE_ENV,

  paths: {
    root:     (file = '') => path.join(rootPath, file),
    base:     (file = '') => path.join(basePath, file),
    shared:   (file = '') => path.join(basePath, 'shared', file),
    client:   (file = '') => path.join(basePath, 'client', file),
  },

  publicPath: '/assets/',

  http: {
    host: 'localhost',
    port: process.env.PORT || 9001,
  },
}

export default config
