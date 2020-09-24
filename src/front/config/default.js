import path from 'path'


const rootPath = path.resolve(process.cwd())
const basePath = path.resolve(__dirname, '../../../')

const config = {
  propENV: process.env.CONFIG, // from package.json

  paths: {
    root: (file = '') => path.join(rootPath, file),
    base: (file = '') => path.join(basePath, file),
    core: (file = '') => process.env.SWAP_CORE_PATH ? path.join(process.env.SWAP_CORE_PATH, file) : path.join(basePath, 'src', 'core', file),
    front: (file = '') => path.join(basePath, 'src', 'front', file),
    shared: (file = '') => path.join(basePath, 'src', 'front', 'shared', file),
    client: (file = '') => path.join(basePath, 'src', 'front', 'client', file),
  },

  publicPath: '/',

  http: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 9001,
  },

  i18nDate: {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  },
}


export default config
