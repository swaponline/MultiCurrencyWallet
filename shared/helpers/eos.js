import Eos from 'eosjs'
import config from 'app-config'


const eos = Eos({
  chainId: config.services.eos.chainId,
  httpEndpoint: config.services.eos.httpEndpoint,
  keyProvider: config.services.eos.keyProvider,
})

export default eos
