export const AWAILABLE_NETWORKS = [
    1,          // ETH Mainnet
    3,          // ETH Testnet (Ropsten)
    56,         // BSC Mainnet
    97,         // BSC Testnet
    137,        // MATIC Mainnet
    80001,      // MATIC Testnet
]

export const AWAILABLE_NETWORKS_BY_COIN = {
    ETH: [1, 3], // [MAINNET, TESTNET]
    BNB: [56, 97],
    MATIC: [137, 80001]
}

export default {
    AWAILABLE_NETWORKS,
    AWAILABLE_NETWORKS_BY_COIN,
}