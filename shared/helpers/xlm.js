import sdk from 'stellar-sdk'

const initServer = (network) => {
  let horizonUrl

  if (network === 'public') {
    horizonUrl = 'https://horizon.stellar.org'
    sdk.Network.usePublicNetwork()
  } else {
    horizonUrl = 'https://horizon-testnet.stellar.org'
    sdk.Network.useTestNetwork()
  }
  return new sdk.Server(horizonUrl)
}

export default {
  initServer,
}
