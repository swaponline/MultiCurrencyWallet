package com.mcw.core.crypto

/**
 * Holds all derived wallet keys from a BIP39 mnemonic.
 *
 * The single ETH private key is reused across all EVM chains (ETH, BSC, Polygon).
 * Only the RPC endpoint and chain ID differ between chains.
 */
data class WalletKeys(
  val mnemonic: List<String>,
  val btcPrivateKeyWIF: String,
  val btcAddress: String,
  val ethPrivateKeyHex: String,  // 0x-prefixed
  val ethAddress: String         // 0x-prefixed checksummed (EIP-55)
)
