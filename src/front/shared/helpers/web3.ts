import Web3 from 'web3'
import config from 'app-config'
import metamask from 'helpers/metamask'
import promiEvent from 'web3-core-promievent'
//@ts-ignore
import { utils as web3utils } from 'web3'

console.log('reset web3')
let web3 = new Web3(new Web3.providers.HttpProvider(config.web3.provider))

const setMetamask = async (provider) => {
  web3 = await provider
  //@ts-ignore
  web3.isMetamask = true
}

const setDefaultProvider = () => {
  web3 = new Web3(new Web3.providers.HttpProvider(config.web3.provider))
  //@ts-ignore
  web3.isMetamask = false
}

const getWeb3 = () => {
  //@ts-ignore
  console.log('get web3 - is metamask', web3.isMetamask)
  return web3
}

export {
  setMetamask,
  web3,
  getWeb3,
  setDefaultProvider,
}

export default web3
