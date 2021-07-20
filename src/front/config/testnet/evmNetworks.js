import web3 from './web3'
import link from './link'

export default {
  ETH: {
    chainId: 0x4,
    networkVersion: 4,
    chainName: 'Rinkeby Test Network',
    rpcUrls: [web3.provider],
    blockExplorerUrls: [link.etherscan]
  },
  BNB: {
    chainId: 0x61,
    networkVersion: 97,
    chainName: 'Binance Smart Chain Testnet',
    rpcUrls: [web3.binance_provider],
    blockExplorerUrls: [link.bscscan]
  },
  MATIC: {
    chainId: 0x13881,
    networkVersion: 80001,
    chainName: 'Matic Mumbai Testnet',
    rpcUrls: [web3.matic_provider],
    blockExplorerUrls: [link.maticscan]
  },
  ARBETH: {
    chainId: 0x66EEB,
    networkVersion: 421611,
    chainName: 'Arbitrum Testnet',
    rpcUrls: [web3.arbitrum_provider],
    blockExplorerUrls: [link.arbitrum]
  },
}