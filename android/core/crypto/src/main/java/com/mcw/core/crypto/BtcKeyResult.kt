package com.mcw.core.crypto

/**
 * Result of BTC key derivation at a specific BIP44 path.
 */
data class BtcKeyResult(
  val privateKeyWIF: String,
  val address: String
)
