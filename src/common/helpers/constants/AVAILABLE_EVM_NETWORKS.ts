export const AVAILABLE_NETWORKS = [
//  [
    1,      // ETH Mainnet
    56,     // BSC Mainnet
    137,    // MATIC Mainnet
 // ],
 // [
    3,      // ETH Testnet (Ropsten)
    97,     // BSC Testnet
    80001,  // MATIC Testnet
//  ]
]

export const AVAILABLE_NETWORKS_BY_COIN = {
  ETH: [1, 3], // [MAINNET, TESTNET]
  BNB: [56, 97],
  MATIC: [137, 80001]
}

export default {
  AVAILABLE_NETWORKS,
  AVAILABLE_NETWORKS_BY_COIN,
}