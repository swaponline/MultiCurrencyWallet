import { getState } from 'redux/core'
import config from 'app-config'


let eosInstance = null
let telosInstance = null
let eccInstance = null
let semaphore = false

const keyProvider = (telos = false) => {
  const userDataKey = telos ? 'telosData' : 'eosData'

  return ({ transaction, pubkeys }) => {
    const { user } = getState()
    const { activePrivateKey, activePublicKey } = user[userDataKey]

    if (pubkeys || telos) {
      return [activePrivateKey]
    }
    else {
      return [activePublicKey]
    }
  }
}

const setupEOS = async () => {
  console.log('eos start import')
  const EOS = await import('eosjs')
  console.log('eos finish import')

  const { httpEndpoint: eosHttpEndpoint, chainId: eosChainId } = config.api.eos
  const { httpEndpoint: telosHttpEndpoint, chainId: telosChainId } = config.api.telos
  const eosKeyProvider = keyProvider(false)
  const telosKeyProvider = keyProvider(true)

  eosInstance = EOS({
    chainId: eosChainId,
    httpEndpoint: eosHttpEndpoint,
    keyProvider: eosKeyProvider,
  })

  telosInstance = EOS({
    chainId: telosChainId,
    httpEndpoint: telosHttpEndpoint,
    keyProvider: telosKeyProvider,
    keyPrefix: 'TLOS'
  })

  eccInstance = EOS.modules.ecc
}

const timeout = async (ms) => new Promise(resolve => setTimeout(resolve, ms))
const init = async () => {
  if (eosInstance === null && semaphore === false) {
    semaphore = true
    await setupEOS()
  } else if (eosInstance === null && semaphore === true) {
    await timeout(5000)
  }
}

const eos = {
  async getInstance() {
    await init()
    return eosInstance
  }
}

const ecc = {
  async getInstance() {
    await init()
    return eccInstance
  }
}

const telos = {
  async getInstance() {
    await init()
    return telosInstance
  }
}

export {
  eos, telos, ecc,
}
