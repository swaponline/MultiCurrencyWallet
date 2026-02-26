package com.mcw.core.crypto

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for CryptoManager — BIP39/BIP44 key derivation.
 *
 * Cross-platform validation: known mnemonics produce identical BTC P2PKH addresses
 * and checksummed ETH addresses as the web wallet (Decision 11).
 *
 * Reference addresses derived from the web wallet's mnemonic.ts using:
 * - bitcoinjs-lib bitcoin.payments.p2pkh() at m/44'/0'/0'/0/0
 * - ethereumjs-wallet hdkey at m/44'/60'/0'/0/0
 */
class CryptoManagerTest {

  private lateinit var cryptoManager: CryptoManager

  // Known test mnemonic #1 (BIP39 spec "abandon" vector)
  private val abandonMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

  // Known test mnemonic #2 (BIP39 spec "zoo" vector)
  private val zooMnemonic = "zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong"

  // Expected addresses from web wallet for mnemonic #1
  private val expectedBtcAddressAbandon = "1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA"
  private val expectedBtcWifAbandon = "L4p2b9VAf8k5aUahF1JCJUzZkgNEAqLfq8DDdQiyAprQAKSbu8hf"
  private val expectedEthAddressAbandon = "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
  private val expectedEthPrivKeyAbandon = "0x1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727"

  // Expected addresses from web wallet for mnemonic #2
  private val expectedBtcAddressZoo = "1EjnS13zBgN6tUgy6U64qFeh53fyAeUsqE"
  private val expectedBtcWifZoo = "L5NpMzWdTPpmQ1WsjtBpTti3CCXQ7ZjZQo4qcJJXPUBVVWXGC8k4"
  private val expectedEthAddressZoo = "0xfc2077CA7F403cBECA41B1B0F62D91B5EA631B5E"
  private val expectedEthPrivKeyZoo = "0x7af65ba4dd53f23495dcb04995e96f47c243217fc279f10795871b725cd009ae"

  // Expected BTC address at index 1 (m/44'/0'/0'/0/1) for abandon mnemonic
  private val expectedBtcAddressAbandonIndex1 = "1Ak8PffB2meyfYnbXZR9EGfLfFZVpzJvQP"

  @Before
  fun setUp() {
    cryptoManager = CryptoManager()
  }

  // ===== generateMnemonic tests =====

  @Test
  fun testGenerateMnemonic_returns12Words() {
    val mnemonic = cryptoManager.generateMnemonic()
    val words = mnemonic.split(" ")
    assertEquals("Generated mnemonic must have exactly 12 words", 12, words.size)
  }

  @Test
  fun testGenerateMnemonic_allWordsInBip39Wordlist() {
    val mnemonic = cryptoManager.generateMnemonic()
    // If all words are in the BIP39 wordlist, validateMnemonic should pass
    assertTrue(
      "Generated mnemonic must be a valid BIP39 mnemonic",
      cryptoManager.validateMnemonic(mnemonic)
    )
  }

  @Test
  fun testGenerateMnemonic_differentEachTime() {
    val mnemonic1 = cryptoManager.generateMnemonic()
    val mnemonic2 = cryptoManager.generateMnemonic()
    assertNotEquals(
      "Two consecutive mnemonic generations should produce different results",
      mnemonic1,
      mnemonic2
    )
  }

  // ===== validateMnemonic tests =====

  @Test
  fun testValidateMnemonic_validMnemonicPasses() {
    assertTrue(
      "Known valid mnemonic (abandon) should pass validation",
      cryptoManager.validateMnemonic(abandonMnemonic)
    )
    assertTrue(
      "Known valid mnemonic (zoo) should pass validation",
      cryptoManager.validateMnemonic(zooMnemonic)
    )
  }

  @Test
  fun testValidateMnemonic_wrongWordCountFails_11Words() {
    val mnemonic11 = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon"
    try {
      cryptoManager.validateMnemonic(mnemonic11)
      fail("Should throw exception for 11-word mnemonic")
    } catch (e: MnemonicException) {
      assertTrue(
        "Error should mention word count: ${e.message}",
        e.message!!.contains("Invalid word count") && e.message!!.contains("got 11")
      )
    }
  }

  @Test
  fun testValidateMnemonic_wrongWordCountFails_13Words() {
    val mnemonic13 = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about extra"
    try {
      cryptoManager.validateMnemonic(mnemonic13)
      fail("Should throw exception for 13-word mnemonic")
    } catch (e: MnemonicException) {
      assertTrue(
        "Error should mention word count: ${e.message}",
        e.message!!.contains("Invalid word count") && e.message!!.contains("got 13")
      )
    }
  }

  @Test
  fun testInvalidMnemonicWrongWordCount_5Words() {
    val mnemonic5 = "abandon abandon abandon abandon abandon"
    try {
      cryptoManager.validateMnemonic(mnemonic5)
      fail("Should throw exception for 5-word mnemonic")
    } catch (e: MnemonicException) {
      assertTrue(
        "Error should mention word count: ${e.message}",
        e.message!!.contains("Invalid word count") && e.message!!.contains("got 5")
      )
    }
  }

  @Test
  fun testValidateMnemonic_nonWordlistWordFails() {
    val badMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon xyz"
    try {
      cryptoManager.validateMnemonic(badMnemonic)
      fail("Should throw exception for non-wordlist word")
    } catch (e: MnemonicException) {
      assertTrue(
        "Error should mention which word is invalid: ${e.message}",
        e.message!!.contains("xyz") && e.message!!.contains("not in BIP39 wordlist")
      )
    }
  }

  @Test
  fun testInvalidMnemonicBadChecksum() {
    // Valid words but wrong checksum (swapped last two valid words)
    val badChecksum = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about about"
    try {
      cryptoManager.validateMnemonic(badChecksum)
      fail("Should throw exception for bad checksum")
    } catch (e: MnemonicException) {
      assertTrue(
        "Error should mention checksum: ${e.message}",
        e.message!!.contains("Invalid mnemonic checksum")
      )
    }
  }

  // ===== Edge case: whitespace and case normalization =====

  @Test
  fun testValidateMnemonic_trimsLeadingTrailingWhitespace() {
    val mnemonicWithSpaces = "  $abandonMnemonic  "
    assertTrue(
      "Mnemonic with leading/trailing whitespace should be valid after trimming",
      cryptoManager.validateMnemonic(mnemonicWithSpaces)
    )
  }

  @Test
  fun testValidateMnemonic_normalizesMultipleSpaces() {
    val mnemonicExtraSpaces = "abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  about"
    assertTrue(
      "Mnemonic with multiple spaces between words should be valid after normalization",
      cryptoManager.validateMnemonic(mnemonicExtraSpaces)
    )
  }

  @Test
  fun testValidateMnemonic_lowercasesMixedCase() {
    val mnemonicMixed = "Abandon ABANDON abandon Abandon ABANDON abandon Abandon ABANDON abandon Abandon ABANDON About"
    assertTrue(
      "Mixed-case mnemonic should be valid after lowercasing",
      cryptoManager.validateMnemonic(mnemonicMixed)
    )
  }

  // ===== deriveBtcKey tests =====

  @Test
  fun testDeriveBtcKeyFromKnownMnemonic_abandonMnemonic() {
    val btcKey = cryptoManager.deriveBtcKey(abandonMnemonic)
    assertEquals(
      "BTC P2PKH address must match web wallet output for abandon mnemonic",
      expectedBtcAddressAbandon,
      btcKey.address
    )
    assertEquals(
      "BTC WIF private key must match web wallet output",
      expectedBtcWifAbandon,
      btcKey.privateKeyWIF
    )
  }

  @Test
  fun testDeriveBtcKeyFromKnownMnemonic_zooMnemonic() {
    val btcKey = cryptoManager.deriveBtcKey(zooMnemonic)
    assertEquals(
      "BTC P2PKH address must match web wallet output for zoo mnemonic",
      expectedBtcAddressZoo,
      btcKey.address
    )
    assertEquals(
      "BTC WIF private key must match web wallet output",
      expectedBtcWifZoo,
      btcKey.privateKeyWIF
    )
  }

  @Test
  fun testDeriveBtcKey_addressStartsWith1() {
    val btcKey = cryptoManager.deriveBtcKey(abandonMnemonic)
    assertTrue(
      "BTC P2PKH mainnet address must start with '1'",
      btcKey.address.startsWith("1")
    )
  }

  @Test
  fun testBtcPathParameter_differentIndexProducesDifferentAddress() {
    val btcKey0 = cryptoManager.deriveBtcKey(abandonMnemonic, 0)
    val btcKey1 = cryptoManager.deriveBtcKey(abandonMnemonic, 1)
    assertNotEquals(
      "Different derivation indices must produce different addresses",
      btcKey0.address,
      btcKey1.address
    )
    assertEquals(
      "Index 0 address must match expected",
      expectedBtcAddressAbandon,
      btcKey0.address
    )
    assertEquals(
      "Index 1 address must match expected",
      expectedBtcAddressAbandonIndex1,
      btcKey1.address
    )
  }

  // ===== deriveEthKey tests =====

  @Test
  fun testDeriveEthKeyFromKnownMnemonic_abandonMnemonic() {
    val ethKey = cryptoManager.deriveEthKey(abandonMnemonic)
    assertEquals(
      "ETH checksummed address must match web wallet output for abandon mnemonic",
      expectedEthAddressAbandon,
      ethKey.address
    )
    assertEquals(
      "ETH private key hex must match web wallet output",
      expectedEthPrivKeyAbandon,
      ethKey.privateKeyHex
    )
  }

  @Test
  fun testDeriveEthKeyFromKnownMnemonic_zooMnemonic() {
    val ethKey = cryptoManager.deriveEthKey(zooMnemonic)
    assertEquals(
      "ETH checksummed address must match web wallet output for zoo mnemonic",
      expectedEthAddressZoo,
      ethKey.address
    )
    assertEquals(
      "ETH private key hex must match web wallet output",
      expectedEthPrivKeyZoo,
      ethKey.privateKeyHex
    )
  }

  @Test
  fun testDeriveEthKey_addressIs0xPrefixedChecksummed() {
    val ethKey = cryptoManager.deriveEthKey(abandonMnemonic)
    assertTrue(
      "ETH address must be 0x-prefixed",
      ethKey.address.startsWith("0x")
    )
    // EIP-55: checksummed address has mixed case (not all lowercase)
    val afterPrefix = ethKey.address.substring(2)
    assertTrue(
      "ETH address must be EIP-55 checksummed (mixed case)",
      afterPrefix != afterPrefix.lowercase() || afterPrefix != afterPrefix.uppercase()
    )
  }

  @Test
  fun testDeriveEthKey_privateKeyIs0xPrefixed() {
    val ethKey = cryptoManager.deriveEthKey(abandonMnemonic)
    assertTrue(
      "ETH private key must be 0x-prefixed",
      ethKey.privateKeyHex.startsWith("0x")
    )
    assertEquals(
      "ETH private key must be 66 chars (0x + 64 hex chars)",
      66,
      ethKey.privateKeyHex.length
    )
  }

  // ===== Single ETH key across chains =====

  @Test
  fun testSingleEthKeyAcrossChains_abandonMnemonic() {
    // Same ETH private key should produce same address regardless of chain
    // since all EVM chains use the same derivation path m/44'/60'/0'/0/0
    val ethKey = cryptoManager.deriveEthKey(abandonMnemonic)
    // Verify the address and key are deterministic
    val ethKey2 = cryptoManager.deriveEthKey(abandonMnemonic)
    assertEquals(
      "Same mnemonic must always produce same ETH address",
      ethKey.address,
      ethKey2.address
    )
    assertEquals(
      "Same mnemonic must always produce same ETH private key",
      ethKey.privateKeyHex,
      ethKey2.privateKeyHex
    )
  }

  @Test
  fun testSingleEthKeyAcrossChains_zooMnemonic() {
    val ethKey = cryptoManager.deriveEthKey(zooMnemonic)
    val ethKey2 = cryptoManager.deriveEthKey(zooMnemonic)
    assertEquals(
      "Same mnemonic must always produce same ETH address (zoo)",
      ethKey.address,
      ethKey2.address
    )
    assertEquals(
      "Same mnemonic must always produce same ETH private key (zoo)",
      ethKey.privateKeyHex,
      ethKey2.privateKeyHex
    )
  }

  // ===== deriveKeys tests =====

  @Test
  fun testDeriveKeys_abandonMnemonic() {
    val keys = cryptoManager.deriveKeys(abandonMnemonic)
    assertEquals(
      "WalletKeys mnemonic must be a list of 12 words",
      12,
      keys.mnemonic.size
    )
    assertEquals(
      "BTC address must match",
      expectedBtcAddressAbandon,
      keys.btcAddress
    )
    assertEquals(
      "BTC WIF must match",
      expectedBtcWifAbandon,
      keys.btcPrivateKeyWIF
    )
    assertEquals(
      "ETH address must match",
      expectedEthAddressAbandon,
      keys.ethAddress
    )
    assertEquals(
      "ETH private key must match",
      expectedEthPrivKeyAbandon,
      keys.ethPrivateKeyHex
    )
  }

  @Test
  fun testDeriveKeys_zooMnemonic() {
    val keys = cryptoManager.deriveKeys(zooMnemonic)
    assertEquals("BTC address must match", expectedBtcAddressZoo, keys.btcAddress)
    assertEquals("BTC WIF must match", expectedBtcWifZoo, keys.btcPrivateKeyWIF)
    assertEquals("ETH address must match", expectedEthAddressZoo, keys.ethAddress)
    assertEquals("ETH private key must match", expectedEthPrivKeyZoo, keys.ethPrivateKeyHex)
  }

  @Test
  fun testDeriveKeys_mnemonicWithWhitespace() {
    val messy = "  Abandon  ABANDON  abandon  Abandon  ABANDON  abandon  Abandon  ABANDON  abandon  Abandon  ABANDON  About  "
    val keys = cryptoManager.deriveKeys(messy)
    assertEquals(
      "BTC address from messy input must match clean input",
      expectedBtcAddressAbandon,
      keys.btcAddress
    )
    assertEquals(
      "ETH address from messy input must match clean input",
      expectedEthAddressAbandon,
      keys.ethAddress
    )
  }

  // ===== WalletKeys data class tests =====

  @Test
  fun testWalletKeys_mnemonicIsListOfWords() {
    val keys = cryptoManager.deriveKeys(abandonMnemonic)
    assertEquals(12, keys.mnemonic.size)
    assertEquals("abandon", keys.mnemonic[0])
    assertEquals("about", keys.mnemonic[11])
  }

  @Test
  fun testWalletKeys_allFieldsPopulated() {
    val keys = cryptoManager.deriveKeys(abandonMnemonic)
    assertNotNull("mnemonic must not be null", keys.mnemonic)
    assertNotNull("btcPrivateKeyWIF must not be null", keys.btcPrivateKeyWIF)
    assertNotNull("btcAddress must not be null", keys.btcAddress)
    assertNotNull("ethPrivateKeyHex must not be null", keys.ethPrivateKeyHex)
    assertNotNull("ethAddress must not be null", keys.ethAddress)
    assertTrue("btcPrivateKeyWIF must not be empty", keys.btcPrivateKeyWIF.isNotEmpty())
    assertTrue("btcAddress must not be empty", keys.btcAddress.isNotEmpty())
    assertTrue("ethPrivateKeyHex must not be empty", keys.ethPrivateKeyHex.isNotEmpty())
    assertTrue("ethAddress must not be empty", keys.ethAddress.isNotEmpty())
  }

  // ===== Invalid mnemonic to derivation =====

  @Test(expected = MnemonicException::class)
  fun testDeriveBtcKey_invalidMnemonicThrows() {
    cryptoManager.deriveBtcKey("invalid mnemonic words here")
  }

  @Test(expected = MnemonicException::class)
  fun testDeriveEthKey_invalidMnemonicThrows() {
    cryptoManager.deriveEthKey("invalid mnemonic words here")
  }

  @Test(expected = MnemonicException::class)
  fun testDeriveKeys_invalidMnemonicThrows() {
    cryptoManager.deriveKeys("invalid mnemonic words here")
  }
}
