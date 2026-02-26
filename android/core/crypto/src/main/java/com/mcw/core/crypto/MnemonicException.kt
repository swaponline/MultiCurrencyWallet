package com.mcw.core.crypto

/**
 * Exception thrown when mnemonic validation or derivation fails.
 *
 * Provides specific error messages for:
 * - Invalid word count
 * - Word not in BIP39 wordlist
 * - Invalid checksum
 */
class MnemonicException(message: String) : Exception(message)
