export const AVAILABLE_NETWORKS = [
 [
    1,      // ETH Mainnet
    56,     // BSC Mainnet
    137,    // MATIC Mainnet
 ],
 [
    3,      // ETH Testnet (Ropsten)
    97,     // BSC Testnet
    80001,  // MATIC Testnet
 ]
]

export const AVAILABLE_NETWORKS_BY_COIN = {
  ETH: [1, 3], // [MAINNET, TESTNET]
  BNB: [56, 97],
  MATIC: [137, 80001]
}

export const EVM_NETWORKS = {
  ETH: [
    {
      chainId: "0x1",
      networkVersion: 1,
      chainName: 'Ethereum Mainnet',
      rpcUrls: ['https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c'],
      blockExplorerUrls: ['https://etherscan.io']
    },
    {
      chainId: "0x3",
      networkVersion: 3,
      chainName: 'Ropsten Test Network',
      rpcUrls: ['https://ropsten.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c'],
      blockExplorerUrls: ['https://ropsten.etherscan.io']
    }
  ],
  BNB: [
    {
      chainId: "0x38",
      networkVersion: 56,
      chainName: 'Binance Smart Chain Mainnet',
      rpcUrls: ['https://bsc-dataseed.binance.org/'],
      blockExplorerUrls: ['https://bscscan.com']
    },
    {
      chainId: "0x61",
      networkVersion: 97,
      chainName: 'Binance Smart Chain Testnet',
      rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
      blockExplorerUrls: ['https://testnet.bscscan.com']
    }
  ],
  MATIC: [
    {
      chainId: "0x89",
      networkVersion: 137,
      chainName: 'Matic Mainnet',
      rpcUrls: ['https://rpc-mainnet.maticvigil.com'],
      blockExplorerUrls: ['https://polygonscan.com']
    },
    {
      chainId: "0x13881",
      networkVersion: 80001,
      chainName: 'Matic Mumbai Testnet',
      rpcUrls: ['https://rpc-mumbai.matic.today'],
      blockExplorerUrls: ['https://explorer-mumbai.maticvigil.com']
    }
  ]
}

export default {
  AVAILABLE_NETWORKS,
  AVAILABLE_NETWORKS_BY_COIN,
  EVM_NETWORKS
}