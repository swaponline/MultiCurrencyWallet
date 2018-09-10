import { getState } from 'redux/core'
import config from 'app-config'


let eosInstance = null
let eccInstance = null
let semaphore = false

const keyProvider = ({ transaction, pubkeys }) => {
  const { user: { eosData: { privateKeys, publicKeys } } } = getState()

  if (!pubkeys) {
    return [publicKeys.active]
  }

  return [privateKeys.active]
}

const setupEOS = async () => {
  console.log('eos start import')
  const EOS = await import('eosjs')
  console.log('eos finish import')

  const { httpEndpoint, chainId } = config.api.eos

  eosInstance = EOS({
    chainId,
    httpEndpoint,
    keyProvider,
  })

  eccInstance = EOS.modules.ecc
}

const timeout = async (ms) => new Promise(resolve => setTimeout(resolve, ms))

const eos = {
  async getInstance() {
    if (eosInstance === null && semaphore === false) {
      semaphore = true
      await setupEOS()
    } else if (eosInstance === null && semaphore === true) {
      await timeout(5000)
    }

    console.log('eos instance', eosInstance)

    return eosInstance
  },
}

const ecc = {
  async getInstance() {
    if (eosInstance === null && semaphore === false) {
      semaphore = true
      await setupEOS()
    } else if (eosInstance === null && semaphore === true) {
      await timeout(5000)
    }

    return eccInstance
  },
}

export {
  eos, ecc,
}
