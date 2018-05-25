import config from 'app-config'
import commonCfg from './common'
import development from './development'
import testnet from './testnet'
import mainnet from './mainnet'


const envCfg = ({
  'development': development,
  'testnet': testnet,
  'mainnet': mainnet,
})[config.webpack]


export default envCfg(commonCfg)
