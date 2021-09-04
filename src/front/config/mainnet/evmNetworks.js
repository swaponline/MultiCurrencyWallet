import web3 from './web3'
import link from './link'

export default {
  ETH: {
    currency: 'ETH',
    chainId: 0x1,
    networkVersion: 1,
    chainName: 'Ethereum Mainnet',
    rpcUrls: [web3.provider],
    blockExplorerUrls: [link.etherscan]
  },
  BNB: {
    currency: 'BNB',
    chainId: 0x38,
    networkVersion: 56,
    chainName: 'Binance Smart Chain Mainnet',
    rpcUrls: [web3.binance_provider],
    blockExplorerUrls: [link.bscscan]
  },
  MATIC: {
    currency: 'MATIC',
    chainId: 0x89,
    networkVersion: 137,
    chainName: 'Matic Mainnet',
    rpcUrls: [
      web3.matic_provider,
      // alternative rpc options. Public rpc are often unavailable
      'https://rpc-mainnet.matic.network',
      'https://matic-mainnet.chainstacklabs.com',
      'https://rpc-mainnet.matic.quiknode.pro',
      'https://matic-mainnet-full-rpc.bwarelabs.com',
      'https://matic-mainnet-archive-rpc.bwarelabs.com'
    ],
    blockExplorerUrls: [link.maticscan],
  },
  ARBETH: {
    currency: 'ETH',
    chainId: 0xA4B1,
    networkVersion: 42161,
    chainName: 'Arbitrum Mainnet',
    rpcUrls: [web3.arbitrum_provider],
    blockExplorerUrls: [link.arbitrum]
  },
}
