
const metamaskProvider = (window.ethereum) || false

const isEnabled = () => !(!metamaskProvider)

const isConnected = () => metamaskProvider && metamaskProvider.selectedAddress

const getAddress = () => (isConnected()) ? metamaskProvider.selectedAddress : ''

const connect = () => new Promise(async (resolved, reject) => {
  if (metamaskProvider
      && metamaskProvider.enable
  ) {
    await metamaskProvider.enable()
    setTimeout(() => {
      if (getAddress()) {
        resolved(true)
      } else {
        reject(`timeout`)
      }
    }, 1000)
  } else {
    reject(`metamask not enabled`)
  }
})

export default {
  connect,
  isEnabled,
  isConnected,
  getAddress,
}
