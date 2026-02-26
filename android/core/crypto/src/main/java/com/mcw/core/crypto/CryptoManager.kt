package com.mcw.core.crypto

import org.bitcoinj.core.ECKey
import org.bitcoinj.core.LegacyAddress
import org.bitcoinj.core.NetworkParameters
import org.bitcoinj.crypto.ChildNumber
import org.bitcoinj.crypto.HDKeyDerivation
import org.bitcoinj.crypto.MnemonicCode
import org.bitcoinj.params.MainNetParams
import org.web3j.crypto.Bip32ECKeyPair
import org.web3j.crypto.Credentials
import org.web3j.crypto.Keys
import java.security.SecureRandom

/**
 * BIP39 mnemonic generation/validation and BIP44 key derivation for BTC and ETH.
 *
 * Cross-platform compatibility constraint (Decision 11): produces identical
 * BTC P2PKH addresses and ETH checksummed addresses as the web wallet
 * for the same mnemonic.
 *
 * BTC: m/44'/0'/0'/0/{index} (P2PKH, addresses start with '1' on mainnet)
 * ETH: m/44'/60'/0'/0/{index} (single key shared across all EVM chains)
 */
class CryptoManager(
  private val networkParams: NetworkParameters = MainNetParams.get()
) {

  companion object {
    // BIP44 path components
    private const val PURPOSE = 44
    private const val BTC_COIN_TYPE = 0
    private const val ETH_COIN_TYPE = 60
    private const val ACCOUNT = 0
    private const val CHANGE = 0

    // BIP39 expects 128 bits of entropy for 12 words
    private const val ENTROPY_BITS = 128
    private const val EXPECTED_WORD_COUNT = 12
  }

  private val mnemonicCode: MnemonicCode = MnemonicCode.INSTANCE
  private val secureRandom: SecureRandom = SecureRandom()

  /**
   * Generates a new 12-word BIP39 mnemonic using SecureRandom entropy.
   *
   * @return space-separated string of 12 BIP39 English words
   */
  fun generateMnemonic(): String {
    val entropy = ByteArray(ENTROPY_BITS / 8)
    try {
      secureRandom.nextBytes(entropy)
      val words = mnemonicCode.toMnemonic(entropy)
      return words.joinToString(" ")
    } finally {
      // Zero entropy to minimize sensitive data exposure in memory
      entropy.fill(0)
    }
  }

  /**
   * Validates a BIP39 mnemonic string.
   *
   * Normalizes input by trimming whitespace, lowercasing, and collapsing
   * multiple spaces between words.
   *
   * @param mnemonic the mnemonic string to validate
   * @return true if the mnemonic is valid
   * @throws MnemonicException with specific message:
   *   - "Invalid word count: expected 12, got N" for wrong word count
   *   - "Word 'xyz' not in BIP39 wordlist" for unknown words
   *   - "Invalid mnemonic checksum" for checksum failure
   */
  fun validateMnemonic(mnemonic: String): Boolean {
    val words = normalizeMnemonic(mnemonic)
    validateWords(words)
    return true
  }

  /**
   * Derives BTC key at m/44'/0'/0'/0/{addressIndex} using bitcoinj.
   *
   * Produces a P2PKH address (starting with '1' on mainnet) and WIF private key,
   * matching the web wallet's bitcoinjs-lib derivation.
   *
   * @param mnemonic BIP39 mnemonic string
   * @param addressIndex BIP44 address index (default 0)
   * @return BtcKeyResult with WIF private key and P2PKH address
   * @throws MnemonicException if mnemonic is invalid
   */
  fun deriveBtcKey(mnemonic: String, addressIndex: Int = 0): BtcKeyResult {
    val words = normalizeMnemonic(mnemonic)
    validateWords(words)

    val seed = MnemonicCode.toSeed(words, "")
    try {
      return deriveBtcKeyFromSeed(seed, addressIndex)
    } finally {
      seed.fill(0)
    }
  }

  /**
   * Derives ETH key at m/44'/60'/0'/0/{addressIndex} using web3j.
   *
   * Produces a checksummed (EIP-55) address and 0x-prefixed private key,
   * matching the web wallet's ethereumjs-wallet derivation.
   *
   * The same private key is used across all EVM chains (ETH, BSC, Polygon).
   *
   * @param mnemonic BIP39 mnemonic string
   * @param addressIndex BIP44 address index (default 0)
   * @return EthKeyResult with 0x-prefixed private key and checksummed address
   * @throws MnemonicException if mnemonic is invalid
   */
  fun deriveEthKey(mnemonic: String, addressIndex: Int = 0): EthKeyResult {
    val words = normalizeMnemonic(mnemonic)
    validateWords(words)

    val seed = MnemonicCode.toSeed(words, "")
    try {
      return deriveEthKeyFromSeed(seed, addressIndex)
    } finally {
      seed.fill(0)
    }
  }

  /**
   * Derives all wallet keys from a BIP39 mnemonic.
   *
   * BTC at m/44'/0'/0'/0/0, ETH at m/44'/60'/0'/0/0.
   * Computes the seed only once for efficiency.
   *
   * @param mnemonic BIP39 mnemonic string
   * @return WalletKeys with all derived keys
   * @throws MnemonicException if mnemonic is invalid
   */
  fun deriveKeys(mnemonic: String): WalletKeys {
    val words = normalizeMnemonic(mnemonic)
    validateWords(words)

    val seed = MnemonicCode.toSeed(words, "")
    try {
      val btcKey = deriveBtcKeyFromSeed(seed, 0)
      val ethKey = deriveEthKeyFromSeed(seed, 0)

      return WalletKeys(
        mnemonic = words,
        btcPrivateKeyWIF = btcKey.privateKeyWIF,
        btcAddress = btcKey.address,
        ethPrivateKeyHex = ethKey.privateKeyHex,
        ethAddress = ethKey.address
      )
    } finally {
      seed.fill(0)
    }
  }

  /**
   * Internal BTC key derivation from a pre-computed seed.
   * Derives at m/44'/0'/0'/0/{addressIndex}.
   */
  private fun deriveBtcKeyFromSeed(seed: ByteArray, addressIndex: Int): BtcKeyResult {
    val masterKey = HDKeyDerivation.createMasterPrivateKey(seed)

    // Derive m/44'/0'/0'/0/{addressIndex}
    val purposeKey = HDKeyDerivation.deriveChildKey(masterKey, ChildNumber(PURPOSE, true))
    val coinTypeKey = HDKeyDerivation.deriveChildKey(purposeKey, ChildNumber(BTC_COIN_TYPE, true))
    val accountKey = HDKeyDerivation.deriveChildKey(coinTypeKey, ChildNumber(ACCOUNT, true))
    val changeKey = HDKeyDerivation.deriveChildKey(accountKey, ChildNumber(CHANGE, false))
    val addressKey = HDKeyDerivation.deriveChildKey(changeKey, ChildNumber(addressIndex, false))

    val ecKey = ECKey.fromPrivate(addressKey.privKey)
    val address = LegacyAddress.fromKey(networkParams, ecKey)

    return BtcKeyResult(
      privateKeyWIF = ecKey.getPrivateKeyAsWiF(networkParams),
      address = address.toBase58()
    )
  }

  /**
   * Internal ETH key derivation from a pre-computed seed.
   * Derives at m/44'/60'/0'/0/{addressIndex}.
   */
  private fun deriveEthKeyFromSeed(seed: ByteArray, addressIndex: Int): EthKeyResult {
    val masterKeyPair = Bip32ECKeyPair.generateKeyPair(seed)

    // Derive m/44'/60'/0'/0/{addressIndex}
    // web3j Bip32ECKeyPair uses int array with hardened flag as bit 31
    val path = intArrayOf(
      PURPOSE or Bip32ECKeyPair.HARDENED_BIT,
      ETH_COIN_TYPE or Bip32ECKeyPair.HARDENED_BIT,
      ACCOUNT or Bip32ECKeyPair.HARDENED_BIT,
      CHANGE,
      addressIndex
    )
    val derivedKeyPair = Bip32ECKeyPair.deriveKeyPair(masterKeyPair, path)
    val credentials = Credentials.create(derivedKeyPair)

    // Keys.toChecksumAddress produces EIP-55 checksummed address
    val checksummedAddress = Keys.toChecksumAddress(credentials.address)

    // Private key as 0x-prefixed hex, zero-padded to 64 hex chars
    val privateKeyHex = "0x" + derivedKeyPair.privateKey
      .toString(16)
      .padStart(64, '0')

    return EthKeyResult(
      privateKeyHex = privateKeyHex,
      address = checksummedAddress
    )
  }

  /**
   * Normalizes mnemonic input: trim, lowercase, collapse whitespace.
   * Matches the web wallet's convertMnemonicToValid() behavior.
   */
  private fun normalizeMnemonic(mnemonic: String): List<String> {
    return mnemonic
      .trim()
      .lowercase()
      .split("\\s+".toRegex())
      .filter { it.isNotEmpty() }
  }

  /**
   * Validates word list, throwing MnemonicException with descriptive messages.
   *
   * Checks: word count, wordlist membership, and BIP39 checksum.
   */
  private fun validateWords(words: List<String>) {
    if (words.size != EXPECTED_WORD_COUNT) {
      throw MnemonicException(
        "Invalid word count: expected $EXPECTED_WORD_COUNT, got ${words.size}"
      )
    }

    val wordList = mnemonicCode.wordList
    for (word in words) {
      if (!wordList.contains(word)) {
        throw MnemonicException("Word '$word' not in BIP39 wordlist")
      }
    }

    try {
      mnemonicCode.check(words)
    } catch (e: org.bitcoinj.crypto.MnemonicException.MnemonicChecksumException) {
      throw MnemonicException("Invalid mnemonic checksum")
    } catch (e: org.bitcoinj.crypto.MnemonicException) {
      throw MnemonicException("Invalid mnemonic: ${e.message}")
    }
  }
}
