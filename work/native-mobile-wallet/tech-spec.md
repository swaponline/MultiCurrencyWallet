---
created: 2026-02-26
status: draft
branch: feature/native-mobile-wallet
size: L
---

# Tech Spec: Native Mobile Wallet (Android)

## Solution

Build a standalone native Android application (Kotlin + Jetpack Compose) that reimplements the core wallet functionality of the existing web SPA. This is a **new project** — the existing codebase is React/TypeScript/Webpack with zero shared runtime code. The Android project will be created from scratch in `android/` directory, using the web wallet's configuration files, API endpoints, and derivation logic as reference implementations.

**Why single-activity MVVM:** Jetpack Compose Navigation within a single Activity is the standard modern Android pattern. MVVM (ViewModel + StateFlow) integrates natively with Compose's reactive UI model and provides lifecycle-aware state management. ViewModels survive configuration changes (rotation) and enable clean separation between UI state and business logic, which is critical for a crypto wallet where transaction state must not be lost mid-flow.

**Why no persistent caching:** User explicitly requested no caching to avoid cache invalidation bugs. This simplifies architecture significantly — no Room/SQLite database, no cache eviction strategy, no stale data display. All balances and tx history are fetched on-demand from RPC/APIs on every screen open or pull-to-refresh. Only in-memory caching during an active session is allowed (e.g., keeping balance results while user navigates between tabs). This means offline mode shows a clear "No connection" state rather than potentially misleading cached data.

**Architecture overview:** Single-activity Compose app with bottom navigation (Wallet / dApps tabs). Wallet tab: balance list → send flow → tx history. dApps tab: WebView browser with injected `window.ethereum` EIP-1193 provider + WalletConnect v2 via QR scanner. The JS-to-Native bridge for dApp browser uses `WebView.addJavascriptInterface()` for JS→Native calls and `evaluateJavascript()` for Native→JS responses, following the pattern used by MetaMask Mobile and Trust Wallet.

**Key cross-platform constraint:** Same mnemonic must produce identical BTC and ETH addresses in both web and mobile wallets. This is achieved by using identical BIP44 derivation paths (m/44'/0'/0'/0/0 for BTC, m/44'/60'/0'/0/0 for ETH) and identical address generation algorithms (P2PKH for BTC, checksummed hex for ETH). The single ETH private key is reused across all EVM chains (ETH, BSC, Polygon) — only the RPC endpoint and chain ID differ.

**Security model:** Keys stored in EncryptedSharedPreferences (AES-256-GCM via Android KeyStore). Biometric unlock via BiometricPrompt with app password fallback (bcrypt cost 12, minimum 8 chars — overrides user-spec 6-char minimum per security review). Devices without biometric hardware operate in password-only mode. Lockout after 5 failed password attempts with exponential backoff (60s, 120s, 300s). Auto-lock after 5 minutes of inactivity or when app goes to background for >30 seconds — requires re-authentication to resume. FLAG_SECURE set on mnemonic display and seed confirmation screens to prevent screenshots and screen recording. No root detection in MVP (documented accepted risk — see Risks section). API keys extracted from web config will be embedded in APK — acceptable for MVP since they are already public in the web bundle (Etherscan free tier, public RPC endpoints).

**Secret logging policy:** Transaction lifecycle logging (Crashlytics + logcat) must NEVER include private keys, mnemonic words, or password hashes. Release builds strip all DEBUG-level logcat via Timber production tree. Crashlytics custom logs include only: tx hash, status, chain, error message (no addresses, amounts, or signing data).

## Architecture

### What we're building/modifying

- **`:app` module** — Single-activity Compose UI: onboarding (create/import wallet), Wallet tab (balances, send, history), dApps tab (WebView browser), Settings. Bottom navigation via Compose Navigation.

- **`:core:crypto` module** — BIP39 mnemonic generation/validation, BIP44 key derivation for BTC (m/44'/0'/0'/0/0) and ETH (m/44'/60'/0'/0/0). Uses bitcoinj for BTC, web3j for ETH. Single ETH key shared across all EVM chains.

- **`:core:storage` module** — EncryptedSharedPreferences wrapper for mnemonic, private keys, app password (bcrypt hash), WalletConnect sessions. Android KeyStore backed AES-256-GCM. On decryption failure (KeyStore corruption): clear encrypted storage and show "Wallet data corrupted, please reimport your seed phrase" message.

- **`:core:network` module** — OkHttp-based HTTP client with round-robin API failover (ported from web's apiLooper pattern). Retrofit interfaces for Bitpay (BTC), Etherscan (EVM history), CoinGecko (fiat prices). web3j for EVM RPC calls.

- **`:core:btc` module** — BTC balance fetching (Bitpay API), UTXO selection, PSBT construction (bitcoinj), fee estimation (Blockcypher API: slow/normal/fast sat/KB), transaction signing and broadcast.

- **`:core:evm` module** — EVM balance fetching (web3j eth_getBalance), gas estimation (eth_gasPrice + eth_estimateGas), transaction signing (web3j Credentials), ERC20 token transfers (contract.transfer), broadcast.

- **`:feature:dapp-browser` module** — Android WebView with injected JavaScript `window.ethereum` provider. JS-to-Native bridge: single `@JavascriptInterface` method exposing EIP-1193 `request()` only (not per-RPC methods). Origin validation on every bridge call. Rate limit: 10 calls/sec. Implements EIP-1193 methods: eth_requestAccounts, eth_accounts, eth_chainId, eth_sendTransaction, personal_sign, eth_signTypedData_v4, wallet_switchEthereumChain, wallet_addEthereumChain. Does NOT implement eth_sign (deprecated, unsafe — reject with error). Events: accountsChanged, chainChanged. Transaction confirmation dialog: decode common function signatures (transfer, approve, swap) for human-readable display; ERC20 approve() with MAX_UINT256 shows "Unlimited approval" warning. Message signing display: personal_sign shows UTF-8 text when decodable, warns "Message is not human-readable" for binary/hex data; eth_signTypedData_v4 shows structured fields, warns on Permit/Permit2 patterns (spender+value+deadline). wallet_addEthereumChain restricted to allowlisted chain IDs (1, 56, 137) — reject requests for unknown chain IDs with error "Unsupported chain"; NEVER allow overriding RPC URL for already-configured chains. WebView security hardening per Decision 9. Domain policy: known domains navigate freely; unknown domains show interstitial warning. RPC parameter validation: address format, value bounds, data size limits (64KB max calldata), gasLimit >1M → warning, >15M → reject.

- **`:feature:walletconnect` module** — WalletConnect v2 Sign SDK (wallet role). QR scanner via ML Kit. Session management with max 24-hour lifetime (auto-expire and notify user), transaction approval dialogs, session persistence in EncryptedSharedPreferences. Active sessions count shown as badge. Error handling: relay connection failure → show "Failed to connect to WalletConnect relay" with retry button. Session expiry → auto-remove from storage, notify user. Session cleanup: on every app launch, iterate stored sessions and delete any with `createdAt` older than 24 hours; no background job needed. Invalid QR URI → show "Invalid QR code" error. Validate relay server is `relay.walletconnect.com` or `relay.walletconnect.org` only.

- **`:core:auth` module** — BiometricPrompt API for fingerprint/face unlock. App password fallback (bcrypt cost factor 12, 8+ chars). Lockout after 5 failed password attempts with exponential backoff (60s, 120s, 300s; failure counter persisted across app restarts). Devices without biometric hardware → password-only mode (BiometricManager.canAuthenticate() check at startup). Biometric fails 3 times → fallback to app password prompt. Auto-lock: 5-minute inactivity timer (reset on any user interaction); app backgrounded >30 seconds → lock immediately. Re-authentication required to resume.

### How it works

**Wallet creation flow:**
1. User taps "Create Wallet" → `CryptoManager.generateMnemonic()` → 12 BIP39 words via bitcoinj `MnemonicCode`
2. User writes down words → confirms 3 random words (managed by `OnboardingViewModel` in `:app` — retry counter is in-memory StateFlow<Int>). If incorrect → "Incorrect words, try again" (up to 3 attempts). After 3 failed attempts → show all 12 words again, reset retry counter, and restart confirmation flow. Generated keys are NOT preserved during reset — mnemonic stays the same but confirmation restarts from scratch.
3. User creates app password (8+ chars) → bcrypt hash (cost 12) stored in EncryptedSharedPreferences
4. `CryptoManager.deriveKeys(mnemonic)` → BTC key via bitcoinj BIP44 derivation (`m/44'/0'/0'/0/0`), ETH key via web3j `Bip32ECKeyPair` (`m/44'/60'/0'/0/0`)
5. Mnemonic + private keys encrypted → EncryptedSharedPreferences
6. Navigate to Wallet screen

**Balance display:**
1. On pull-to-refresh or screen open → parallel requests:
   - BTC: `GET {bitpay}/address/{addr}/balance/` → satoshis → / 1e8
   - EVM: `eth_getBalance(addr, 'latest')` via web3j per chain → wei → / 1e18
   - Tokens: `balanceOf(addr)` contract call per token → / 10^decimals
   - Fiat: CoinGecko API → USD prices
2. Results displayed immediately as they arrive (no persistent caching). In-memory `StateFlow<WalletUiState>` in `WalletViewModel` retains last successful balances with `lastUpdated: Long` timestamp.
3. Offline mode: if network request fails, retain previous in-memory balances, display "Last updated: {timestamp}", show "No internet connection" error banner, disable Send button. Network restored → auto-refresh on next pull-to-refresh.

**Send transaction (BTC):**
1. Fetch unspents: `GET {bitpay}/address/{addr}/?unspent=true`
2. Fetch fee rates: `GET {blockcypher}/` → high/medium/low_fee_per_kb
3. User selects fee tier → calculate fee: `max(546, feeRate * txSize / 1024)`
4. Build PSBT: fetch raw tx hex per input (nonWitnessUtxo), create outputs (recipient + change)
5. BiometricPrompt → sign all inputs with BTC private key
6. Broadcast: `POST {bitpay}/tx/send` with serialized hex

**Send transaction (EVM):**
1. `eth_gasPrice` via web3j → gas price
2. `eth_estimateGas` for transaction → gas limit (with 1.05x buffer for tokens)
3. User selects fee tier (slow/normal/fast multiplier)
4. BiometricPrompt → sign via web3j `Credentials.signTransaction()`
5. `eth_sendRawTransaction` → tx hash

**dApp browser flow:**
1. WebView loads dApp URL → `window.ethereum` injected via `shouldInterceptRequest()` (inject as first `<script>` in `<head>` before any dApp scripts execute) with `Object.freeze(window.ethereum)` to prevent tampering
2. JS provider uses `@JavascriptInterface` bridge for all RPC requests
3. `eth_requestAccounts` → native dialog "Connect to {domain}?" → return [address]
4. `eth_sendTransaction` → native confirmation dialog with tx details → BiometricPrompt → sign → return txHash
5. `wallet_switchEthereumChain` → update active chain → emit `chainChanged` event to WebView

**WalletConnect flow:**
1. User taps "Scan QR" → ML Kit camera → parse WalletConnect URI
2. WalletConnect Sign SDK `pair(uri)` → session proposal
3. Native dialog "Connect to {dApp}?" → approve with supported chains/methods
4. Session persisted in EncryptedSharedPreferences
5. External dApp sends sign request → native confirmation dialog → sign → return result

## Decisions

### Decision 1: Full native rewrite vs WebView wrapper
**Decision:** Full native Kotlin + Jetpack Compose rewrite
**Rationale:** Marketing value ("faster, native feel"), enables native dApp browser with window.ethereum injection, WalletConnect wallet integration. User explicitly chose native over hybrid.
**Alternatives considered:** Capacitor/TWA wrapping existing React web wallet — rejected because user wants native UI and native dApp browser experience.

### Decision 2: bitcoinj for BTC operations
**Decision:** Use bitcoinj 0.16.3 for BIP39/BIP44 derivation and BTC transaction building
**Rationale:** Mature Java library with BIP39 mnemonic support. Handles P2PKH addresses and HD key derivation natively. Note: web project uses bitcoinjs-lib (JavaScript); bitcoinj (Java) is a new dependency for the Android project, not a port.
**Alternatives considered:** Bitcoin Development Kit (BDK) — more modern, better SegWit/PSBT support, but adds Rust native dependency complexity. bitcoinj is simpler for P2PKH addresses used by the web wallet.

### Decision 3: web3j for EVM operations
**Decision:** Use web3j 4.x for all EVM chain interactions
**Rationale:** Most mature JVM Ethereum library. Supports BIP44 key derivation, transaction signing, contract interaction, RPC calls. Same web3 concepts as web version's web3.js.
**Alternatives considered:** ethers-kt — newer but less mature. Direct JSON-RPC over OkHttp — too low-level, would duplicate what web3j provides.

### Decision 4: Multi-module Gradle project
**Decision:** Split into `:app`, `:core:*`, `:feature:*` modules
**Rationale:** Clean separation of crypto logic (testable without Android), network layer (mockable), and UI. Enables parallel development and focused testing. Standard Android multi-module pattern.
**Alternatives considered:** Single module — simpler but mixes crypto logic with UI, harder to test key derivation without Android instrumentation.

### Decision 5: Hilt for dependency injection
**Decision:** Use Hilt (Dagger-based DI for Android)
**Rationale:** Google-recommended for Jetpack Compose apps. Simplifies ViewModel injection, scoping, and testing. Standard in modern Android development.
**Alternatives considered:** Koin — simpler but no compile-time verification. Manual DI — boilerplate overhead.

### Decision 6: P2PKH addresses for BTC (not SegWit)
**Decision:** Generate P2PKH addresses (starting with `1` on mainnet) matching web wallet behavior
**Rationale:** Web wallet uses `bitcoin.payments.p2pkh({ pubkey })` at path `m/44'/0'/0'/0/0`. Mobile must match exactly for cross-platform compatibility. bitcoinj's `LegacyAddress.fromKey()` produces same P2PKH addresses.
**Alternatives considered:** SegWit (bech32) — better fees but would produce different addresses from web wallet for same mnemonic. Breaks cross-platform compatibility requirement.

### Decision 7: OkHttp with custom failover interceptor
**Decision:** Build API failover on top of OkHttp interceptors, porting the round-robin pattern from web's apiLooper
**Rationale:** Web's apiLooper provides proven failover with request queuing (500ms delay) and endpoint health tracking (in-memory only — resets on app restart, matching web behavior; acceptable because failover triggers quickly after first failed request). OkHttp interceptors allow transparent retry without changing API interface code.
**Alternatives considered:** Retrofit retry adapters — less control over endpoint switching. Ktor — would add second HTTP library alongside OkHttp (web3j already uses OkHttp).

### Decision 8: No persistent data caching
**Decision:** All balances, tx history, and prices fetched on-demand. Only in-memory caching during active session.
**Rationale:** User explicitly requested no caching to avoid cache invalidation bugs. Simplifies architecture for AI maintenance. Acceptable for MVP where fresh data is preferred.
**Alternatives considered:** Room/SQLite for tx history cache — rejected per user requirement.

### Decision 9: WebView security hardening for dApp browser
**Decision:** Disable all non-essential WebView features, whitelist only `https://` scheme, validate RPC parameters from dApps.
**Rationale:** WebView loads untrusted third-party dApp content that has direct access to the injected `window.ethereum` provider. Default WebView settings are insecure (file access enabled, mixed content allowed, geolocation enabled). A compromised or malicious dApp could exploit these to access local storage, inject scripts, or phish users. Strict security defaults minimize attack surface.
**Settings:** `allowFileAccess=false`, `allowContentAccess=false`, `mixedContentMode=MIXED_CONTENT_NEVER_ALLOW`, `geolocationEnabled=false`, `allowFileAccessFromFileURLs=false`, `allowUniversalAccessFromFileURLs=false`, `javaScriptCanOpenWindowsAutomatically=false`, `WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)`. Navigation restricted to `https://` scheme — reject `file://`, `http://`, `data://`, `javascript://` and localhost/private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8). Domain policy: known dApp domains (dex.onout.org, app.aave.com) navigate freely; navigation to unknown/external domains is BLOCKED by default — show "External navigation blocked: {domain}" message. User can add domains to allowlist via Settings. FLAG_SECURE on mnemonic display and seed confirmation screens. App-level `network_security_config.xml` with `cleartextTrafficPermitted=false` to enforce HTTPS for all HTTP clients (OkHttp, web3j, Retrofit).
**JS bridge hardening:** Expose only the EIP-1193 `request()` method via `@JavascriptInterface` (not separate methods per RPC call). Validate `WebView.url` origin on every bridge call — reject if URL has changed from the approved dApp origin. Rate limit: max 10 bridge calls per second, queue excess. Gas thresholds: gasLimit > 1,000,000 → show "High gas limit" warning in confirmation dialog; gasLimit > 15,000,000 → reject request with error. Chain injection protection: wallet_addEthereumChain restricted to allowlisted chain IDs (1, 56, 137); reject unknown chains. Never allow dApp to override RPC URL of already-configured chains. eth_sign method rejected entirely (deprecated, unsafe).

### Decision 10: API keys embedded in APK (MVP accepted risk)
**Decision:** Extract API keys (Etherscan, BSCscan, Infura, etc.) from web config files directly into Kotlin constants. Accept that keys are extractable from decompiled APK.
**Rationale:** These same keys are already publicly visible in the web bundle's JavaScript source. They are free-tier keys with rate limiting. For MVP, the risk of API quota exhaustion is low and does not compromise user funds. Mitigation: client-side rate limiting via apiLooper pattern (500ms request queuing). Post-MVP enhancement: move keys to backend proxy or NDK with obfuscation.
**Alternatives considered:** API key proxy backend — adds server infrastructure cost and complexity, overkill for MVP. NDK obfuscation — delays MVP delivery for marginal security gain on already-public keys.

### Decision 11: Cross-platform address compatibility constraint
**Decision:** Mobile wallet must produce identical BTC and ETH addresses as web wallet for the same mnemonic — this is a hard requirement, not optional.
**Rationale:** Users import existing web wallet mnemonics into the mobile app. If addresses differ, users see "empty" wallets and think funds are lost. This constrains library choice (must support exact BIP44 paths), address format (P2PKH for BTC, not SegWit), and derivation implementation (must use same path depth m/44'/X'/0'/0/0, not m/44'/X'/0'). Verified via unit tests comparing mobile output against known web wallet addresses for reference mnemonics.
**Alternatives considered:** Per-platform derivation paths — rejected because it breaks the core use case of one mnemonic across platforms.

### Decision 12: Auto-lock and session timeout
**Decision:** Auto-lock wallet after 5 minutes of inactivity or 30 seconds in background. Require re-authentication (biometric or password) to resume.
**Rationale:** A crypto wallet left unlocked on an unattended device exposes all funds. Every production crypto wallet (MetaMask, Trust Wallet, Coinbase Wallet) implements auto-lock. The 5-minute timeout balances security with UX during active use. The 30-second background timeout prevents access if the user switches apps and someone else picks up the device.
**Alternatives considered:** No auto-lock (user manually locks) — rejected because users forget. Per-transaction authentication only — insufficient because balance viewing and address display also expose information.

## Data Models

### Kotlin Data Classes

```kotlin
// Wallet identity
data class WalletKeys(
    val mnemonic: List<String>,        // 12 BIP39 words
    val btcPrivateKeyWIF: String,      // BTC WIF format
    val btcAddress: String,            // P2PKH address (1... or m/n...)
    val ethPrivateKeyHex: String,      // 0x-prefixed hex (shared across all EVM)
    val ethAddress: String,            // 0x-prefixed checksummed
)

// Per-chain balance
data class CurrencyBalance(
    val currency: String,              // "BTC", "ETH", "BNB", "MATIC"
    val balance: BigDecimal,           // native units (BTC, ETH, etc.)
    val balanceUsd: BigDecimal?,       // fiat equivalent, null if price unavailable
    val decimals: Int,                 // display precision
)

// Token balance
data class TokenBalance(
    val symbol: String,                // "USDT", "WBTC"
    val contractAddress: String,       // 0x...
    val balance: BigDecimal,
    val decimals: Int,
    val chain: EvmChain,               // ETH, BSC, POLYGON
)

// Transaction record (display)
data class TransactionRecord(
    val hash: String,
    val direction: TxDirection,        // IN, OUT, SELF
    val amount: BigDecimal,
    val fee: BigDecimal,
    val currency: String,
    val timestamp: Long,               // unix epoch seconds
    val confirmations: Int,
    val counterpartyAddress: String,
)

enum class TxDirection { IN, OUT, SELF }

// EVM chain config
data class EvmChainConfig(
    val chain: EvmChain,
    val chainId: Long,                 // 1, 56, 137
    val chainIdHex: String,            // "0x1", "0x38", "0x89"
    val rpcUrl: String,
    val explorerUrl: String,
    val explorerApiUrl: String,
    val explorerApiKey: String,
    val nativeCurrency: String,        // "ETH", "BNB", "MATIC"
    val defaultGasLimit: Long,         // 21000 for native, 100000 for tokens
)

enum class EvmChain { ETH, BSC, POLYGON }

// BTC fee tiers
data class BtcFeeRates(
    val fast: Long,                    // sat/KB
    val normal: Long,
    val slow: Long,
)

// EVM fee options
data class EvmFeeOption(
    val gasPrice: BigInteger,          // wei
    val gasLimit: BigInteger,
    val totalFeeWei: BigInteger,
    val totalFeeNative: BigDecimal,    // in ETH/BNB/MATIC
)

// dApp connection state
data class DAppConnection(
    val origin: String,                // "dex.onout.org"
    val address: String,               // connected wallet address
    val chainId: Long,                 // active chain
    val favicon: String?,              // URL
)

// WalletConnect session
data class WCSession(
    val topic: String,
    val peerName: String,
    val peerUrl: String,
    val peerIcon: String?,
    val chains: List<String>,          // ["eip155:1", "eip155:56"]
    val methods: List<String>,
    val createdAt: Long,
)

// Token config (from web's erc20.js/bep20.js)
data class TokenConfig(
    val symbol: String,
    val address: String,
    val decimals: Int,
    val fullName: String,
    val chain: EvmChain,
)
```

### EncryptedSharedPreferences Keys

| Key | Type | Content |
|-----|------|---------|
| `wallet_mnemonic` | String | Space-separated 12 words |
| `wallet_btc_wif` | String | BTC private key (WIF) |
| `wallet_eth_hex` | String | ETH private key (0x hex) |
| `app_password_hash` | String | bcrypt hash of app password |
| `wc_sessions` | String | JSON array of WCSession |
| `active_chain_id` | Long | Currently selected EVM chain ID |
| `custom_rpc_config` | String | JSON of user-customized RPC URLs |

## Dependencies

### New packages

- `org.bitcoinj:bitcoinj-core:0.16.3` — BIP39 mnemonic, BIP44 derivation, BTC address generation, transaction building
- `org.web3j:core:4.10.3` — EVM RPC, BIP44 ETH derivation, transaction signing, contract interaction
- `com.squareup.okhttp3:okhttp:4.12.0` — HTTP client for API calls (also used by web3j)
- `com.squareup.retrofit2:retrofit:2.9.0` — Type-safe REST client for Bitpay, Etherscan, CoinGecko APIs
- `com.squareup.retrofit2:converter-moshi:2.9.0` — JSON serialization
- `com.squareup.moshi:moshi-kotlin:1.15.0` — JSON parsing
- `com.walletconnect:android-core:1.31.0` — WalletConnect v2 core
- `com.walletconnect:sign:2.28.0` — WalletConnect v2 Sign protocol (wallet role)
- `com.google.dagger:hilt-android:2.50` — Dependency injection
- `androidx.biometric:biometric:1.1.0` — BiometricPrompt for fingerprint/face (stable release)
- `com.google.mlkit:barcode-scanning:17.2.0` — QR code scanning for WalletConnect
- `androidx.camera:camera-camera2:1.3.1` — Camera for QR scanner
- `com.google.firebase:firebase-crashlytics:18.6.0` — Crash reporting
- `org.mindrot:jbcrypt:0.4` — bcrypt for app password hashing
- `androidx.navigation:navigation-compose:2.7.6` — Compose Navigation

### Using existing (from project)

- `src/front/config/mainnet/web3.js` — RPC endpoint URLs (extracted to Kotlin constants)
- `src/front/config/mainnet/api.js` — Bitpay/Etherscan API URLs and keys (extracted to Kotlin constants)
- `src/front/config/mainnet/evmNetworks.js` — Chain IDs, names, explorer URLs (extracted to Kotlin data classes)
- `src/front/config/mainnet/erc20.js`, `bep20.js`, `erc20matic.js` — Default token lists (extracted to Kotlin constants)
- `src/common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS.ts` — Gas limits and prices (extracted to Kotlin constants)
- `src/common/helpers/constants/TRANSACTION.ts` — BTC tx size constants (DUST_SAT=546, P2PKH_IN_SIZE=148, P2PKH_OUT_SIZE=34)

## Testing Strategy

**Feature size:** L

### Unit tests

- **BIP39 mnemonic generation:** generate mnemonic, derive BTC address, verify address is valid P2PKH format AND changes when new mnemonic generated. Verify word count = 12, all words in BIP39 English wordlist.
- **BIP39 mnemonic validation:** valid mnemonic passes, wrong word count fails with specific error, non-wordlist word fails with position indicator, bad checksum fails with checksum error. Test with multiple known BIP39 test vectors (not just "abandon" mnemonic).
- **BIP44 BTC derivation:** known mnemonic → derive key at m/44'/0'/0'/0/0, verify WIF private key AND P2PKH address match web wallet output. Verify m/44'/0'/0'/0/1 produces different address than m/44'/0'/0'/0/0 (path parameter used correctly).
- **BIP44 ETH derivation:** same known mnemonic → verify ETH address matches web wallet output. Verify checksummed address format (EIP-55).
- **Single ETH key across chains:** verify same private key produces same address for ETH, BSC, Polygon — test with 2+ different mnemonics.
- **BTC UTXO selection:** (1) single UTXO, send partial → verify input selected, change output created. (2) Multiple UTXOs → verify correct combination selected. (3) Change < DUST_SAT (546) → verify change added to fee. (4) Insufficient funds → verify error before selection completes.
- **BTC fee calculation:** verify `max(DUST_SAT, feeRate * txSize / 1024)` formula with known inputs including edge cases (minimum fee, high fee).
- **BTC transaction construction:** verify transaction built with correct inputs, outputs. Verify nonWitnessUtxo included per input.
- **EVM gas estimation:** verify gasLimit * gasPrice calculation. Native transfer: estimateGas=21000 → gasLimit=21000 (no buffer). Token transfer: estimateGas=50000 → gasLimit=52500 (1.05x buffer). estimateGas failure → error propagated.
- **ERC20 amount encoding:** verify conversions with real-world values: USDT (6 decimals), WBTC (8 decimals), standard ERC20 (18 decimals). Edge case: 1 wei → 0.000000000000000001 ETH (no rounding).
- **Address validation:** BTC: valid P2PKH passes, invalid fails. EVM: checksummed (EIP-55) passes, lowercase passes with warning "Address checksum invalid, proceed anyway?", invalid checksum (mixed case non-EIP-55) fails. Cross-chain: BTC address in ETH field → error. Edge cases: empty, whitespace, too short/long.
- **Encrypted storage:** write/read cycle preserves data, KeyStore corruption → error handled with "reimport seed" message AND encrypted storage cleared.
- **App password:** bcrypt cost 12 hash verification (check hash prefix `$2a$12$`), 8+ char minimum validation, lockout counter with exponential backoff (60s/120s/300s), persistent failure counter across restarts.
- **Biometric fallback logic:** biometric succeeds → app unlocked. Biometric fails 3 times → password prompt. No biometric hardware (mock BIOMETRIC_ERROR_NO_HARDWARE) → password prompt immediately.
- **Auto-lock:** 5-min inactivity → locked. App backgrounded >30s → locked. User interaction resets timer. Locked state requires re-authentication.
- **Seed confirmation retry:** incorrect words → "try again" message (OnboardingViewModel retry counter). After 3 failures → reset to show all 12 words. Counter is in-memory only.
- **Duplicate submission prevention:** initial state → Send button enabled. User taps Send → state transitions to 'submitting', button disabled. Broadcast succeeds → show tx hash. Broadcast fails → error shown, button re-enabled.
- **CoinGecko fiat prices:** (1) parse API response fixture → correct price extraction for BTC, ETH, BNB, MATIC. (2) balance * price = correct USD value with BigDecimal precision (1.5 BTC * $50000 = $75000.00). (3) API error/timeout → balanceUsd is null, UI displays "N/A". (4) Partial data (some coins missing) → available prices shown, missing show "N/A".
- **Offline mode state:** (1) load balances → state has balances + lastUpdated timestamp. (2) refresh with no network → retain previous balances, show error, Send disabled. (3) network restored → new balances, error cleared, Send re-enabled.
- **WebView URL validation:** https://dex.onout.org → allowed. http://example.com → blocked. file:///exploit.html → blocked. javascript:alert(1) → blocked. data:text/html → blocked. https://127.0.0.1 → blocked (private IP). https://192.168.1.1 → blocked.
- **WebView security settings verification:** instantiate WebView, assert allowFileAccess=false, allowContentAccess=false, mixedContentMode=MIXED_CONTENT_NEVER_ALLOW, geolocationEnabled=false.
- **Gas warning thresholds:** gasLimit=1,000,001 → warning flag true. gasLimit=999,999 → no warning. gasLimit=15,000,001 → reject with error.
- **dApp request queuing:** 3 concurrent eth_sendTransaction → only 1 confirmation shown. Approve first → second appears. Reject second → third appears with error for second.
- **RPC request/response parsing:** verify JSON-RPC request parsing (method name, params extraction) and response serialization (EIP-1193 format). Validate parameter bounds: address format, value < 2^256, data < 64KB, gas < 15M.
- **Balance parsing:** BTC: 100000000 satoshis → 1.00000000 BTC (BigDecimal precision). EVM: "1000000000000000000" wei → 1.0 ETH. Token: 1000000 raw (6 dec) → 1.0 USDT. Edge: 1 wei → 0.000000000000000001 ETH.
- **Tx history parsing:** Blockcypher BTC response → TransactionRecord with correct direction/amount. Etherscan EVM response → TransactionRecord. Verify real API response fixtures.

### Integration tests

- **BTC balance fetch:** call real Bitpay testnet API, verify response parsing
- **EVM balance fetch:** call real Sepolia RPC, verify eth_getBalance response parsing
- **BTC send on testnet:** build + sign + broadcast real testnet transaction, verify tx hash returned
- **EVM send on testnet:** build + sign + broadcast real Sepolia transaction, verify tx hash returned
- **Token balance fetch:** call real testnet token contract balanceOf, verify response
- **API failover:** mock 2 endpoints, first returns 500, verify retry to second succeeds. Measure time between requests → verify ≥500ms delay (request queuing). After A fails, subsequent requests skip A (endpoint health tracking).
- **Etherscan tx history:** call real testnet API, verify transaction list parsing
- **WalletConnect session persistence:** pair with test dApp, approve session → verify stored in EncryptedSharedPreferences. Simulate app restart (clear in-memory state) → verify session restored with correct topic/peerName/chains. Session expiry → verify removed from storage.
- **WebView window.ethereum bridge:** instantiate real WebView, inject JS bridge, call `window.ethereum.request({method: 'eth_requestAccounts'})` from JS, verify native callback invoked, return result to JS, assert JS receives correct response.

### E2E tests (Android instrumented)

- **Create wallet flow:** launch app → Create Wallet → see 12 words → confirm 3 words (test retry on wrong words, reset after 3 failures) → set password (8+ chars) → verify Wallet screen shows addresses
- **Import wallet + cross-platform validation:** launch app → Import Wallet → enter known mnemonic → set password → verify all 4 addresses (BTC/ETH/BSC/MATIC) match web output exactly
- **Send testnet BTC transaction:** Wallet tab → select BTC → Send → enter testnet address + amount → select Normal fee → biometric confirm → verify tx hash displayed → verify tx appears on block explorer
- **dApp browser transaction signing:** navigate to dApps → load dex.onout.org → verify window.ethereum injected → connect wallet → initiate transaction → verify native confirmation dialog shows decoded function → sign
- **WalletConnect session flow:** tap Scan QR → inject test WalletConnect URI via deep-link → verify connection dialog shows peer name → approve → verify session established → receive sign request from test dApp → verify confirmation dialog → approve → verify signature returned
- **Password lockout flow:** enter wrong password 5 times → verify lockout with exponential backoff timer → wait → verify re-enabled → enter correct password → verify unlock

## Agent Verification Plan

**Source:** user-spec "Как проверить" section.

### Verification approach

Agent runs automated tests (unit + integration + E2E). For verification beyond tests, agent builds APK and verifies build success. Cross-platform address validation is automated via unit tests comparing with known web wallet outputs. Manual verification (install on device, visual UI, dApp interaction) is deferred to user.

### Per-task verification

| Task | verify: | What to check |
|------|---------|--------------|
| 1 | bash | `./gradlew assembleDebug` succeeds, APK produced, `network_security_config.xml` present |
| 2 | bash | `./gradlew :core:crypto:test` — BIP39/BIP44 tests pass, known mnemonic → expected addresses |
| 3 | bash | `./gradlew :core:storage:test` — encryption read/write cycle, KeyStore corruption handling |
| 4 | bash | `./gradlew :core:auth:test` — password hash (bcrypt $2a$12$), exponential lockout, biometric fallback, auto-lock timer |
| 5 | bash | `./gradlew :core:network:test` — failover with 500ms queuing, endpoint health tracking, RPC URL validation (HTTPS only, no private IPs) |
| 6 | bash | `./gradlew :core:btc:test` — balance parsing, UTXO selection (multi-input, dust, insufficient), fee calc, testnet broadcast |
| 7 | bash | `./gradlew :core:evm:test` — balance parsing, CoinGecko price parsing, gas estimation (native vs token buffer), signing, Sepolia broadcast |
| 8 | bash + user | `./gradlew :app:testDebugUnitTest :app:lintDebug` passes + user verifies UI layout on device |
| 9 | bash + user | `./gradlew :app:testDebugUnitTest` passes + user verifies send flow on device |
| 10 | bash | `./gradlew :feature:dapp-browser:test` — RPC param validation, origin check, rate limiting, gas threshold warnings, WebView security settings, domain policy |
| 11 | bash | `./gradlew :feature:walletconnect:test` — session lifecycle (24h expiry), relay error handling, URI validation |
| 12 | bash | `./gradlew :core:btc:test :core:evm:test` — tx history parsing with real API response fixtures |
| 13 | bash | `./gradlew assembleRelease` succeeds, verify no secrets in logcat output |
| 14 | bash | `./gradlew test connectedAndroidTest` — all tests green |

### Tools required

- `bash` — Gradle build and test commands
- Android emulator or connected device for instrumented tests
- User manual testing for UI verification (dApp browser, WalletConnect QR scanning)

## Risks

| Risk | Mitigation |
|------|-----------|
| BIP44 derivation mismatch between web and mobile — different addresses for same mnemonic | Unit tests with known mnemonic comparing BTC/ETH addresses against web wallet output. This is P0 test in Task 2. |
| bitcoinj PSBT support limitations — bitcoinj 0.16.3 has basic PSBT support, may not handle all edge cases | Build BTC transactions using bitcoinj's `Transaction` class directly (not PSBT). Fetch raw tx hex per input for nonWitnessUtxo. Fallback: use `SendRequest` API. |
| WalletConnect v2 wallet SDK complexity — wallet role is different from dApp role, documentation may be incomplete | Implement WalletConnect in separate phase (Wave 6). Follow official Kotlin SDK samples. Test with WalletConnect example dApp first. |
| window.ethereum JS injection timing — dApp may check for provider before injection completes | Primary mechanism: `WebViewClient.shouldInterceptRequest()` intercepts main HTML document, injects provider `<script>` as first element in `<head>` before any dApp scripts. `Object.freeze(window.ethereum)` prevents dApp from wrapping/modifying the provider. Fallback: `evaluateJavascript()` in `onPageStarted()`. Verify with test: load HTML that checks `window.ethereum` on DOMContentLoaded. |
| API rate limiting on Bitpay/Etherscan — mobile users may trigger rate limits with frequent pull-to-refresh | Port request queuing pattern from web's apiLooper (500ms delay between requests). Add exponential backoff on 429 responses. |
| Single ETH key for all EVM chains — if derivation differs, addresses won't match web version | Explicit test: derive from known mnemonic, verify single ETH key, verify same address across ETH/BSC/Polygon chain configs. |
| Android OS version fragmentation (minSdk 26 = Android 8.0 through latest) — BiometricPrompt, EncryptedSharedPreferences, and WebView behavior differ across versions | Use AndroidX compat libraries (biometric:1.2.x, security-crypto:1.1.x) which abstract version differences. BiometricPrompt: use `BiometricManager.canAuthenticate()` to check capability before prompting. EncryptedSharedPreferences: AndroidX security-crypto handles KeyStore differences. WebView: use `WebView.setWebContentsDebuggingEnabled(false)` in release. Test on Android 8 and latest emulator images in CI. |
| No root/jailbreak detection (MVP accepted risk) — on rooted devices, EncryptedSharedPreferences can be bypassed via Frida/Xposed, exposing keys | Accepted MVP limitation per user-spec. Post-MVP: add Play Integrity API or rootbeer library check, warn users on rooted devices and disable biometric auth. |
| Single ETH private key shared across all EVM chains — compromise of one key exposes funds on ETH, BSC, and Polygon simultaneously | Accepted architectural constraint for cross-platform compatibility (Decision 11). Mitigated by: strong auth (8+ char password, biometric, auto-lock), EncryptedSharedPreferences. Transaction confirmation clearly shows target chain. |
| No clipboard clearing after seed phrase copy (MVP accepted limitation) | User-spec explicitly defers clipboard clearing. Seed phrase may remain in system clipboard after user copies it during backup. Post-MVP: implement `ClipboardManager.clearPrimaryClip()` with 60-second timer after seed display. |

## Acceptance Criteria

Technical criteria (supplement user-spec criteria):

- [ ] `./gradlew assembleDebug` builds clean APK with no errors
- [ ] `./gradlew assembleRelease` builds signed release APK with ProGuard/R8 (keep rules for bitcoinj, web3j, bouncycastle)
- [ ] All unit tests pass (`./gradlew test`)
- [ ] All integration tests pass (testnet RPC calls succeed)
- [ ] E2E instrumented tests pass (`./gradlew connectedAndroidTest`)
- [ ] Cross-platform validation: import known mnemonic → BTC/ETH/BSC/MATIC addresses match web wallet output exactly
- [ ] APK installs and runs on Android 8.0+ (minSdk 26)
- [ ] Firebase Crashlytics reports crashes — no private keys, mnemonic, or passwords in any log output
- [ ] WebView security: all settings from Decision 9 applied, `WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)`, domain whitelisting active
- [ ] WebView window.ethereum injection works with dex.onout.org (dApp detects provider)
- [ ] JS bridge: origin validation per call, rate limiting (10/sec), single `request()` method exposed
- [ ] Gas thresholds: >1M shows warning, >15M rejected
- [ ] WalletConnect v2 session establishes with relay.walletconnect.com, auto-expires after 24h
- [ ] Auto-lock: wallet locks after 5 min inactivity and 30s in background
- [ ] FLAG_SECURE on mnemonic display and seed confirmation screens
- [ ] `network_security_config.xml` present with `cleartextTrafficPermitted=false`
- [ ] App password minimum 8 characters
- [ ] No hardcoded app name — parameterized via build config for white-label
- [ ] wallet_addEthereumChain rejects unknown chain IDs (only 1, 56, 137 allowed)
- [ ] eth_sign rejected entirely (only personal_sign and eth_signTypedData_v4 supported)
- [ ] window.ethereum injected via shouldInterceptRequest with Object.freeze
- [ ] Domain policy: unknown domains blocked by default, not just warned
- [ ] WalletConnect sessions cleaned up on app launch (expired sessions removed)
- [ ] EIP-55 checksum warning shown for lowercase ETH addresses in send flow

## Implementation Tasks

<!-- Tasks are brief scope descriptions. AC, TDD, and detailed steps are created during task-decomposition. -->

### Wave 1 (Project Scaffold — independent)

#### Task 1: Android Project Setup
- **Description:** Create multi-module Android Gradle project in `android/` directory with all 9 modules. Configure Hilt DI, Compose, all dependencies from Dependencies section, CI workflow, and `network_security_config.xml` with `cleartextTrafficPermitted=false`.
- **Skill:** infrastructure-setup
- **Reviewers:** code-reviewer, security-auditor, infrastructure-reviewer
- **Verify:** bash — `./gradlew assembleDebug` succeeds
- **Files to modify:** `android/build.gradle.kts`, `android/settings.gradle.kts`, `android/app/build.gradle.kts`, `android/core/*/build.gradle.kts`, `android/feature/*/build.gradle.kts`, `android/gradle.properties`
- **Files to read:** none (new project)

### Wave 2 (Core Crypto — depends on Wave 1)

#### Task 2: Crypto Core — BIP39/BIP44 Key Derivation
- **Description:** Implement BIP39 mnemonic generation/validation and BIP44 key derivation for BTC (bitcoinj) and ETH (web3j) in `:core:crypto`. Cross-platform compatibility constraint per Decision 11.
- **Skill:** code-writing
- **Reviewers:** code-reviewer, security-auditor, test-reviewer
- **Verify:** bash — `./gradlew :core:crypto:test` passes, known mnemonic produces expected addresses
- **Files to modify:** `android/core/crypto/`
- **Files to read:** `src/common/utils/mnemonic.ts` (actual derivation: getBtcWallet, getEthLikeWallet), `src/common/helpers/bip44.ts` (path builder)

#### Task 3: Secure Storage + App Password
- **Description:** Implement EncryptedSharedPreferences wrapper in `:core:storage` for wallet keys and app password (bcrypt cost 12, 8+ chars). Handle KeyStore corruption: show "reimport seed" message and clear corrupted storage.
- **Skill:** code-writing
- **Reviewers:** code-reviewer, security-auditor, test-reviewer
- **Verify:** bash — `./gradlew :core:storage:test` passes
- **Files to modify:** `android/core/storage/`
- **Files to read:** `src/front/shared/helpers/constants/privateKeyNames.ts`

### Wave 3 (Infrastructure — depends on Wave 2)

#### Task 4: Biometric Authentication + Auto-lock
- **Description:** Implement BiometricPrompt integration in `:core:auth` with app password fallback, exponential backoff lockout (persisted counter), password-only mode, and auto-lock per Decision 12 (5-min inactivity, 30s background).
- **Skill:** code-writing
- **Reviewers:** code-reviewer, security-auditor, test-reviewer
- **Verify:** bash — `./gradlew :core:auth:test` passes
- **Files to modify:** `android/core/auth/`
- **Files to read:** none (standard Android BiometricPrompt API)

#### Task 5: Network Layer + API Failover
- **Description:** Implement OkHttp-based network layer in `:core:network` with round-robin failover interceptor ported from web's apiLooper. Configure Retrofit interfaces for Bitpay, Etherscan, Blockcypher, CoinGecko. Custom RPC URL validation: HTTPS only, block private IPs, warn user.
- **Skill:** code-writing
- **Reviewers:** code-reviewer, security-auditor, test-reviewer
- **Verify:** bash — `./gradlew :core:network:test` passes
- **Files to modify:** `android/core/network/`
- **Files to read:** `src/common/utils/apiLooper.ts`, `src/front/config/mainnet/api.js`, `src/front/config/mainnet/web3.js`

### Wave 4 (Blockchain Operations — depends on Waves 2+3)

#### Task 6: BTC Operations (Balance + Transactions)
- **Description:** Implement BTC balance fetching (Bitpay), UTXO selection, fee estimation (Blockcypher), transaction construction (bitcoinj), signing, and broadcast. Port algorithm patterns from web's btc.ts per Decision 11.
- **Skill:** code-writing
- **Reviewers:** code-reviewer, security-auditor, test-reviewer
- **Verify:** bash — `./gradlew :core:btc:test` passes (balance parsing, UTXO selection, fee calc, testnet broadcast)
- **Files to modify:** `android/core/btc/`
- **Files to read:** `src/common/utils/coin/btc.ts` (fetchBalance, broadcastTx, prepareRawTx, getFeesRateBlockcypher), `src/common/helpers/constants/TRANSACTION.ts`

#### Task 7: EVM Operations (Balance + Transactions + Fiat)
- **Description:** Implement EVM balance fetching (web3j eth_getBalance), ERC20 token balances (contract balanceOf), CoinGecko fiat prices, gas estimation, transaction signing, and broadcast. No persistent caching.
- **Skill:** code-writing
- **Reviewers:** code-reviewer, security-auditor, test-reviewer
- **Verify:** bash — `./gradlew :core:evm:test` passes (balance parsing, gas estimation, CoinGecko parsing, signing, Sepolia broadcast)
- **Files to modify:** `android/core/evm/`
- **Files to read:** `src/front/shared/redux/actions/ethLikeAction.ts` (fetchBalance), `src/front/shared/redux/actions/erc20LikeAction.ts` (fetchBalance), `src/common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS.ts`

### Wave 5 (UI Shell — depends on Wave 4)

#### Task 8: Wallet UI + Navigation
- **Description:** Implement Compose single-activity architecture with bottom navigation (Wallet / dApps tabs), onboarding flows (create/import with seed confirmation retry per Architecture section), balance list with pull-to-refresh, offline mode state (per Architecture section), and complete Navigation graph with stub screens for Send, History, Settings, dApp Browser. FLAG_SECURE on mnemonic/seed screens.
- **Skill:** code-writing
- **Reviewers:** code-reviewer, test-reviewer
- **Verify:** bash — `./gradlew :app:testDebugUnitTest :app:lintDebug` passes; user — verify UI on device
- **Files to modify:** `android/app/`
- **Files to read:** none (new Compose UI, follow Material3 guidelines)

### Wave 6 (Feature Screens — depends on Wave 5)

Note: Tasks in this wave work on separate modules/packages with no shared file conflicts. Task 8 (Wave 5) sets up the complete navigation graph; these tasks fill in their respective screens.

#### Task 9: Send Transaction UI
- **Description:** Implement send transaction screen with address input validation (EIP-55 checksum warning for lowercase ETH addresses), amount entry, fee tier selector, confirmation dialog with biometric prompt, duplicate submission prevention (disable button during broadcast), and result display.
- **Skill:** code-writing
- **Reviewers:** code-reviewer, security-auditor, test-reviewer
- **Verify:** bash — `./gradlew :app:testDebugUnitTest` passes; user — verify send flow on device
- **Files to modify:** `android/app/` (send package only)
- **Files to read:** `src/core/swap.app/util/typeforce.ts` (address validation patterns)

#### Task 10: dApp Browser + window.ethereum Provider
- **Description:** Implement WebView-based dApp browser in `:feature:dapp-browser` with injected `window.ethereum` EIP-1193 provider, JS-to-Native bridge with origin validation and rate limiting, domain whitelisting, transaction confirmation with function signature decoding, and WebView security hardening per Decision 9.
- **Skill:** code-writing
- **Reviewers:** code-reviewer, security-auditor, test-reviewer
- **Verify:** bash — `./gradlew :feature:dapp-browser:test` passes
- **Files to modify:** `android/feature/dapp-browser/`
- **Files to read:** `src/common/web3connect/providers/InjectedProvider.ts`, `src/common/web3connect/index.ts`

#### Task 11: WalletConnect v2 Integration
- **Description:** Implement WalletConnect v2 wallet-side SDK integration in `:feature:walletconnect` with QR scanner, session management (24h max lifetime), transaction signing, and relay error handling.
- **Skill:** code-writing
- **Reviewers:** code-reviewer, security-auditor, test-reviewer
- **Verify:** bash — `./gradlew :feature:walletconnect:test` passes
- **Files to modify:** `android/feature/walletconnect/`
- **Files to read:** `src/common/web3connect/providers/WalletConnectProviderV2.ts`

### Wave 7 (History + Polish — depends on Wave 6)

Note: Task 12 works on core modules + app/history/ package. Task 13 works on app/settings/ package and build config. No file overlap.

#### Task 12: Transaction History
- **Description:** Implement tx history fetching and display using Blockcypher (BTC) and Etherscan (EVM) APIs. Parse transaction direction and merge data sources. Depends on Tasks 6 and 7 for core module structure.
- **Skill:** code-writing
- **Reviewers:** code-reviewer, test-reviewer
- **Verify:** bash — `./gradlew :core:btc:test :core:evm:test` passes (response parsing tests)
- **Files to modify:** `android/core/btc/`, `android/core/evm/`, `android/app/` (history package only)
- **Files to read:** `src/common/utils/coin/btc.ts` (getTransactionBlocyper), `src/front/shared/redux/actions/ethLikeAction.ts` (getTransaction)

#### Task 13: Settings, White-label, Crashlytics
- **Description:** Implement Settings screen (custom RPC URLs with HTTPS/private-IP validation, network selector), white-label support (parameterized app name/applicationId), and Firebase Crashlytics with secret-safe logging policy.
- **Skill:** code-writing
- **Reviewers:** code-reviewer, infrastructure-reviewer
- **Verify:** bash — `./gradlew assembleRelease` succeeds, verify no secrets in logcat output
- **Files to modify:** `android/app/` (settings package + build config)
- **Files to read:** `src/front/config/mainnet/evmNetworks.js`, `src/front/externalConfigs/mainnet-default.js`

### Wave 8 (Final — depends on all previous)

#### Task 14: Pre-deploy QA
- **Description:** Run all tests (unit + integration + E2E), verify acceptance criteria from user-spec and tech-spec, build release APK.
- **Skill:** pre-deploy-qa
- **Reviewers:** none
- **Verify:** bash — `./gradlew test connectedAndroidTest` all green, `./gradlew assembleRelease` produces APK
- **Files to modify:** none (QA task)
- **Files to read:** `android/` (all modules for test execution)
