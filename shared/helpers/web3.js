import Web3 from 'web3'
import config from 'app-config'


const web3 = new Web3(new Web3.providers.HttpProvider(config.services.web3.provider))


export default web3
