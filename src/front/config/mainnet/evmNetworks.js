import web3 from './web3'
import link from './link'

export default {
  ETH: {
    currency: 'ETH',
    chainId: '0x1',
    networkVersion: 1,
    chainName: 'Ethereum',
    rpcUrls: [web3.provider],
    blockExplorerUrls: [link.etherscan],
  },
  BNB: {
    currency: 'BNB',
    chainId: '0x38',
    networkVersion: 56,
    chainName: 'Binance Smart Chain',
    rpcUrls: [web3.binance_provider],
    blockExplorerUrls: [link.bscscan],
  },
  MATIC: {
    currency: 'MATIC',
    chainId: '0x89',
    networkVersion: 137,
    chainName: 'Polygon',
    rpcUrls: [web3.matic_provider],
    blockExplorerUrls: [link.maticscan],
  },
  ARBETH: {
    currency: 'ARBETH',
    chainId: '0xA4B1',
    networkVersion: 42161,
    chainName: 'Arbitrum',
    rpcUrls: [web3.arbitrum_provider],
    blockExplorerUrls: [link.arbitrum],
  },
  XDAI: {
    currency: 'XDAI',
    chainId: '0x64',
    networkVersion: 100,
    chainName: 'Gnosis (xDai)',
    rpcUrls: [web3.xdai_provider],
    blockExplorerUrls: [link.xdai],
  },
  FTM: {
    currency: 'FTM',
    chainId: '0xfa',
    networkVersion: 250,
    chainName: 'Fantom',
    rpcUrls: [web3.ftm_provider],
    blockExplorerUrls: [link.ftm],
  },
}
