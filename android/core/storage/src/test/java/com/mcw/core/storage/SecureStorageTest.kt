package com.mcw.core.storage

import android.content.SharedPreferences
import org.junit.Before
import org.junit.Test
import org.junit.Assert.*
import org.mockito.kotlin.*
import java.security.GeneralSecurityException
import java.lang.SecurityException

/**
 * Unit tests for SecureStorage.
 *
 * Since EncryptedSharedPreferences requires Android KeyStore (unavailable in unit tests),
 * we inject a regular SharedPreferences mock via SecureStorage.createForTesting().
 * This tests the storage logic (key names, serialization, corruption handling)
 * without requiring Android instrumentation.
 */
class SecureStorageTest {

  private lateinit var mockPrefs: SharedPreferences
  private lateinit var mockEditor: SharedPreferences.Editor
  private lateinit var storage: SecureStorage

  // In-memory backing store to simulate SharedPreferences behavior
  private val dataStore = mutableMapOf<String, String?>()

  @Before
  fun setUp() {
    dataStore.clear()

    mockEditor = mock {
      on { putString(any(), anyOrNull()) } doAnswer { invocation ->
        val key = invocation.getArgument<String>(0)
        val value = invocation.getArgument<String?>(1)
        dataStore[key] = value
        mockEditor
      }
      on { putLong(any(), any()) } doAnswer { invocation ->
        val key = invocation.getArgument<String>(0)
        val value = invocation.getArgument<Long>(1)
        dataStore[key] = value.toString()
        mockEditor
      }
      on { remove(any()) } doAnswer { invocation ->
        val key = invocation.getArgument<String>(0)
        dataStore.remove(key)
        mockEditor
      }
      on { clear() } doAnswer {
        dataStore.clear()
        mockEditor
      }
      on { apply() } doAnswer { /* no-op */ }
      on { commit() } doReturn true
    }

    mockPrefs = mock {
      on { edit() } doReturn mockEditor
      on { getString(any(), anyOrNull()) } doAnswer { invocation ->
        val key = invocation.getArgument<String>(0)
        val default = invocation.getArgument<String?>(1)
        dataStore.getOrDefault(key, default)
      }
      on { getLong(any(), any()) } doAnswer { invocation ->
        val key = invocation.getArgument<String>(0)
        val default = invocation.getArgument<Long>(1)
        dataStore[key]?.toLongOrNull() ?: default
      }
      on { contains(any()) } doAnswer { invocation ->
        val key = invocation.getArgument<String>(0)
        dataStore.containsKey(key)
      }
      on { all } doAnswer { dataStore.toMap() }
    }

    storage = SecureStorage.createForTesting(mockPrefs)
  }

  // --- Mnemonic Tests ---

  @Test
  fun testSaveAndRetrieveMnemonic() {
    val words = listOf(
      "abandon", "abandon", "abandon", "abandon",
      "abandon", "abandon", "abandon", "abandon",
      "abandon", "abandon", "abandon", "about"
    )

    storage.saveMnemonic(words)
    val retrieved = storage.getMnemonic()

    assertNotNull(retrieved)
    assertEquals(12, retrieved!!.size)
    assertEquals(words, retrieved)
  }

  @Test
  fun testGetMnemonicWhenNoneSaved() {
    val result = storage.getMnemonic()
    assertNull(result)
  }

  @Test
  fun testMnemonicStoredAsSpaceSeparated() {
    val words = listOf("one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve")

    storage.saveMnemonic(words)

    // Verify the stored value is space-separated
    val storedValue = dataStore[SecureStorage.KEY_MNEMONIC]
    assertNotNull(storedValue)
    assertEquals("one two three four five six seven eight nine ten eleven twelve", storedValue)
  }

  // --- Private Keys Tests ---

  @Test
  fun testSaveAndRetrievePrivateKeys() {
    val btcWIF = "5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ"
    val ethHex = "0x4c0883a69102937d6231471b5dbb6204fe512961708279f34d6a2d3e9f9f3b1a"

    storage.savePrivateKeys(btcWIF, ethHex)
    val result = storage.getPrivateKeys()

    assertNotNull(result)
    assertEquals(btcWIF, result!!.first)
    assertEquals(ethHex, result.second)
  }

  @Test
  fun testGetPrivateKeysWhenNoneSaved() {
    val result = storage.getPrivateKeys()
    assertNull(result)
  }

  @Test
  fun testGetPrivateKeysWhenOnlyBtcSaved() {
    // Only save BTC key, not ETH — should return null (both must exist)
    dataStore[SecureStorage.KEY_BTC_WIF] = "5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ"

    val result = storage.getPrivateKeys()
    assertNull(result)
  }

  @Test
  fun testGetPrivateKeysWhenOnlyEthSaved() {
    // Only save ETH key, not BTC — should return null (both must exist)
    dataStore[SecureStorage.KEY_ETH_HEX] = "0x4c0883a69102937d6231471b5dbb6204fe512961708279f34d6a2d3e9f9f3b1a"

    val result = storage.getPrivateKeys()
    assertNull(result)
  }

  // --- Password Hash Tests ---

  @Test
  fun testPasswordHashStorage() {
    // Simulate a bcrypt hash with cost factor 12
    val bcryptHash = "\$2a\$12\$LJ3m4ys3Lk0TSwHilBiMBe0K7fNIzrBMNPAPlOXOQiSCfiKPwD6S."

    storage.savePasswordHash(bcryptHash)
    val retrieved = storage.getPasswordHash()

    assertNotNull(retrieved)
    assertEquals(bcryptHash, retrieved)
    // Verify bcrypt hash starts with $2a$12$ prefix (cost factor 12)
    assertTrue("Hash must start with \$2a\$12\$ prefix", retrieved!!.startsWith("\$2a\$12\$"))
  }

  @Test
  fun testGetPasswordHashWhenNoneSaved() {
    val result = storage.getPasswordHash()
    assertNull(result)
  }

  // --- WalletConnect Sessions Tests ---

  @Test
  fun testSaveAndRetrieveWalletConnectSessions() {
    val json = """[{"topic":"abc123","peerName":"TestDApp","peerUrl":"https://test.com"}]"""

    storage.saveWalletConnectSessions(json)
    val retrieved = storage.getWalletConnectSessions()

    assertNotNull(retrieved)
    assertEquals(json, retrieved)
  }

  @Test
  fun testGetWalletConnectSessionsWhenNoneSaved() {
    val result = storage.getWalletConnectSessions()
    assertNull(result)
  }

  // --- Active Chain ID Tests ---

  @Test
  fun testSaveAndRetrieveActiveChainId() {
    storage.saveActiveChainId(56L) // BSC
    val retrieved = storage.getActiveChainId()

    assertEquals(56L, retrieved)
  }

  @Test
  fun testGetActiveChainIdDefault() {
    // Default should be 1 (ETH mainnet)
    val result = storage.getActiveChainId()
    assertEquals(1L, result)
  }

  // --- clearAll Tests ---

  @Test
  fun testClearAllRemovesData() {
    // Save data in all fields
    storage.saveMnemonic(listOf("abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "about"))
    storage.savePrivateKeys("btcWIF", "ethHex")
    storage.savePasswordHash("\$2a\$12\$hashvalue")
    storage.saveWalletConnectSessions("[{}]")
    storage.saveActiveChainId(137L)

    // Verify data exists
    assertNotNull(storage.getMnemonic())
    assertNotNull(storage.getPrivateKeys())
    assertNotNull(storage.getPasswordHash())
    assertNotNull(storage.getWalletConnectSessions())

    // Clear all
    storage.clearAll()

    // Verify all getters return null/default
    assertNull(storage.getMnemonic())
    assertNull(storage.getPrivateKeys())
    assertNull(storage.getPasswordHash())
    assertNull(storage.getWalletConnectSessions())
    assertEquals(1L, storage.getActiveChainId()) // default value
  }

  // --- KeyStore Corruption Tests ---

  @Test
  fun testKeystoreCorruptionHandling() {
    // EncryptedSharedPreferences wraps decryption failures in SecurityException (RuntimeException)
    // which Mockito can throw from interface methods (unlike checked GeneralSecurityException)
    val corruptedPrefs = mock<SharedPreferences> {
      on { getString(eq(SecureStorage.KEY_MNEMONIC), anyOrNull()) } doThrow SecurityException("KeyStore corrupted")
      on { edit() } doReturn mockEditor
    }
    val corruptedStorage = SecureStorage.createForTesting(corruptedPrefs)

    val exception = assertThrows(KeyStoreCorruptionException::class.java) {
      corruptedStorage.getMnemonic()
    }

    assertEquals("Wallet data corrupted, please reimport your seed phrase", exception.message)
    // Verify clearAll() was called via editor.clear().apply()
    verify(mockEditor).clear()
    verify(mockEditor, atLeastOnce()).apply()
  }

  @Test
  fun testKeystoreCorruptionOnGetPrivateKeys() {
    val corruptedPrefs = mock<SharedPreferences> {
      on { getString(eq(SecureStorage.KEY_BTC_WIF), anyOrNull()) } doThrow SecurityException("Decryption failed")
      on { edit() } doReturn mockEditor
    }
    val corruptedStorage = SecureStorage.createForTesting(corruptedPrefs)

    val exception = assertThrows(KeyStoreCorruptionException::class.java) {
      corruptedStorage.getPrivateKeys()
    }

    assertEquals("Wallet data corrupted, please reimport your seed phrase", exception.message)
    verify(mockEditor).clear()
  }

  @Test
  fun testKeystoreCorruptionOnGetPasswordHash() {
    val corruptedPrefs = mock<SharedPreferences> {
      on { getString(eq(SecureStorage.KEY_PASSWORD_HASH), anyOrNull()) } doThrow SecurityException("KeyStore unavailable")
      on { edit() } doReturn mockEditor
    }
    val corruptedStorage = SecureStorage.createForTesting(corruptedPrefs)

    val exception = assertThrows(KeyStoreCorruptionException::class.java) {
      corruptedStorage.getPasswordHash()
    }

    assertEquals("Wallet data corrupted, please reimport your seed phrase", exception.message)
    verify(mockEditor).clear()
  }

  @Test
  fun testKeystoreCorruptionOnGetWalletConnectSessions() {
    val corruptedPrefs = mock<SharedPreferences> {
      on { getString(eq(SecureStorage.KEY_WC_SESSIONS), anyOrNull()) } doThrow SecurityException("KeyStore reset")
      on { edit() } doReturn mockEditor
    }
    val corruptedStorage = SecureStorage.createForTesting(corruptedPrefs)

    val exception = assertThrows(KeyStoreCorruptionException::class.java) {
      corruptedStorage.getWalletConnectSessions()
    }

    assertEquals("Wallet data corrupted, please reimport your seed phrase", exception.message)
    verify(mockEditor).clear()
  }

  // --- Multiple Read/Write Cycles ---

  @Test
  fun testMultipleReadWriteCycles() {
    // First write
    val words1 = listOf("abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "about")
    storage.saveMnemonic(words1)
    assertEquals(words1, storage.getMnemonic())

    // Overwrite with new data
    val words2 = listOf("zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "wrong")
    storage.saveMnemonic(words2)
    assertEquals(words2, storage.getMnemonic())

    // Overwrite private keys
    storage.savePrivateKeys("btcKey1", "ethKey1")
    assertEquals(Pair("btcKey1", "ethKey1"), storage.getPrivateKeys())

    storage.savePrivateKeys("btcKey2", "ethKey2")
    assertEquals(Pair("btcKey2", "ethKey2"), storage.getPrivateKeys())

    // Verify first overwrite doesn't leak
    assertNotEquals(words1, storage.getMnemonic())
  }

  @Test
  fun testEmptyStringTreatedAsValid() {
    // Per spec: "Empty string saved -> treated as valid (caller validates)"
    storage.savePasswordHash("")
    val result = storage.getPasswordHash()
    assertNotNull(result)
    assertEquals("", result)
  }

  // --- hasWallet Tests ---

  @Test
  fun testHasWalletReturnsTrueWhenMnemonicExists() {
    storage.saveMnemonic(listOf("abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "about"))
    assertTrue(storage.hasWallet())
  }

  @Test
  fun testHasWalletReturnsFalseWhenEmpty() {
    assertFalse(storage.hasWallet())
  }
}
