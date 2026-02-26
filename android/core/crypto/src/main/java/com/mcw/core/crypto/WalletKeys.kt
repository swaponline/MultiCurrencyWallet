package com.mcw.core.crypto

/**
 * Holds all derived wallet keys from a BIP39 mnemonic.
 *
 * The single ETH private key is reused across all EVM chains (ETH, BSC, Polygon).
 * Only the RPC endpoint and chain ID differ between chains.
 *
 * toString() is overridden to redact sensitive fields (mnemonic, private keys)
 * and prevent accidental exposure in logs.
 */
data class WalletKeys(
  val mnemonic: List<String>,
  val btcPrivateKeyWIF: String,
  val btcAddress: String,
  val ethPrivateKeyHex: String,  // 0x-prefixed
  val ethAddress: String         // 0x-prefixed checksummed (EIP-55)
) {
  override fun toString(): String {
    return "WalletKeys(btcAddress=$btcAddress, ethAddress=$ethAddress, mnemonic=[REDACTED], btcPrivateKeyWIF=[REDACTED], ethPrivateKeyHex=[REDACTED])"
  }
}
