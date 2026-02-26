package com.mcw.core.crypto

/**
 * Result of ETH key derivation at a specific BIP44 path.
 * The same private key is used across all EVM chains.
 */
data class EthKeyResult(
  val privateKeyHex: String,  // 0x-prefixed
  val address: String         // 0x-prefixed checksummed (EIP-55)
)
