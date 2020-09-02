import Web3 from 'web3'
import config from 'app-config'
import metamask from 'helpers/metamask'


let web3 = new Web3(new Web3.providers.HttpProvider(config.web3.provider))

const setMetamask = (provider) => {
  web3 = provider
  console.log('use metamask web3')
  window.web3js = web3
}

const setDefaultProvider = () => {
  web3 = new Web3(new Web3.providers.HttpProvider(config.web3.provider))
}

export {
  setMetamask,
  web3,
  setDefaultProvider,
}

export default web3


