package com.mcw.core.storage

/**
 * Thrown when EncryptedSharedPreferences cannot decrypt stored data,
 * typically due to Android KeyStore corruption or key wipe after OS update.
 *
 * The caller (UI layer) should catch this and display the message to the user,
 * then guide them through the seed phrase reimport flow.
 */
class KeyStoreCorruptionException(
  message: String = CORRUPTION_MESSAGE
) : Exception(message) {

  companion object {
    const val CORRUPTION_MESSAGE = "Wallet data corrupted, please reimport your seed phrase"
  }
}
