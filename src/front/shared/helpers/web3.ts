import Web3 from 'web3'
import config from 'app-config'

let web3: EthereumProvider = new Web3(
  new Web3.providers.HttpProvider(config.web3.provider)
)

const setMetamask = async (provider) => {
  web3 = provider
  web3.isMetamask = true
}

const setProvider = (provider) => {
  web3 = provider
}

const setDefaultProvider = () => {
  web3 = new Web3(
    new Web3.providers.HttpProvider(config.web3.provider)
  )

  web3.isMetamask = false
}

const getWeb3 = () => {
  return web3
}

const getCurrentWeb3 = () => {
  return web3
}

window.getCurrentWeb3 = getCurrentWeb3

export {
  setMetamask,
  web3,
  getWeb3,
  setDefaultProvider,
  setProvider,
  getCurrentWeb3
}

export default web3
