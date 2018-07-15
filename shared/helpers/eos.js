import { getState } from 'redux/core'

let eos = null
let ecc = null

const keyProvider = ({ transaction, pubkeys }) => {
  const { user: { eosData: { privateKeys, publicKeys } } } = getState()

  if (!pubkeys) {
    return [publicKeys.active]
  }

  return [privateKeys.active]
}

const setupEOS = async () => {
  if (eos === null) {
    const EOS = await import('eosjs')

    const { chainId, httpEndpoint } = config.services.eos

    eos = EOS({
      chainId, httpEndpoint, keyProvider
    })

    ecc = EOS.modules.ecc
  }
}

export default {
  setupEOS,
  eos, ecc
}