import config from 'app-config'
import commonCfg from './common'
import development from './development'
import production from './production'

const envCfg = ({
  'development': development,
  'production': production,
})[config.env]

export default envCfg(commonCfg)
