import Web3 from 'web3'
import config from 'app-config'

let provider

if (window.web3) {
  provider = window.web3.currentProvider
} else {
  provider = new Web3.providers.HttpProvider(config.services.web3.provider)
}

const web3 = new Web3(provider)

export default web3
