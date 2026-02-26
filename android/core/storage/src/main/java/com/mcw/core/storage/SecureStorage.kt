package com.mcw.core.storage

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import java.security.GeneralSecurityException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * EncryptedSharedPreferences wrapper for wallet keys and app password.
 *
 * Stores sensitive data encrypted via AES-256-GCM backed by Android KeyStore:
 * - BIP39 mnemonic (12 words, space-separated)
 * - BTC private key (WIF format)
 * - ETH private key (0x hex, shared across all EVM chains)
 * - App password bcrypt hash (cost factor 12)
 * - WalletConnect v2 session data (JSON)
 * - Active EVM chain ID
 *
 * On decryption failure (KeyStore corruption), throws [KeyStoreCorruptionException]
 * after clearing all corrupted storage. The caller (UI layer) should display the
 * error message and guide the user through seed phrase reimport.
 */
@Singleton
class SecureStorage private constructor(
  private val prefs: SharedPreferences
) {

  /**
   * Production constructor: creates EncryptedSharedPreferences backed by Android KeyStore.
   * Injected by Hilt with ApplicationContext.
   */
  @Inject
  constructor(@ApplicationContext context: Context) : this(createEncryptedPreferences(context))

  // --- Mnemonic ---

  /**
   * Stores BIP39 mnemonic as space-separated 12 words.
   */
  fun saveMnemonic(words: List<String>) {
    prefs.edit()
      .putString(KEY_MNEMONIC, words.joinToString(" "))
      .apply()
  }

  /**
   * Retrieves BIP39 mnemonic as list of 12 words.
   * @return list of words, or null if no mnemonic stored
   * @throws KeyStoreCorruptionException if decryption fails
   */
  fun getMnemonic(): List<String>? {
    val value = getStringOrHandleCorruption(KEY_MNEMONIC)
    return value?.split(" ")
  }

  // --- Private Keys ---

  /**
   * Stores BTC (WIF) and ETH (0x hex) private keys.
   * Both keys are stored separately under different encryption keys.
   */
  fun savePrivateKeys(btcWIF: String, ethHex: String) {
    prefs.edit()
      .putString(KEY_BTC_WIF, btcWIF)
      .putString(KEY_ETH_HEX, ethHex)
      .apply()
  }

  /**
   * Retrieves BTC and ETH private keys.
   * @return Pair(btcWIF, ethHex), or null if either key is missing
   * @throws KeyStoreCorruptionException if decryption fails
   */
  fun getPrivateKeys(): Pair<String, String>? {
    val btcWIF = getStringOrHandleCorruption(KEY_BTC_WIF)
    val ethHex = getStringOrHandleCorruption(KEY_ETH_HEX)
    // Both must exist — return null if either is missing
    if (btcWIF == null || ethHex == null) return null
    return Pair(btcWIF, ethHex)
  }

  // --- Password Hash ---

  /**
   * Stores bcrypt hash of app password.
   * Expected format: $2a$12$... (bcrypt cost factor 12, 60 characters)
   */
  fun savePasswordHash(hash: String) {
    prefs.edit()
      .putString(KEY_PASSWORD_HASH, hash)
      .apply()
  }

  /**
   * Retrieves bcrypt password hash.
   * @return hash string, or null if no password set
   * @throws KeyStoreCorruptionException if decryption fails
   */
  fun getPasswordHash(): String? {
    return getStringOrHandleCorruption(KEY_PASSWORD_HASH)
  }

  // --- WalletConnect Sessions ---

  /**
   * Stores WalletConnect v2 session data as JSON string.
   */
  fun saveWalletConnectSessions(json: String) {
    prefs.edit()
      .putString(KEY_WC_SESSIONS, json)
      .apply()
  }

  /**
   * Retrieves WalletConnect session data.
   * @return JSON string, or null if no sessions stored
   * @throws KeyStoreCorruptionException if decryption fails
   */
  fun getWalletConnectSessions(): String? {
    return getStringOrHandleCorruption(KEY_WC_SESSIONS)
  }

  // --- Active Chain ID ---

  /**
   * Stores the currently selected EVM chain ID.
   */
  fun saveActiveChainId(chainId: Long) {
    prefs.edit()
      .putLong(KEY_ACTIVE_CHAIN_ID, chainId)
      .apply()
  }

  /**
   * Retrieves the active EVM chain ID.
   * @return chain ID, defaults to 1 (ETH mainnet) if not set
   */
  fun getActiveChainId(): Long {
    return try {
      prefs.getLong(KEY_ACTIVE_CHAIN_ID, DEFAULT_CHAIN_ID)
    } catch (e: SecurityException) {
      handleCorruption()
      throw KeyStoreCorruptionException()
    } catch (e: GeneralSecurityException) {
      handleCorruption()
      throw KeyStoreCorruptionException()
    }
  }

  // --- Wallet State ---

  /**
   * Checks whether a wallet has been created/imported.
   * A wallet exists if a mnemonic is stored.
   */
  fun hasWallet(): Boolean {
    return prefs.contains(KEY_MNEMONIC)
  }

  // --- Clear ---

  /**
   * Wipes all encrypted data from storage.
   * Called on KeyStore corruption or when user explicitly resets wallet.
   */
  fun clearAll() {
    prefs.edit()
      .clear()
      .apply()
  }

  // --- Internal Helpers ---

  /**
   * Attempts to read a string value from encrypted preferences.
   * On SecurityException or GeneralSecurityException (KeyStore corruption),
   * clears all data and throws KeyStoreCorruptionException.
   *
   * EncryptedSharedPreferences wraps decryption failures in SecurityException
   * (a RuntimeException), while the underlying crypto layer may throw
   * GeneralSecurityException (checked). We catch both to be defensive.
   */
  private fun getStringOrHandleCorruption(key: String): String? {
    return try {
      prefs.getString(key, null)
    } catch (e: SecurityException) {
      handleCorruption()
      throw KeyStoreCorruptionException()
    } catch (e: GeneralSecurityException) {
      handleCorruption()
      throw KeyStoreCorruptionException()
    }
  }

  /**
   * Clears all encrypted storage when KeyStore corruption is detected.
   * This is a last-resort recovery mechanism — the user will need to reimport
   * their seed phrase after this operation.
   */
  private fun handleCorruption() {
    prefs.edit()
      .clear()
      .apply()
  }

  companion object {
    /** SharedPreferences file name for encrypted wallet storage */
    const val PREFS_NAME = "wallet_secure_storage"

    // Storage keys — public for test verification
    const val KEY_MNEMONIC = "wallet_mnemonic"
    const val KEY_BTC_WIF = "wallet_btc_wif"
    const val KEY_ETH_HEX = "wallet_eth_hex"
    const val KEY_PASSWORD_HASH = "app_password_hash"
    const val KEY_WC_SESSIONS = "wc_sessions"
    const val KEY_ACTIVE_CHAIN_ID = "active_chain_id"

    /** Default EVM chain ID: ETH mainnet */
    private const val DEFAULT_CHAIN_ID = 1L

    /**
     * Creates EncryptedSharedPreferences backed by Android KeyStore.
     * Uses AES256-GCM for value encryption and AES256-SIV for key encryption.
     */
    private fun createEncryptedPreferences(context: Context): SharedPreferences {
      val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

      return EncryptedSharedPreferences.create(
        context,
        PREFS_NAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
      )
    }

    /**
     * Creates a SecureStorage instance with a pre-configured SharedPreferences.
     * For unit testing only — bypasses EncryptedSharedPreferences creation.
     */
    internal fun createForTesting(prefs: SharedPreferences): SecureStorage {
      return SecureStorage(prefs)
    }
  }
}
