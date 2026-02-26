# Code Research: native-mobile-wallet

Created: 2026-02-26

---

## 1. Entry Points

### Web App Authentication Flow

**`/root/MultiCurrencyWallet/src/front/shared/redux/actions/user.ts`**
Central user sign-in orchestrator. The `sign()` function (line 75) initializes wallet auth for all chains from a single BIP39 mnemonic stored in localStorage under key `twentywords`. Flow:
1. Read or generate 12-word mnemonic from localStorage
2. Generate Shamir's secret sharing backup (SLIP39, 2-of-3 threshold)
3. Derive BTC private key via `actions.btc.login(btcPrivateKey, mnemonic)`
4. Derive ETH private key (shared across all EVM chains) via `actions[evmKey].login(ethPrivateKey, mnemonic)`
5. Derive GHOST, NEXT keys similarly
6. Initialize BTC multisig variants (2FA, PIN, manual)
7. Login with ERC20/BEP20 tokens using the ETH key

Key signature: `const sign = async () => { ... }`

**`/root/MultiCurrencyWallet/src/front/shared/redux/actions/btc.ts`**
BTC-specific actions: auth, login, send, balance, transaction history. Uses `bitcoinjs-lib` for key pair creation and `common/utils/coin/btc` for transaction building.

Key signatures:
- `const login = (privateKey, mnemonic) => { ... }` (line 79)
- `const send = (params) => { ... }` (line 323) -- builds PSBT, signs, broadcasts
- `const auth = (privateKey) => { ... }` (line 46) -- creates ECPair from WIF

**`/root/MultiCurrencyWallet/src/front/shared/redux/actions/ethLikeAction.ts`**
Base class for all EVM chain actions. Handles login, balance, send, transaction history for ETH, BNB, MATIC, ARBETH, and 10+ other EVM chains.

Key signatures:
- `login = (privateKey, mnemonic = '') => { ... }` (line 178) -- uses Web3.eth.accounts.privateKeyToAccount
- `send = async (params) => { ... }` (line 409) -- signs via Web3.eth.accounts.signTransaction, supports MetaMask path
- `fetchBalance = (address) => { ... }` (line 118) -- Web3.eth.getBalance

**`/root/MultiCurrencyWallet/src/front/shared/redux/actions/erc20LikeAction.ts`**
Base class for all ERC20-like token actions. Extends the EVM pattern for token-specific operations.

Key signatures:
- `class Erc20LikeAction { ... }` (line 23)
- `send = async (params) => { ... }` (line 473) -- tokenContract.methods.transfer().send()
- `approve = async (params) => { ... }` (line 589)

---

## 2. Data Layer

### Key Management (Mnemonic / HD Wallet)

**`/root/MultiCurrencyWallet/src/common/utils/mnemonic.ts`**
Central mnemonic utility shared between front-end and swap core. Implements BIP39/BIP32/BIP44 derivation for all supported chains.

Key functions:
- `getRandomMnemonicWords()` -- calls `bip39.generateMnemonic()`, returns 12-word English mnemonic
- `validateMnemonicWords(mnemonic)` -- BIP39 validation
- `getBtcWallet(network, mnemonic, walletNumber, path)` -- derives BTC wallet at `m/44'/0'/0'/0/{walletNumber}` using bip32+bitcoinjs-lib
- `getEthLikeWallet({ mnemonic, walletNumber, path })` -- derives ETH wallet at `m/44'/60'/0'/0/{walletNumber}` using ethereumjs-wallet hdkey
- `getGhostWallet(network, mnemonic, ...)` -- same path as BTC: `m/44'/0'/0'/0/{n}`
- `getNextWallet(network, mnemonic, ...)` -- custom path: `m/44'/707'/0'/0/{n}`
- `splitMnemonicToSecretParts(mnemonic)` -- SLIP39 Shamir's Secret Sharing (2-of-3)
- `restoryMnemonicFromSecretParts(secretParts)` -- recover from 2 of 3 shares

Dependencies: `bip39@^3.0.2`, `bip32@^2.0.6`, `bitcoinjs-lib@5.1.6`, `ethereumjs-wallet@^1.0.1`

### BIP44 Derivation Paths

**`/root/MultiCurrencyWallet/src/common/helpers/bip44.ts`**
Utility that creates derivation paths from network config: `m/44'/{coinIndex}'/0'/0/{addressIndex}`

Paths used across the codebase:
| Chain | BIP44 Path | Coin Index |
|-------|-----------|------------|
| BTC | `m/44'/0'/0'/0/0` | 0 |
| ETH (all EVM) | `m/44'/60'/0'/0/0` | 60 |
| GHOST | `m/44'/0'/0'/0/0` | 0 (same as BTC) |
| NEXT | `m/44'/707'/0'/0/0` | 707 |

### Key Storage (Web)

**`/root/MultiCurrencyWallet/src/front/shared/helpers/constants/privateKeyNames.ts`**
Defines localStorage keys for all private keys. Pattern: `{ENTRY}:{chain}:privateKey`

Keys stored in localStorage (plaintext -- no encryption in web version):
- `{ENTRY}:eth:privateKey` -- shared across ALL EVM chains
- `{ENTRY}:btc:privateKey` -- BTC WIF format
- `{ENTRY}:ghost:privateKey`, `{ENTRY}:next:privateKey`
- `{ENTRY}:twentywords` -- the master 12-word mnemonic
- `{ENTRY}:shamirsMnemonics` -- SLIP39 shares (JSON)
- `{ENTRY}:shamirsSecrets` -- SLIP39 numeric secrets (JSON)
- Various multisig keys

**Critical finding for mobile:** Web version stores private keys in plaintext localStorage. Mobile apps MUST use platform-native encrypted storage (Android EncryptedSharedPreferences / iOS Keychain).

### Swap Core Auth

**`/root/MultiCurrencyWallet/src/core/swap.auth/btc.ts`**
Swap engine BTC authentication. Uses same mnemonic utilities. Key functions: `login(privateKey, app)`, `loginMnemonic(mnemonic, walletNumber, path, app)`.

**`/root/MultiCurrencyWallet/src/core/swap.auth/eth.ts`**
Swap engine ETH authentication. Same pattern as BTC auth but uses Web3 accounts.

---

## 3. Similar Features (Existing Mobile Code)

### Android MVP -- Feature Branch `feat/android-ci-workflow`

Android code exists on the `feat/android-ci-workflow` branch (commits `ab4fc9696` and `a6392f637`), NOT on `master`. The files are not present in the current working tree.

**Status:** Scaffold MVP with wallet generation and import. No balance fetching, no transaction sending, no WebView, no dApp browser.

#### Files (from branch, not on master):

**`android/app/build.gradle.kts`**
Jetpack Compose app targeting SDK 34, minSdk 26, Java 17. Dependencies:
- Compose BOM 2024.06.00, Material3
- `androidx.security:security-crypto:1.1.0-alpha06` (EncryptedSharedPreferences)
- `org.bitcoinj:bitcoinj-core:0.16.3` (mnemonic generation)
- JUnit 4.13.2, Espresso

**`android/app/src/main/kotlin/com/swaponline/wallet/wallet/WalletGenerator.kt`**
Generates and imports 12-word wallets using bitcoinj. Only derives master key (no BIP44 path derivation for specific chains yet). Functions:
- `generateWallet()` -- 128-bit entropy -> 12 words -> master private key hex
- `importWallet(phrase: String)` -- validates 12 words, derives same master key
- `deriveFromMnemonicWords(words)` -- uses `HDKeyDerivation.createMasterPrivateKey(seed)` (no chain-specific derivation)

**`android/app/src/main/kotlin/com/swaponline/wallet/wallet/WalletStorage.kt`**
Encrypted storage using `EncryptedSharedPreferences` with AES-256-GCM. Stores mnemonic words and private key hex. Functions: `save(snapshot)`, `load(): StoredWallet?`.

**`android/app/src/main/kotlin/com/swaponline/wallet/wallet/WalletSnapshot.kt`**
Data class: `data class WalletSnapshot(val mnemonicWords: List<String>, val privateKeyHex: String)`

**`android/app/src/main/kotlin/com/swaponline/wallet/ui/WalletApp.kt`**
Jetpack Compose UI with create wallet, load saved, import by phrase. Single-screen MVP.

**`android/app/src/main/kotlin/com/swaponline/wallet/ui/WalletViewModel.kt`**
MVVM with StateFlow. Functions: `createAndSaveWallet()`, `loadSavedWallet()`, `importAndSaveWallet()`, `updateImportPhrase()`.

**`android/app/src/test/kotlin/com/swaponline/wallet/wallet/WalletGeneratorTest.kt`**
3 unit tests: generate returns 12 words + 64-char hex key, import is deterministic, rejects wrong word count.

#### CI Workflow

**`.github/workflows/android-ci.yml`**
GitHub Actions: detect project, JDK 17, Gradle build, unit tests, APK artifact upload. Triggers on `android/**` changes.

### iOS Code

No iOS code exists anywhere in the repository. No Swift files, no Xcode project, no iOS-related commits.

---

## 4. Integration Points

### Blockchain RPC Configuration

**`/root/MultiCurrencyWallet/src/front/config/testnet/web3.js`** and **`/root/MultiCurrencyWallet/src/front/config/mainnet/web3.js`**
RPC endpoints for all chains. Mobile apps will need these same endpoints.

Mainnet RPC endpoints:
| Chain | RPC URL |
|-------|---------|
| ETH | `https://mainnet.infura.io/v3/{INFURA_API_KEY}` |
| BNB/BSC | `https://bsc-dataseed.binance.org/` |
| Polygon | `https://polygon-bor-rpc.publicnode.com` |
| Arbitrum | `https://arb1.arbitrum.io/rpc` |
| Avalanche | `https://api.avax.network/ext/bc/C/rpc` |
| Fantom | `https://rpc.ftm.tools` |
| Gnosis/xDai | `https://rpc.gnosischain.com` |

### BTC API Endpoints

**`/root/MultiCurrencyWallet/src/front/config/testnet/api.js`** and **`/root/MultiCurrencyWallet/src/front/config/mainnet/api.js`**
BTC uses Bitpay/Bitcore API for balance, unspents, broadcast:
- Testnet: `https://api.bitcore.io/api/BTC/testnet`
- Mainnet: Bitpay servers (array for failover)
- Blockcypher: `https://api.blockcypher.com/v1/btc/test3` (testnet)

Explorer APIs for EVM tx history: Etherscan, BscScan, PolygonScan, etc. with per-chain API keys.

### EVM Network Registry

**`/root/MultiCurrencyWallet/src/front/config/testnet/evmNetworks.js`**
Full EVM network definitions with chainId, networkVersion, RPC URLs, and block explorer URLs. 15 networks defined. Mobile apps need this same registry for chain switching.

### Config System

**`/root/MultiCurrencyWallet/src/front/local_modules/app-config/index.js`**
Reads `process.env.CONFIG` (e.g., `testnet.dev`), loads matching config file from `src/front/config/`, deep-merges with `default.js` via `lodash.merge`. Web-specific (uses Node.js `require` and `path`).

**For mobile:** Cannot reuse directly. Mobile apps need a native config system. The config data (RPC URLs, chain IDs, API keys, contract addresses) can be extracted into a shared JSON format.

### External Config (White-label)

**`/root/MultiCurrencyWallet/src/front/externalConfigs/mainnet-default.js`**
Window-global based config for white-label: `window.buildOptions` (curEnabled, blockchainSwapEnabled, defaultExchangePair), `window.widgetEvmLikeTokens` (custom tokens).

**For mobile:** White-label config can be adapted as a build-time JSON config file per variant (app name, enabled chains, custom tokens, branding).

---

## 5. Existing Tests

### Unit Tests

**`/root/MultiCurrencyWallet/tests/unit/btcSend.test.ts`**
Jest-based BTC send/transaction test. Tests balance fetching, transaction info parsing, fee calculation. Uses `btcUtils` from `common/utils/coin/btc` and `actions.btc`. Custom matcher: `toBeWithinRange`.

Framework: Jest. Runner: `npm run test:unit`. Pattern: direct import of utils + redux actions, no mocks for network calls (integration-style).

### Core Tests

**`/root/MultiCurrencyWallet/src/core/tests/`**
Test files: `Pair.test.ts`, `btcSwap.test.ts`, `ethSwap.test.ts`, `swap.test.ts`, `index.test.ts`.
Setup: `setupSwapApp.ts`, Fixtures: `fixtures/unspents.ts`.
Runner: `npm run core:test`.

Representative signatures:
```
// tests/unit/btcSend.test.ts
const fetchTxInfo = async (txHash, isMultisign, serviceFee, iteration) => { ... }

// src/core/tests/btcSwap.test.ts (fixture-based swap testing)
```

### E2E Tests

Runner: `npm run test:e2e_swap` (Puppeteer). Tests atomic swap flows end-to-end.

### Android Tests

**`android/app/src/test/.../WalletGeneratorTest.kt`** (on feature branch only)
3 JUnit tests: wallet generation, deterministic import, validation.

---

## 6. Shared Utilities

### Reusable for Mobile (logic, not code)

**`/root/MultiCurrencyWallet/src/common/utils/mnemonic.ts`**
All mnemonic and HD derivation logic. Pattern and derivation paths are directly portable to native implementations.

**`/root/MultiCurrencyWallet/src/common/utils/coin/btc.ts`**
BTC transaction utilities: `fetchBalance`, `fetchUnspents`, `prepareFees`, `prepareRawTx`, `broadcastTx`, `fetchTx`, `fetchTxInfo`, `getTransactionBlocyper`. Contains UTXO selection, PSBT construction, fee calculation. The algorithm patterns (UTXO selection, PSBT building) are portable.

Key constants: `DUST = 546` (minimum output value in satoshis).

**`/root/MultiCurrencyWallet/src/common/helpers/ethLikeHelper.ts`**
Gas estimation, fee calculation, contract instantiation for all EVM chains. Instantiated per-chain with different Web3 providers and default parameters.

**`/root/MultiCurrencyWallet/src/common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS.ts`**
Gas limits and prices for all chains. Contains `evmLike`, `arbeth`, `aureth`, `phi`, `fkw`, `phpx` parameter sets with `limit.send`, `limit.contractInteract`, `price.fast`, `price.normal`, `price.slow`.

**`/root/MultiCurrencyWallet/src/common/helpers/bip44.ts`**
BIP44 path construction from network settings.

**`/root/MultiCurrencyWallet/src/common/utils/apiLooper.ts`**
API request wrapper with failover across multiple servers, caching, query queuing, and rate limiting. Pattern is useful for mobile API layer design.

---

## 7. Potential Problems

### Key Storage Security
Web version stores private keys and mnemonic in **plaintext localStorage** (`privateKeyNames.ts`). The Android MVP already addresses this with `EncryptedSharedPreferences` (AES-256-GCM). iOS must use Keychain Services. This is the single most critical security difference between web and mobile.

### BIP44 Path Mismatch Risk
The Android `WalletGenerator.kt` currently uses `HDKeyDerivation.createMasterPrivateKey(seed)` which only derives the master key, NOT chain-specific keys via BIP44 paths. The web version uses full derivation (`m/44'/0'/0'/0/0` for BTC, `m/44'/60'/0'/0/0` for ETH). Mobile must implement matching derivation paths to generate the same addresses from the same mnemonic.

### Single ETH Key for All EVM Chains
Web version uses ONE Ethereum private key (`privateKeyNames.eth`) for ALL EVM chains (ETH, BNB, MATIC, ARBETH, etc.). Mobile must replicate this pattern -- same key, different chain configurations.

### UTXO Handling Complexity
BTC transaction building in `common/utils/coin/btc.ts` involves complex UTXO selection, fee estimation (via API), PSBT construction with nonWitnessUtxo. This requires raw transaction hex fetching per input. Must be carefully implemented in native code.

### API Dependencies
Multiple external API services required:
- Bitpay/Bitcore for BTC (balance, unspents, broadcast, raw tx)
- Blockcypher for BTC (tx history)
- Etherscan/BscScan/PolygonScan for EVM tx history (each needs API key)
- Infura for ETH RPC
- Chain-specific public RPCs

Mobile apps need API key management. Some keys are hardcoded in config files (Etherscan API keys, WalletConnect project ID, Infura key).

### No Backend -- Fully Client-Side
The wallet is entirely client-side. There is no backend server for user accounts, key backup, or transaction relay. Mobile apps must also be self-contained. The only server-side components are the P2P swap signaling server (`star.wpmix.net`) and various blockchain APIs.

---

## 8. Constraints & Infrastructure

### Library Versions (Web)

| Library | Version | Purpose |
|---------|---------|---------|
| bitcoinjs-lib | 5.1.6 | BTC transactions (PSBT, key pairs, addresses) |
| bip39 | ^3.0.2 | BIP39 mnemonic generation/validation |
| bip32 | ^2.0.6 | BIP32 HD key derivation |
| ethereumjs-wallet | ^1.0.1 | ETH HD wallet derivation (hdkey) |
| web3 | ^1.10.4 | EVM blockchain interaction |
| bignumber.js | (latest) | Precise crypto arithmetic |
| @walletconnect/client | ^1.3.3 | WalletConnect v1 (in dependencies) |
| @web3-react/core | ^8.2.0 | Web3 React hooks |
| @web3-react/walletconnect-v2 | ^8.3.7 | WalletConnect v2 connector |
| @web3-react/injected-connector | 6.0.7 | MetaMask/injected wallet |
| @web3-react/walletconnect-connector | 6.2.8 | WalletConnect v1 connector |

### Android Dependencies (Existing MVP)

| Library | Version | Purpose |
|---------|---------|---------|
| bitcoinj-core | 0.16.3 | Mnemonic generation, HD key derivation |
| security-crypto | 1.1.0-alpha06 | EncryptedSharedPreferences |
| Compose BOM | 2024.06.00 | Jetpack Compose UI |
| Material3 | (from BOM) | Material Design 3 |

### Native Library Equivalents Needed

| Web Library | Android | iOS (Swift) |
|-------------|---------|-------------|
| bip39/bip32 | bitcoinj-core 0.16.3 (already used) | BitcoinKit / CryptoSwift + custom |
| bitcoinjs-lib | bitcoinj-core (PSBT support limited) | BitcoinDevKit (BDK) |
| web3.js | web3j / ethers-kt | web3swift / ethers-swift |
| ethereumjs-wallet | web3j key derivation | web3swift key derivation |
| bignumber.js | java.math.BigDecimal | Foundation Decimal |

### CI/CD

Android CI exists on feature branch (`.github/workflows/android-ci.yml`): JDK 17, Gradle, assembleDebug + unit tests + APK artifact upload.

No iOS CI workflow exists.

### Build Targets

- Android: compileSdk 34, targetSdk 34, minSdk 26 (Android 8.0)
- iOS: Not started. Recommended min: iOS 16.

---

## 9. window.ethereum / WalletConnect Implementation

### InjectedProvider (window.ethereum consumer)

**`/root/MultiCurrencyWallet/src/common/web3connect/providers/InjectedProvider.ts`**
Extends `InjectedConnector` from `@web3-react/injected-connector@6.0.7`. Detects MetaMask, Trust Wallet, Opera Crypto Wallet, Liquality via `window.ethereum` property flags (`isMetaMask`, `isTrust`, `isLiquality`).

Methods: `isConnected()`, `Connect()` (calls `super.activate()`), `Disconnect()`.

The web app is a **consumer** of `window.ethereum`, not a provider. It connects to external wallets (MetaMask, etc.) that inject `window.ethereum`.

**For mobile dApp browser:** The mobile app would need to **inject** a `window.ethereum` provider into WebView for dApp compatibility. This is the reverse of what the web app does. The existing `InjectedProvider.ts` does not help directly -- it's a consumer, not a provider implementation.

### InjectedType Detection

**`/root/MultiCurrencyWallet/src/common/web3connect/providers/InjectedType.ts`**
Enum of wallet types: NONE, UNKNOWN, OPERA, METAMASK, TRUST, LIQUALITY.

### Web3Connect Orchestrator

**`/root/MultiCurrencyWallet/src/common/web3connect/index.ts`**
EventEmitter-based manager. Handles provider lifecycle: connect, disconnect, account changes, chain changes. Caches provider name in `localStorage('WEB3CONNECT:PROVIDER')`.

Key events: `connected`, `disconnect`, `accountChange`, `chainChanged`, `updated`.

For mobile: These same events would be needed for a mobile WebView dApp browser.

### WalletConnect

**Versions present:**
1. **WalletConnect v1** -- `@walletconnect/client@^1.3.3` in dependencies, `WalletConnectProvider.ts` extends `@web3-react/walletconnect-connector@6.2.8`
2. **WalletConnect v2** -- `@web3-react/walletconnect-v2@^8.3.7`, `WalletConnectProviderV2.ts` uses `@web3-react/core@^8.2.0`

**Currently active: V2.** In `providers/index.ts` (line 25), the `WALLETCONNECT` provider key instantiates `WalletConnectProviderV2`, not V1. Uses `config.api.WalletConnectProjectId` (`a23677c4af3139b4eccb52981f76ad94`).

**For mobile:** WalletConnect v2 SDK exists for both iOS (Swift) and Android (Kotlin). The mobile app would use WalletConnect as a **wallet** (responding to dApp requests), not as a dApp (initiating connections). This is the opposite role from the web app.

---

## 10. Config System Analysis for Mobile White-Label

### Web Config Architecture

**`/root/MultiCurrencyWallet/src/front/local_modules/app-config/index.js`**
Build-time config resolution: `CONFIG` env var selects file from `src/front/config/`, merged with `default.js`. Not reusable in mobile (Node.js `require`, `path`).

**`/root/MultiCurrencyWallet/src/front/config/default.js`**
Contains: paths, HTTP config, i18n settings, Uniswap V3 contract addresses per chain (ETH mainnet, Sepolia testnet, BSC, Polygon, Arbitrum).

**`/root/MultiCurrencyWallet/src/front/config/testnet/index.js`** / **`mainnet/index.js`**
Network-specific: web3 RPC URLs, API endpoints/keys, token configs, swap contracts, fee rates, EVM network definitions.

### Extractable Config Data for Mobile

1. **RPC URLs** (`web3.js`) -- per-chain JSON-RPC endpoints
2. **API endpoints** (`api.js`) -- Bitpay, Etherscan, etc. with API keys
3. **EVM network registry** (`evmNetworks.js`) -- chain IDs, names, RPC URLs, explorers
4. **Token configs** (`erc20.js`, `bep20.js`, etc.) -- token addresses, decimals, symbols
5. **Swap contracts** (`swapContract.js`) -- HTLC contract addresses
6. **Uniswap V3 contracts** (`default.js` lines 44-80) -- factory, quoter, router per chain
7. **Fee rates** (`feeRates.js`)

### White-Label Strategy for Mobile

The web version uses `window.buildOptions` and `window.widgetEvmLikeTokens` for per-deployment customization. Mobile equivalent: build-time config JSON files per white-label variant, containing:
- App name, branding
- Enabled chains (`curEnabled`)
- Custom tokens
- Exchange pairs
- Feature flags

---

## 11. Dependencies Needed for Native Apps

### Android (Kotlin) -- Additions to Existing MVP

| Category | Library | Purpose |
|----------|---------|---------|
| BTC | bitcoinj-core 0.16.3 | Already present. Needs BIP44 path derivation |
| EVM | web3j 4.x | Ethereum/EVM interaction, signing, contract calls |
| Networking | OkHttp / Ktor | API calls to Bitpay, Etherscan, etc. |
| JSON | kotlinx-serialization or Moshi | Config and API response parsing |
| WalletConnect | com.walletconnect:android-core + sign | WalletConnect v2 wallet SDK |
| Security | androidx.security:security-crypto | Already present. EncryptedSharedPreferences |
| Biometrics | androidx.biometric:biometric | Fingerprint/face unlock for key access |
| QR | zxing / ML Kit | Address QR codes |
| Navigation | Compose Navigation | Multi-screen navigation |

### iOS (Swift) -- New Project

| Category | Library | Purpose |
|----------|---------|---------|
| BTC | BitcoinDevKit (BDK-Swift) | BTC wallet, PSBT, UTXO management |
| Mnemonic | swift-bip39 or BDK built-in | BIP39 mnemonic generation |
| EVM | web3swift or ethers-swift | Ethereum/EVM interaction |
| Networking | URLSession / Alamofire | API calls |
| WalletConnect | WalletConnectSwiftV2 | WalletConnect v2 wallet SDK |
| Security | Keychain Services (native) | Encrypted key storage |
| Biometrics | LocalAuthentication (native) | Face ID / Touch ID |
| QR | AVFoundation (native) | Camera QR scanning |
| UI | SwiftUI | Native UI framework |

---

## 12. Integration Risks

### Risk 1: BIP44 Path Derivation Mismatch
The Android MVP derives only the master key from seed, not chain-specific keys. The web app uses specific BIP44 paths. If mobile uses different derivation, users cannot share wallets between web and mobile. **Severity: Critical.**

### Risk 2: UTXO Transaction Building Complexity
BTC send requires: fetch unspents from Bitpay API, calculate fees (with admin fee logic), build PSBT with nonWitnessUtxo raw hex per input, sign all inputs, broadcast. The web implementation (`common/utils/coin/btc.ts`, ~1300 lines) handles many edge cases. Incomplete reimplementation risks fund loss.

### Risk 3: Multi-Chain Single Key Pattern
All EVM chains share one private key. Must be carefully replicated. If mobile creates separate keys per chain, addresses will differ from web version.

### Risk 4: API Rate Limiting and Failover
Web uses `apiLooper` with multi-server failover and request queuing. Mobile must implement equivalent reliability, especially for Bitpay API (which is critical for BTC operations).

### Risk 5: WalletConnect Role Reversal
Web app uses WalletConnect as a dApp (connecting TO wallets). Mobile app would use WalletConnect as a wallet (ACCEPTING connections from dApps). These are different SDK implementations and different protocol flows.

### Risk 6: No Shared Code Between Platforms
Web (TypeScript), Android (Kotlin), and iOS (Swift) share zero runtime code. All crypto logic, API clients, and business rules must be implemented three times. Consider Kotlin Multiplatform for shared Android/iOS logic.

---

## Updated: 2026-02-26 -- Implementation-Level Deep Dive

---

## 13. BTC Transaction Building Algorithm

**Source:** `/root/MultiCurrencyWallet/src/common/utils/coin/btc.ts` (1281 lines)

### Constants

- `DUST = 546` -- minimum output value in satoshis. Any change output below this is discarded (not added to PSBT).
- `DUST_SAT = 546` (from `/root/MultiCurrencyWallet/src/common/helpers/constants/TRANSACTION.ts`) -- used as minimum fee floor.

### Full Send Flow (called from `/root/MultiCurrencyWallet/src/front/shared/redux/actions/btc.ts` `send()` at line 323)

**Step 1: Get private key**
```
privateKey = getPrivateKeyByAddress(from)  // retrieves WIF from Redux state
```

**Step 2: Prepare fees** -- `bitcoinUtils.prepareFees()`

Function signature: `prepareFees({ amount, serviceFee, feeValue, speed, method, from, to, NETWORK })`

Sub-steps:
1. If `feeValue` is not provided, call `estimateFeeValue()` to calculate it (in satoshis).
2. Fetch all UTXOs via `fetchUnspents({ address: from, NETWORK })`.
3. Calculate total needed: `amount_btc * 1e8 + feeValue + adminFee` (converted back to BTC for `prepareUnspents`).
4. Call `prepareUnspents({ unspents, amount })` to select the optimal UTXO set.
5. Calculate:
   - `fundValue` = amount in satoshis (integer)
   - `totalUnspent` = sum of all selected UTXO satoshis
   - `skipValue` = totalUnspent - fundValue - feeValue - adminFee (this is the change)
   - `feeFromAmount` = admin fee in satoshis (percentage of amount, with minimum floor)

Returns: `{ fundValue, skipValue, feeFromAmount, unspents }`

**Step 3: Build raw transaction** -- `bitcoinUtils.prepareRawTx()`

Function signature: `prepareRawTx({ from, to, fundValue, skipValue, serviceFee, feeFromAmount, method, unspents, privateKey, publicKeys, network, NETWORK })`

Sub-steps:
1. Create PSBT: `new bitcoin.Psbt({ network })`
2. Add recipient output: `psbt.addOutput({ address: to, value: fundValue })`
3. If `skipValue > 546` (above dust), add change output: `psbt.addOutput({ address: from, value: skipValue })`
4. If `serviceFee` exists, add admin fee output: `psbt.addOutput({ address: serviceFee.address, value: feeFromAmount })`
5. Create key pair from WIF: `bitcoin.ECPair.fromWIF(privateKey, network)`
6. For each unspent input (single-sig path, `method != 'send_2fa'` and `!= 'send_multisig'`):
   a. Fetch raw transaction hex: `fetchTxRaw({ txId: txid, cacheResponse: 5000, NETWORK })` -- calls Blockcypher API `GET /txs/{txId}?includeHex=true`, extracts `.hex` field
   b. Add input to PSBT: `psbt.addInput({ hash: txid, index: vout, nonWitnessUtxo: Buffer.from(rawTx, 'hex') })`
7. Sign all inputs: `psbt.signAllInputs(keyPair)`
8. Finalize: `psbt.finalizeAllInputs()`
9. Extract hex: `psbt.extractTransaction().toHex()`

**Step 4: Broadcast** -- `bitcoinUtils.broadcastTx()`

Function signature: `broadcastTx({ txRaw, apiBitpay, apiBlocyper, onBroadcastError, NETWORK })`

Sub-steps:
1. Try Bitpay first: `POST /tx/send` with body `{ rawTx: txRaw }`
2. If Bitpay returns `{ txid }`, resolve with txid.
3. If Bitpay fails, fallback to Blockcypher: `POST /txs/push` with body `{ tx: txRaw }`
4. Blockcypher returns `{ tx: { hash } }` on success.
5. Handle `Conflict` status (double-spend) as rejection.

### UTXO Selection Algorithm -- `prepareUnspents()`

Function signature: `prepareUnspents({ amount, unspents }): Promise<IBtcUnspent[]>`

Algorithm:
1. Calculate `needAmount = amount * 1e8 + DUST` (546 satoshis buffer).
2. Sort all unspents ascending by `satoshis` value.
3. **Single-UTXO optimization:** Scan sorted list for the smallest single UTXO with `satoshis >= needAmount`. If found, use only that one UTXO.
4. **Multi-UTXO fallback:** If no single UTXO suffices, accumulate from smallest to largest until cumulative sum >= needAmount.

### Fee Calculation Formula -- `estimateFeeValue()`

```
feeRate = fetchFromBlockcypher() || defaultRate[speed]  // satoshi per kilobyte
txSize = calculateTxSize({ txIn, txOut, method, fixed, toAddress, serviceFee, address })
fee = max(DUST_SAT, (feeRate * txSize) / 1024)  // rounded half-even
```

Where `txSize` for standard send: `txIn * P2PKH_IN_SIZE + txOut * P2PKH_OUT_SIZE + (TX_SIZE + txIn - txOut)`.

Default sizes from TRANSACTION constants (all in bytes):
- `P2PKH_IN_SIZE = 148`, `P2PKH_OUT_SIZE = 34`, `TX_SIZE = 15`
- Default send size: `226 bytes` (1 input, 2 outputs)

### Admin (Service) Fee Calculation

If `serviceFee` is configured:
```
adminFee = max(serviceFee.min, amount * serviceFee.fee / 100)
adminFee_satoshis = adminFee * 1e8 (integer)
```
This adds a third output to the transaction.

### IBtcUnspent Interface

```typescript
interface IBtcUnspent {
  address: string
  amount: number       // BTC (satoshis / 1e8)
  confirmations: number
  height: number
  satoshis: number     // raw satoshi value
  scriptPubKey: string
  txid: string
  vout: number
  spentTxid: string
}
```

### nonWitnessUtxo Requirement

Every PSBT input requires `nonWitnessUtxo` -- the full raw hex of the previous transaction (not just the output script). This is fetched from Blockcypher API: `GET /txs/{txId}?includeHex=true`. The `.hex` field contains the full serialized transaction. This is critical for Kotlin reimplementation -- bitcoinj PSBT support requires the same data.

---

## 14. EVM Transaction Construction

**Source:** `/root/MultiCurrencyWallet/src/front/shared/redux/actions/ethLikeAction.ts` class `EthLikeAction`, `send()` method at line 409.

### Send Flow

Function signature: `send = async ({ to, amount, amountInWei, gasLimit, speed, data, waitReceipt, estimateGas })`

**Step 1: Resolve gas price**
```
gasPrice = params.gasPrice || ethLikeHelper[tickerKey].estimateGasPrice({ speed })
```
`estimateGasPrice()` (from `/root/MultiCurrencyWallet/src/common/helpers/ethLikeHelper.ts`):
1. If chain has `price_fixed` (e.g., PHI network), return that value.
2. Otherwise call `web3.eth.getGasPrice()` (JSON-RPC `eth_gasPrice`).
3. If RPC result > `defaultParams.price.fast`, use RPC result. Otherwise use `defaultParams.price.fast`.
4. On error, fallback to `defaultParams.price.fast`.

**Step 2: Determine gas limit**
```
recipientIsContract = await this.isContract(to)  // web3.eth.getCode(to) != '0x'
defaultGasLimit = recipientIsContract
  ? DEFAULT_CURRENCY_PARAMETERS[key].limit.contractInteract  // 200_000 for evmLike
  : DEFAULT_CURRENCY_PARAMETERS[key].limit.send              // 21_000 for evmLike
```

**Step 3: Build transaction data object**
```
txData = {
  data: data || undefined,
  from: Web3.utils.toChecksumAddress(ownerAddress),
  to: to.trim(),
  gasPrice: gasPrice,
  value: amountInWei ? amount : Web3.utils.toHex(Web3.utils.toWei(String(amount), 'ether')),
}
```

**Step 4: Estimate gas (if no custom gasLimit)**
```
limit = await web3.eth.estimateGas(txData)
gas = '0x' + BigNumber(limit * 1.05).toFixed(0).toString(16)  // 5% buffer
```
If `estimateGas` returns an Error (transaction would fail), that Error is returned to caller.
If result is not a valid hex gas limit, use `defaultGasLimit`.

**Step 5: Sign transaction (non-MetaMask path)**
```
signedData = await Web3.eth.accounts.signTransaction(txData, privateKey)
rawTransaction = signedData.rawTransaction
```

**Step 6: Broadcast**
```
Web3.eth.sendSignedTransaction(rawTransaction)
  .on('transactionHash', (hash) => resolve({ transactionHash: hash }))
  .on('receipt', (receipt) => { /* send admin fee if configured */ })
  .on('error', (error) => reject(error))
```

### Nonce Management

The web implementation does NOT explicitly manage nonces. It relies on `web3.eth.sendSignedTransaction()` which internally uses `eth_getTransactionCount` to set the nonce. For mobile, this means: call `eth_getTransactionCount(address, 'pending')` before signing.

### Error Handling Pattern

- Gas estimation failure: returns the Error object directly (caller checks `result instanceof Error`).
- Transaction rejection by user (MetaMask): caught via regex match on `Denied transaction` or `Cancelled`.
- Network errors: rejected promise propagated to caller.

### Admin Fee (After Main TX)

If `adminFeeObj` is configured and wallet is not MetaMask, a separate transaction is sent after the main TX receipt to the admin address. This is a separate transaction, not part of the main TX.

---

## 15. ERC20 Token Transfer

**Source:** `/root/MultiCurrencyWallet/src/front/shared/redux/actions/erc20LikeAction.ts` class `Erc20LikeAction`, `send()` method at line 473.

### Send Flow

Function signature: `send = async ({ name, from, to, amount, ...feeConfig })`

**Step 1: Get token info**
```
{ tokenContract, decimals } = this.returnTokenInfo(name)
// tokenContract = new web3.eth.Contract(TokenAbi, contractAddress, { from: address })
```
`TokenAbi` is imported from `human-standard-token-abi` (ERC20 ABI).

**Step 2: Calculate amount with decimals**
```
hexAmountWithDecimals = BigNumber(amount).multipliedBy(10 ** decimals).toString(16)
```

**Step 3: Fetch gas price**
```
feeResult = await this.fetchFees({ ...feeConfig })
// gasPrice from ethLikeHelper[currencyKey].estimateGasPrice()
// gasLimit from DEFAULT_CURRENCY_PARAMETERS.evmLikeToken.limit.send (100_000)
```

**Step 4: Estimate gas for token transfer**
```
gasLimitCalculated = await tokenContract.methods
  .transfer(to, '0x' + hexAmountWithDecimals)
  .estimateGas({ gas: '0x00', gasPrice: feeResult.gasPrice, from })

gasLimitWithBuffer = BigNumber(gasLimitCalculated * 1.05).toFixed(0).toString(16)
```

**Step 5: Execute transfer**
```
tokenContract.methods
  .transfer(to, '0x' + hexAmountWithDecimals)
  .send({ gas: '0x' + gasLimitWithBuffer, gasPrice: feeResult.gasPrice, from })
  .on('transactionHash', (hash) => resolve({ transactionHash: hash }))
  .on('receipt', () => { /* send admin fee if configured */ })
  .on('error', (error) => reject(error))
```

### Approve Pattern

Function signature: `approve = async ({ name, to, amount })`

```
hexWeiAmount = BigNumber(amount).multipliedBy(10 ** decimals).toString(16)
tokenContract.methods.approve(to, '0x' + hexWeiAmount).send(feeResult)
```
Used for swap operations, not for regular transfers. The `setAllowance()` method checks current allowance before calling approve.

### Token Balance Fetching

```
contract = new Web3.eth.Contract(TokenAbi, contractAddress)
result = await contract.methods.balanceOf(address).call()
balance = BigNumber(result).dividedBy(BigNumber(10).pow(decimals)).toNumber()
```

### Default Gas Limits for Tokens

From `DEFAULT_CURRENCY_PARAMETERS.evmLikeToken`:
- `limit.send = 100_000` (100k gas for token transfer)
- `limit.swap = 300_000`
- `limit.swapDeposit = 170_000`
- `limit.swapWithdraw = 100_000`

Exception: Aurora tokens use `DEFAULT_CURRENCY_PARAMETERS.aurethToken`:
- `limit.send = 200_000`

---

## 16. Balance Fetching Patterns

### BTC Balance

**Source:** `/root/MultiCurrencyWallet/src/common/utils/coin/btc.ts` `fetchBalance()`

API call: `GET {bitpayServer}/address/{address}/balance/`

- Mainnet servers: `['https://api.bitcore.io/api/BTC/mainnet']`
- Testnet servers: `['https://api.bitcore.io/api/BTC/testnet']`

Response format:
```json
{
  "balance": 150000,      // confirmed balance in satoshis
  "unconfirmed": 0        // unconfirmed balance in satoshis
}
```

Conversion: `balance_btc = balance_satoshis / 1e8`

Options: `{ withUnconfirmed: true }` returns object `{ balance, unconfirmed }`, otherwise returns just the balance number.

Cache: 500ms delay between queries (via `inQuery`).

### EVM Balance (ETH/BNB/MATIC)

**Source:** `/root/MultiCurrencyWallet/src/front/shared/redux/actions/ethLikeAction.ts` `fetchBalance()`

RPC call: `Web3.eth.getBalance(address)` -- which is JSON-RPC `eth_getBalance(address, 'latest')`

Returns balance in wei (string). Converted: `Web3.utils.fromWei(result)` -> number in ETH/BNB/MATIC.

The `getBalance()` method adds 30-second in-memory cache via `cacheStorageGet/Set`.

### ERC20 Token Balance

**Source:** `/root/MultiCurrencyWallet/src/front/shared/redux/actions/erc20LikeAction.ts` `fetchBalance()`

Contract call: `tokenContract.methods.balanceOf(address).call()`

Returns raw integer. Converted: `BigNumber(result).dividedBy(BigNumber(10).pow(decimals)).toNumber()`

Same 30-second in-memory cache pattern.

### Summary Table for Mobile Implementation

| Currency | Method | Endpoint/Call | Response Unit | Conversion |
|----------|--------|---------------|---------------|------------|
| BTC | HTTP GET | `{bitpay}/address/{addr}/balance/` | satoshis (int) | / 1e8 |
| ETH | JSON-RPC | `eth_getBalance(addr, 'latest')` | wei (hex string) | / 1e18 |
| BNB | JSON-RPC | `eth_getBalance(addr, 'latest')` | wei (hex string) | / 1e18 |
| MATIC | JSON-RPC | `eth_getBalance(addr, 'latest')` | wei (hex string) | / 1e18 |
| ERC20 | Contract call | `balanceOf(addr)` on token contract | raw int | / 10^decimals |
| BEP20 | Contract call | `balanceOf(addr)` on token contract | raw int | / 10^decimals |
| ERC20-MATIC | Contract call | `balanceOf(addr)` on token contract | raw int | / 10^decimals |

---

## 17. Transaction History

### BTC Transaction History

**Source:** `/root/MultiCurrencyWallet/src/common/utils/coin/btc.ts` `getTransactionBlocyper()`

API call: `GET {blockcypher}/addrs/{address}/full?txlimit=1000000`

- Mainnet: `https://api.blockcypher.com/v1/btc/main`
- Testnet: `https://api.blockcypher.com/v1/btc/test3`

Response format (Blockcypher full address endpoint):
```json
{
  "txs": [
    {
      "hash": "abc123...",
      "confirmations": 6,
      "confirmed": "2024-01-15T10:30:00Z",
      "received": "2024-01-15T10:25:00Z",
      "fees": 2250,
      "inputs": [
        { "addresses": ["1A1zP1..."], "output_value": 50000 }
      ],
      "outputs": [
        { "addresses": ["1BvBM..."], "value": 47750 }
      ]
    }
  ]
}
```

Transformation logic:
1. Check if our address appears in inputs -> direction = `out`, otherwise `in`.
2. If all outputs go to our address -> direction = `self` (self-transfer, value = fees only).
3. Value for `in` = output value where address matches ours.
4. Value for `out` = output value where address does NOT match ours.
5. All values converted from satoshis to BTC (/ 1e8).
6. Date: parse ISO timestamp from `confirmed` (or `received` if unconfirmed).

Cache: 10 seconds.

### EVM Transaction History

**Source:** `/root/MultiCurrencyWallet/src/front/shared/redux/actions/ethLikeAction.ts` `getTransaction()`

Two API calls (Etherscan-compatible API):
1. Internal transactions: `?module=account&action=txlistinternal&address={addr}&startblock=0&endblock=99999999&sort=asc&apikey={key}`
2. Normal transactions: `?module=account&action=txlist&address={addr}&startblock=0&endblock=99999999&sort=asc&apikey={key}`

For V2 API (mainnet, using unified Etherscan V2): prefix is `&` instead of `?` because base URL already has `?chainid=X`.

Mainnet API URLs:
| Chain | API Base URL |
|-------|-------------|
| ETH | `https://api.etherscan.io/v2/api?chainid=1` |
| BNB | `https://api.etherscan.io/v2/api?chainid=56` |
| MATIC | `https://api.etherscan.io/v2/api?chainid=137` |
| ARBETH | `https://api.etherscan.io/v2/api?chainid=42161` |

Response format (Etherscan):
```json
{
  "result": [
    {
      "hash": "0xabc...",
      "from": "0x123...",
      "to": "0x456...",
      "value": "1000000000000000000",
      "gas": "21000",
      "gasPrice": "20000000000",
      "timeStamp": "1705312200",
      "confirmations": "100",
      "blockHash": "0xdef..."
    }
  ]
}
```

Transformation: `value` converted from wei via `Web3.utils.fromWei()`. Direction determined by comparing `item.to` with user address (case-insensitive). Internal transactions merged by hash (wrapped coin unwrap detection).

### ERC20 Token Transaction History

**Source:** `/root/MultiCurrencyWallet/src/front/shared/redux/actions/erc20LikeAction.ts` `getTransaction()`

API call: `?module=account&action=tokentx&contractaddress={contractAddr}&address={addr}&startblock=0&endblock=99999999&sort=asc&apikey={key}`

Response includes `tokenDecimal` field per transaction. Value conversion: `BigNumber(item.value).dividedBy(BigNumber(10).pow(item.tokenDecimal)).toNumber()`.

Cache: 30 seconds.

### No Pagination

Neither BTC nor EVM history implementations use pagination. BTC uses `txlimit=1000000`. Etherscan returns all transactions. For mobile MVP (no caching requirement), this is acceptable but may be slow for addresses with thousands of transactions.

---

## 18. Fee Estimation

### BTC Fee Estimation

**Source:** `/root/MultiCurrencyWallet/src/common/utils/coin/btc.ts`

**Fee rate source:** Blockcypher API root endpoint `GET {blockcypher_base}/`

Response:
```json
{
  "high_fee_per_kb": 30000,
  "medium_fee_per_kb": 15000,
  "low_fee_per_kb": 5000
}
```

Values are in satoshis per kilobyte.

Speed mapping:
| Speed | Blockcypher field | Default fallback (sat/KB) |
|-------|-------------------|---------------------------|
| fast | `high_fee_per_kb` | 30000 |
| normal | `medium_fee_per_kb` | 15000 |
| slow | `low_fee_per_kb` | 5000 |

Cache: 10 minutes (`cacheResponse: 10*60*1000`), with `cacheOnFail: true` (serve stale cache if API is down).

**Fee calculation formula:**
```
fee_satoshis = max(546, (feeRate_per_kb * txSize_bytes) / 1024)
fee_btc = fee_satoshis * 1e-8
```

Default transaction sizes:
- `send`: 226 bytes
- `swap`: 400 bytes

Transaction size constants (`/root/MultiCurrencyWallet/src/common/helpers/constants/TRANSACTION.ts`):
```
DUST_SAT = 546
TX_SIZE = 15 (overhead)
P2PKH_IN_SIZE = 148
P2PKH_OUT_SIZE = 34
```

Dynamic size formula: `txIn * P2PKH_IN_SIZE + txOut * P2PKH_OUT_SIZE + (TX_SIZE + txIn - txOut)`

### EVM Fee Estimation

**Source:** `/root/MultiCurrencyWallet/src/common/helpers/ethLikeHelper.ts`

**Gas price source:** `web3.eth.getGasPrice()` (JSON-RPC `eth_gasPrice`)

Logic: Use max(rpc_gas_price, default_fast_price).

Default gas prices (`DEFAULT_CURRENCY_PARAMETERS`):
| Chain key | slow | normal | fast |
|-----------|------|--------|------|
| evmLike (ETH/BNB/MATIC/etc) | 0.1 Gwei (1e8) | 1 Gwei (1e9) | 2 Gwei (2e9) |
| arbeth | 0.1 Gwei (1e7) | 1 Gwei (1e8) | 2 Gwei (2e8) |
| aureth | 0.01 Gwei (1e6) | 0.1 Gwei (1e7) | 0.2 Gwei (2e7) |

Default gas limits:
| Operation | evmLike | arbeth | Token (evmLikeToken) |
|-----------|---------|--------|----------------------|
| send | 21,000 | 700,000 | 100,000 |
| contractInteract | 200,000 | 10,000,000 | - |
| swap | 70,000 | 4,000,000 | 300,000 |

**Fee value formula:**
```
fee_wei = gasLimit * gasPrice
fee_eth = fee_wei * 1e-18
```

For token transfers, actual gas is estimated via `tokenContract.methods.transfer(...).estimateGas()` with a 1.05x multiplier.

### Fee Rates Config File

**Source:** `/root/MultiCurrencyWallet/src/front/config/mainnet/feeRates.js`

Contains Etherscan proxy URLs for gas price oracle (alternative to RPC):
```
eth: 'https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_gasPrice&apikey=...'
bsc: 'https://api.etherscan.io/v2/api?chainid=56&module=proxy&action=eth_gasPrice&apikey=...'
matic: 'https://api.etherscan.io/v2/api?chainid=137&module=proxy&action=eth_gasPrice&apikey=...'
btc: 'https://wiki.swaponline.io/blockcyper.php'
```

These are NOT used by the main fee estimation code (which uses RPC directly) but are available as alternative sources.

---

## 19. Address Validation

**Source:** `/root/MultiCurrencyWallet/src/core/swap.app/util/typeforce.ts`

### EVM Address Validation

```typescript
const EVM_ADDRESS_REGEXP = /^0x[A-Fa-f0-9]{40}$/
const isEvmAddress = (value) => typeof value === 'string' && EVM_ADDRESS_REGEXP.test(value)
```

Used for: ETH, BNB, MATIC, ARBETH, AURETH, XDAI, FTM, AVAX, MOVR, ONE, AME, PHI, FKW, PHPX.

Note: This validates format only, NOT EIP-55 checksum. The web app uses `Web3.utils.toChecksumAddress()` when constructing transactions but does NOT reject non-checksummed addresses at validation time.

### BTC Address Validation

**Basic format validation (typeforce):**
```typescript
[constants.COINS.btc]: (value) => typeof value === 'string' && /^[A-Za-z0-9]{26,35}$/.test(value)
```

**Full validation (btc.ts `addressIsCorrect()`):**
```typescript
const addressIsCorrect = (address) => {
  try {
    let outputScript = bitcoin.address.toOutputScript(address, btc.network)
    if (outputScript) return true
  } catch (e) {}
  return false
}
```
This uses `bitcoinjs-lib` to validate address decoding (supports P2PKH, P2SH, and bech32). If `toOutputScript` throws, the address is invalid.

### BTC Address Type Detection

**Source:** `/root/MultiCurrencyWallet/src/common/utils/coin/btc.ts` `getAddressType()`

```
Prefix 'bc' or 'tb' -> bech32 decode -> P2WPKH (20 bytes) or P2WSH (32 bytes)
Otherwise -> base58 decode -> version byte lookup:
  0x00 -> P2PKH mainnet
  0x6f -> P2PKH testnet
  0x05 -> P2SH mainnet
  0xc4 -> P2SH testnet
```

The address type affects transaction size calculation (different input sizes per type).

### For Kotlin Reimplementation

BTC: bitcoinj `Address.fromString(networkParameters, addressString)` throws on invalid addresses. Supports P2PKH, P2SH, and SegWit (bech32).

EVM: Simple regex `^0x[0-9a-fA-F]{40}$`. For EIP-55 checksum validation, use web3j `Keys.toChecksumAddress()` and compare.

---

## 20. API Failover Pattern

**Source:** `/root/MultiCurrencyWallet/src/common/utils/apiLooper.ts` (209 lines)

### Architecture

Uses a priority queue of server endpoints with automatic failover.

**Underlying HTTP client:** `/root/MultiCurrencyWallet/src/common/utils/request.ts` -- wraps `superagent` with response caching.

### Data Structures

- `apiStatuses[apiName]` -- tracks per-API-group status:
  - `endpoints`: map of URL -> `{ url, lastCheck, online }`
  - `prior`: ordered array of URLs (priority queue)
  - `last`: last URL in the list (sentinel for "all tried")

- `apiQuery[queryName]` -- request queues per API group (for rate limiting)

### Failover Algorithm

1. `initApiStatus(name, servers)`: Initialize endpoint list from config array. All marked `online: true`.
2. On request, use `prior[0]` (first in priority array) as current endpoint.
3. If request succeeds:
   - If `checkStatus` function is provided, call it on the response. If it returns `false`, treat as failure.
   - Otherwise resolve with response.
4. If request fails (HTTP error or checkStatus returns false):
   - Call `switchNext(apiName)`:
     - Shift first URL to end of `prior` array (round-robin).
     - Mark shifted URL as `online: false`.
     - If the shifted URL was the `last` URL (sentinel), return `false` (all endpoints exhausted).
   - If `switchNext` returned `true`, retry with next endpoint (`doRequest()` recursion).
   - If `switchNext` returned `false`, reject with `'All endpoints of api is offline'`.

### Request Queuing

If `options.inQuery` is specified:
1. Initialize a named queue (`apiQuery[queryName]`).
2. Push request to queue.
3. A timer processes one request at a time with `delay` ms between requests (default 500ms for both bitpay and blockcypher).
4. This prevents API rate limiting by serializing requests per API group.

### Response Caching

Built into `/root/MultiCurrencyWallet/src/common/utils/request.ts`:
- `responseCacheStorage[cacheKey]` stores `{ cacheResponse (TTL ms), cacheResponseCreateTime, resData, res }`.
- Cache key: `{method}-{endpoint}`.
- On request, check cache first. If valid (within TTL), return cached response immediately.
- `cacheOnFail: true` option: not implemented in request.ts but used in apiLooper calls (Blockcypher fee rates).

### HTTP Client Details

`superagent` with defaults:
- Response timeout: 5000ms
- Deadline timeout: 60000ms

### For Kotlin Reimplementation

The mobile app needs:
1. A list of server URLs per API group (BTC has 1 Bitpay URL, but could have more).
2. Round-robin failover: try next server on failure.
3. Request serialization per API group (500ms delay between requests).
4. In-memory response cache with TTL.
5. Use OkHttp with interceptors for retry logic.

---

## 21. Mnemonic to Address -- Full Derivation Chain

### BTC: Mnemonic -> Address

**Source:** `/root/MultiCurrencyWallet/src/common/utils/mnemonic.ts` `getBtcWallet()`

Step-by-step:
1. **Normalize mnemonic:** `convertMnemonicToValid(mnemonic)` -- trim, lowercase, split by space, filter empty, rejoin. This handles extra whitespace.
2. **Mnemonic to seed:** `bip39.mnemonicToSeedSync(mnemonic)` -- PBKDF2 with 2048 iterations, produces 64-byte seed.
3. **Seed to root key:** `bip32.fromSeed(seed, network)` -- creates BIP32 root node. `network` is `bitcoin.networks.bitcoin` (mainnet) or `bitcoin.networks.testnet`.
4. **Derive child node:** `root.derivePath("m/44'/0'/0'/0/0")` -- BIP44 path for BTC, wallet index 0.
5. **Public key to address:** `bitcoin.payments.p2pkh({ pubkey: node.publicKey, network })` -- produces P2PKH address (starts with `1` on mainnet, `m` or `n` on testnet).
6. **Export WIF:** `node.toWIF()` -- Wallet Import Format private key.

Libraries: `bip39@3.x`, `bip32@2.x`, `bitcoinjs-lib@5.1.6`.

Return value:
```
{ mnemonic, address, publicKey (hex), WIF, node, account }
```

**For Kotlin:** bitcoinj equivalents:
```kotlin
val mnemonic = words.joinToString(" ").trim().lowercase()
val seed = MnemonicCode.toSeed(words, "")  // passphrase empty
val masterKey = HDKeyDerivation.createMasterPrivateKey(seed)
val key = masterKey
  .derive(ChildNumber(44, true))
  .derive(ChildNumber(0, true))
  .derive(ChildNumber(0, true))
  .derive(ChildNumber(0, false))
  .derive(ChildNumber(0, false))
val address = LegacyAddress.fromKey(networkParams, key).toString()
```

### ETH: Mnemonic -> Address

**Source:** `/root/MultiCurrencyWallet/src/common/utils/mnemonic.ts` `getEthLikeWallet()`

Step-by-step:
1. **Normalize mnemonic:** Same `convertMnemonicToValid()`.
2. **Mnemonic to seed:** `bip39.mnemonicToSeedSync(validMnemonic)` -- same 64-byte seed.
3. **Seed to HD wallet:** `hdkey.fromMasterSeed(seed)` -- uses `ethereumjs-wallet` hdkey module.
4. **Derive child:** `hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet()` -- BIP44 path for ETH.
5. **Get address:** `'0x' + wallet.getAddress().toString('hex')` -- keccak256 of public key, take last 20 bytes.
6. **Get private key:** `'0x' + wallet.getPrivateKey().toString('hex')`.

Libraries: `bip39@3.x`, `ethereumjs-wallet@1.x` (hdkey submodule).

Return value:
```
{ mnemonic, address (0x-prefixed), publicKey (0x-prefixed hex), privateKey (0x-prefixed hex), wallet }
```

**Critical:** The same ETH private key is used for ALL EVM chains (ETH, BNB, MATIC, etc.). Only the RPC endpoint and chain ID differ.

**For Kotlin:** web3j equivalents:
```kotlin
val mnemonic = words.joinToString(" ").trim().lowercase()
val seed = MnemonicUtils.generateSeed(mnemonic, "")
val masterKeypair = Bip32ECKeyPair.generateKeyPair(seed)
val path = intArrayOf(
  44 or HARDENED_BIT, 60 or HARDENED_BIT, 0 or HARDENED_BIT, 0, 0
)
val childKeypair = Bip32ECKeyPair.deriveKeyPair(masterKeypair, path)
val credentials = Credentials.create(childKeypair)
val address = credentials.address  // 0x-prefixed, checksummed
```

### Cross-Platform Validation

For the same mnemonic `"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"`:
- BTC mainnet address should match between web `getBtcWallet(bitcoin.networks.bitcoin, mnemonic)` and Kotlin derivation.
- ETH address should match between web `getEthLikeWallet({ mnemonic })` and Kotlin derivation.

This is the critical unit test for mobile wallet compatibility.

---

## 22. Token List / Registry

### Default Token Configuration

Tokens are defined in per-standard config files under `/root/MultiCurrencyWallet/src/front/config/mainnet/`.

**ERC20 (Ethereum):** `/root/MultiCurrencyWallet/src/front/config/mainnet/erc20.js`
```javascript
{
  swap: { address: '0x14a52cf6B4F68431bd5D9524E4fcD6F41ce4ADe9', decimals: 18, fullName: 'SWAP', canSwap: true },
  pay:  { address: '0x1fe72034da777ef22533eaa6dd7cbe1d80be50fa', decimals: 18, fullName: 'PayAccept', canSwap: false },
  usdt: { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6, fullName: 'Tether', canSwap: false },
  wbtc: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', decimals: 8, fullName: 'Wrapped Bitcoin', canSwap: true },
  // ... snm, eurs, xeur
}
```

**BEP20 (BSC):** `/root/MultiCurrencyWallet/src/front/config/mainnet/bep20.js`
```javascript
{
  swap: { address: '0x92648e4537cdfa1ee743a244465a31aa034b1ce8', decimals: 18, fullName: 'SWAP', canSwap: true },
  btcb: { address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', decimals: 18, fullName: 'BTCB Token', canSwap: true },
}
```

**ERC20-MATIC (Polygon):** `/root/MultiCurrencyWallet/src/front/config/mainnet/erc20matic.js`
```javascript
{
  wbtc: { address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', decimals: 8, fullName: 'Wrapped Bitcoin', canSwap: true },
}
```

Additional token config files exist for: `erc20xdai`, `erc20ftm`, `erc20avax`, `erc20movr`, `erc20one`, `erc20ame`, `erc20aurora`.

### Token Config Structure

Each token entry:
```
{
  address: string,   // contract address (checksummed or lowercase)
  decimals: number,  // token decimals (6 for USDT, 18 for most, 8 for WBTC)
  fullName: string,  // display name
  canSwap: boolean,  // whether atomic swap is supported for this token
}
```

### Custom Token Support

**Source:** `/root/MultiCurrencyWallet/src/front/shared/redux/actions/erc20LikeAction.ts` `addToken()` and `getCustomTokensConfig()`

Custom tokens stored in `localStorage` under key `customToken`:
```json
{
  "mainnet": {
    "erc20": {
      "0x...": { "address": "0x...", "symbol": "FOO", "decimals": 18, "baseCurrency": "eth", "standard": "erc20" }
    },
    "bep20": {},
    "erc20matic": {}
  },
  "testnet": { ... }
}
```

The `getInfoAboutToken(contractAddress)` method can fetch token metadata (name, symbol, decimals) directly from the contract by calling `name()`, `symbol()`, `decimals()`.

### Token Standards Registry

**Source:** `/root/MultiCurrencyWallet/src/front/shared/helpers/constants/TOKEN_STANDARDS.ts`

Maps standard names to metadata:
| Standard | Platform | Base Currency | CoinGecko Key |
|----------|----------|---------------|---------------|
| erc20 | ethereum | eth | ethereum |
| bep20 | binance smart chain | bnb | binance-smart-chain |
| erc20matic | polygon | matic | polygon-pos |
| erc20xdai | xdai | xdai | xdai |
| erc20avax | avalanche | avax | avalanche |
| erc20movr | moonriver | movr | moonriver |
| erc20one | harmony | one | harmony-shard-0 |
| erc20aurora | aurora | aureth | aurora |
| erc20ame | amechain | ame | (none) |

### For Mobile MVP

For the MVP scope (ETH/BSC/Polygon only), the mobile app needs:
1. Default token list: hardcoded from `erc20.js`, `bep20.js`, `erc20matic.js`.
2. Custom token support: user enters contract address, app calls `name()`, `symbol()`, `decimals()` on the contract, stores result in EncryptedSharedPreferences.
3. Token key format used in web: `{baseCurrency}tokenname` (e.g., `{eth}usdt`, `{bnb}swap`).

---

## 23. EVM Network Registry for Mobile

**Source:** `/root/MultiCurrencyWallet/src/front/config/mainnet/evmNetworks.js`

Networks relevant to MVP scope:

| Chain | chainId (hex) | networkVersion (int) | RPC URL | Explorer |
|-------|---------------|----------------------|---------|----------|
| ETH | 0x1 | 1 | `https://mainnet.infura.io/v3/{INFURA_KEY}` | etherscan.io |
| BNB | 0x38 | 56 | `https://bsc-dataseed.binance.org/` | bscscan.com |
| MATIC | 0x89 | 137 | `https://polygon-bor-rpc.publicnode.com` | polygonscan.com |

Testnet equivalents:
| Chain | RPC URL |
|-------|---------|
| ETH (Sepolia) | `https://sepolia.infura.io/v3/{INFURA_KEY}` |
| BNB (testnet) | `https://data-seed-prebsc-1-s1.binance.org:8545/` |
| MATIC (testnet) | `https://polygon-testnet.public.blastapi.io` |

API keys needed:
- Infura: `fdd4494101ed4a28b41bb66d7fe9c692`
- Etherscan V2: `GK6YHJ5NMEF67R4FTRNQS2EK3HRBP5VVHW`
- WalletConnect: `a23677c4af3139b4eccb52981f76ad94`

---

## 24. Key Files to Modify / Port for Kotlin Implementation

Summary of exact source files whose logic must be reimplemented:

| Priority | File | What to Port |
|----------|------|-------------|
| P0 | `/root/MultiCurrencyWallet/src/common/utils/mnemonic.ts` | BIP39 generation/validation, BIP44 derivation for BTC and ETH |
| P0 | `/root/MultiCurrencyWallet/src/common/utils/coin/btc.ts` | UTXO fetch, selection, PSBT build, fee calc, broadcast |
| P0 | `/root/MultiCurrencyWallet/src/front/shared/redux/actions/ethLikeAction.ts` | EVM send (gas estimate, sign, broadcast), balance fetch |
| P0 | `/root/MultiCurrencyWallet/src/front/shared/redux/actions/erc20LikeAction.ts` | Token transfer, balance fetch, approve |
| P1 | `/root/MultiCurrencyWallet/src/common/utils/apiLooper.ts` | Failover HTTP client pattern |
| P1 | `/root/MultiCurrencyWallet/src/common/helpers/ethLikeHelper.ts` | Gas price estimation |
| P1 | `/root/MultiCurrencyWallet/src/common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS.ts` | Default gas limits/prices, BTC fee rates |
| P1 | `/root/MultiCurrencyWallet/src/common/helpers/constants/TRANSACTION.ts` | BTC transaction size constants |
| P2 | `/root/MultiCurrencyWallet/src/front/config/mainnet/api.js` | API endpoint URLs and keys |
| P2 | `/root/MultiCurrencyWallet/src/front/config/mainnet/web3.js` | RPC endpoint URLs |
| P2 | `/root/MultiCurrencyWallet/src/front/config/mainnet/evmNetworks.js` | Chain IDs and network metadata |
| P2 | `/root/MultiCurrencyWallet/src/front/config/mainnet/erc20.js` + `bep20.js` + `erc20matic.js` | Default token lists |
| P2 | `/root/MultiCurrencyWallet/src/core/swap.app/util/typeforce.ts` | Address validation regexes |
