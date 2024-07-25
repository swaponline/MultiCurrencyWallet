import path from 'path'
import gravatarUsers from './gravatarUsers'


const rootPath = path.resolve(process.cwd())
const basePath = path.resolve(__dirname, '../../../')



const config = {
  propENV: process.env.CONFIG, // from package.json

  paths: {
    root: (file = '') => path.join(rootPath, file),
    base: (file = '') => path.join(basePath, file),
    core: (file = '') => process.env.SWAP_CORE_PATH ? path.join(process.env.SWAP_CORE_PATH, file) : path.join(basePath, 'src', 'core', file),
    common: (file = '') => path.join(basePath, 'src', 'common', file),
    front: (file = '') => path.join(basePath, 'src', 'front', file),
    shared: (file = '') => path.join(basePath, 'src', 'front', 'shared', file),
    client: (file = '') => path.join(basePath, 'src', 'front', 'client', file),
  },

  publicPath: '/',

  http: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 9001,
  },

  gravatarUsers,

  i18nDate: {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  },
  
  
  // Uni V3 - Global configuration
  // ChainId -> Configuration
  // More chains at https://github.com/Uniswap/sdks/blob/main/sdks/sdk-core/src/addresses.ts
  UNISWAP_V3_CONTRACTS: { 
    1: { // Eth mainnet
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
      router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    },
    11155111: { // Eth Sepolia testnet
      factory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
      quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
      router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    },
    56: { // Binance
      factory: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
      quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
      router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    },
    137: { // Polygon
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
      router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    },
  }
}


export default config
