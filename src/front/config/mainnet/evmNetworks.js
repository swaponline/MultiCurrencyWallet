import web3 from './web3'
import link from './link'

export default {
  ETH: {
    chainId: "0x1",
    networkVersion: 1,
    chainName: 'Ethereum Mainnet',
    rpcUrls: [web3.provider],
    blockExplorerUrls: [link.etherscan]
  },
  BNB: {
    chainId: "0x38",
    networkVersion: 56,
    chainName: 'Binance Smart Chain Mainnet',
    rpcUrls: [web3.binance_provider],
    blockExplorerUrls: [link.bscscan]
  },
  MATIC: {
    chainId: "0x89",
    networkVersion: 137,
    chainName: 'Matic Mainnet',
    rpcUrls: [web3.matic_provider],
    blockExplorerUrls: [link.maticscan]
  },
  ARBETH: {
    chainId: "0xA4B1",
    networkVersion: 42161,
    chainName: 'Arbitrum Mainnet',
    rpcUrls: [web3.arbitrum_provider],
    blockExplorerUrls: [link.arbitrum]
  },
}